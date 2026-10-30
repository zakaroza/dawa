import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const KEY = '@dawa/reminders/v1';
const LEGACY_KEY = '@dawa_reminders';

function pad(value) {
  return String(value).padStart(2, '0');
}

function parseTime(value) {
  if (typeof value === 'string') {
    const [hour, minute] = value.split(':').map(Number);
    if (Number.isFinite(hour) && Number.isFinite(minute)) return { hour, minute };
  }
  if (value && Number.isFinite(value.hour) && Number.isFinite(value.minute)) {
    return { hour: value.hour, minute: value.minute };
  }
  return null;
}

export function normalizeReminder(reminder) {
  const timeSlots = (Array.isArray(reminder?.timeSlots) ? reminder.timeSlots : reminder?.times || [])
    .map(parseTime)
    .filter(Boolean);
  const times = timeSlots.map((slot) => `${pad(slot.hour)}:${pad(slot.minute)}`);
  const profileIds = Array.isArray(reminder?.profileIds)
    ? reminder.profileIds.filter(Boolean)
    : reminder?.profileId ? [reminder.profileId] : [];
  const frequency = Number(reminder?.frequency ?? reminder?.timesPerDay ?? times.length ?? 0) || 1;
  const startDate = reminder?.startDate
    || (typeof reminder?.createdAt === 'string' ? reminder.createdAt.slice(0, 10) : todayDateKey());

  return {
    ...reminder,
    frequency,
    timesPerDay: frequency,
    times,
    timeSlots,
    profileIds,
    profileId: reminder?.profileId ?? profileIds[0] ?? null,
    startDate,
    noEndDate: reminder?.noEndDate ?? !(reminder?.endDate || reminder?.durationDays),
    notes: reminder?.notes ?? reminder?.instructions ?? null,
    instructions: reminder?.instructions ?? reminder?.notes ?? null,
  };
}

export function todayDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isReminderActiveOnDate(reminder, dateKey = todayDateKey()) {
  const normalized = normalizeReminder(reminder);
  if (normalized.startDate && dateKey < normalized.startDate.slice(0, 10)) return false;

  if (normalized.endDate) {
    const endKey = new Date(normalized.endDate).toISOString().slice(0, 10);
    if (dateKey > endKey) return false;
  }

  if (!normalized.noEndDate && normalized.durationDays && normalized.startDate) {
    const start = new Date(`${normalized.startDate.slice(0, 10)}T12:00:00`);
    const target = new Date(`${dateKey}T12:00:00`);
    const elapsedDays = Math.floor((target.getTime() - start.getTime()) / 86400000);
    if (elapsedDays >= Number(normalized.durationDays)) return false;
  }

  return true;
}

export function calculateAdherenceStreak(reminders, adherenceLog, now = new Date()) {
  const normalized = (Array.isArray(reminders) ? reminders : []).map(normalizeReminder);
  if (normalized.length === 0) return 0;
  const earliestStart = normalized
    .map((reminder) => reminder.startDate?.slice(0, 10))
    .filter(Boolean)
    .sort()[0];

  let streak = 0;
  for (let offset = 0; offset < 3650; offset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    const dateKey = todayDateKey(date);
    if (earliestStart && dateKey < earliestStart) break;
    const scheduled = normalized.filter((reminder) => isReminderActiveOnDate(reminder, dateKey));
    if (scheduled.length === 0) continue;
    const allTaken = scheduled.every((reminder) => {
      const status = adherenceLog?.[reminder.id]?.[dateKey];
      return status === true || status === 'taken';
    });
    if (!allTaken) break;
    streak += 1;
  }
  return streak;
}

export async function loadReminders() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeReminder) : [];
    }
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    if (!legacyRaw) return [];
    const legacyReminders = JSON.parse(legacyRaw);
    const migrated = Array.isArray(legacyReminders) ? legacyReminders.map(normalizeReminder) : [];
    await AsyncStorage.setItem(KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
}

async function persist(list) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function addReminder(reminder) {
  const list = await loadReminders();
  const updated = [normalizeReminder(reminder), ...list.filter((item) => item.id !== reminder.id)];
  await persist(updated);
  return updated;
}

export async function deleteReminder(id) {
  const list = await loadReminders();
  const target = list.find((r) => r.id === id);
  if (target?.notificationIds?.length) {
    await Promise.allSettled(
      target.notificationIds.map((nid) =>
        Notifications.cancelScheduledNotificationAsync(nid).catch(() => {})
      )
    );
  }
  const updated = list.filter((r) => r.id !== id);
  await persist(updated);
  return updated;
}

export async function purgeExpiredReminders() {
  const list = await loadReminders();
  const now = Date.now();
  const expired = list.filter((r) => r.endDate && new Date(r.endDate).getTime() < now);
  for (const r of expired) {
    if (r.notificationIds?.length) {
      await Promise.allSettled(
        r.notificationIds.map((nid) =>
          Notifications.cancelScheduledNotificationAsync(nid).catch(() => {})
        )
      );
    }
  }
  const updated = list.filter((r) => !r.endDate || new Date(r.endDate).getTime() >= now);
  if (expired.length > 0) await persist(updated);
  return updated;
}
