import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@dawa/adherence/v1';
const LEGACY_KEY = '@dawa_adherence';

function normalizeLog(log) {
  if (!log || typeof log !== 'object' || Array.isArray(log)) return {};
  return Object.fromEntries(Object.entries(log).map(([reminderId, entries]) => [
    reminderId,
    Object.fromEntries(Object.entries(entries || {}).map(([date, value]) => [
      date,
      value === true || value === 'taken' ? true : value === false || value === 'skipped' ? false : value,
    ])),
  ]));
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function loadLog() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return normalizeLog(JSON.parse(raw));
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    if (!legacyRaw) return {};
    const migrated = normalizeLog(JSON.parse(legacyRaw));
    await AsyncStorage.setItem(KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return {};
  }
}

export async function markDose(reminderId, dateKey, status) {
  const log = await loadLog();
  if (!log[reminderId]) log[reminderId] = {};
  if (status == null) {
    delete log[reminderId][dateKey];
  } else {
    log[reminderId][dateKey] = status === true || status === 'taken';
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(log));
  return log;
}

export async function markSlotDose(reminderId, dateKey, timeStr, status) {
  const log = await loadLog();
  if (!log[reminderId]) log[reminderId] = {};
  const current = log[reminderId][dateKey];
  const slotMap = (current && typeof current === 'object' && !Array.isArray(current))
    ? { ...current }
    : {};
  if (status == null) {
    delete slotMap[timeStr];
  } else {
    slotMap[timeStr] = status === true || status === 'taken';
  }
  log[reminderId][dateKey] = slotMap;
  await AsyncStorage.setItem(KEY, JSON.stringify(log));
  return log;
}

export function isDoseTaken(status) {
  return status === true || status === 'taken';
}

export function isDoseMissed(status) {
  return status === false || status === 'skipped';
}

export function isAllSlotsTaken(slotMap) {
  if (!slotMap || typeof slotMap !== 'object') return false;
  const values = Object.values(slotMap);
  return values.length > 0 && values.every((value) => value === true);
}

export function isAllSlotsMissed(slotMap) {
  if (!slotMap || typeof slotMap !== 'object') return false;
  const values = Object.values(slotMap);
  return values.length > 0 && values.every((value) => value === false);
}

export function isPartiallyTaken(slotMap) {
  if (!slotMap || typeof slotMap !== 'object') return false;
  const values = Object.values(slotMap);
  return values.some((value) => value === true) && !values.every((value) => value === true);
}

export function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(todayKey(d));
  }
  return days;
}
