import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@dawa/followups/v1';
const VALID_STATUSES = new Set(['better', 'same', 'worse']);

export async function loadFollowUps() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && !Array.isArray(parsed) && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveFollowUp(chatId, { status, note = '', recordedAt = new Date().toISOString() }) {
  if (!chatId || !VALID_STATUSES.has(status)) throw new Error('Invalid follow-up');
  const followUps = await loadFollowUps();
  followUps[chatId] = { status, note: String(note || ''), recordedAt };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(followUps));
  return followUps;
}
