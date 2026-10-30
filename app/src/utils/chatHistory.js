import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@dawa/chat-history/v1';
const MAX_CHATS = 50;

function chatsKey(profileId) {
  return profileId ? `${STORAGE_KEY}/${profileId}` : STORAGE_KEY;
}

export function createChatId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createChatTitle(messages, fallback) {
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content?.trim();
  if (!firstUserMessage) return fallback;
  return firstUserMessage.length > 52 ? `${firstUserMessage.slice(0, 52).trim()}…` : firstUserMessage;
}

export async function loadStoredChats(profileId) {
  try {
    const raw = await AsyncStorage.getItem(chatsKey(profileId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((chat) => chat?.id && Array.isArray(chat.messages))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, MAX_CHATS);
  } catch {
    return [];
  }
}

export async function storeChats(chats, profileId) {
  const trimmed = chats
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, MAX_CHATS);
  await AsyncStorage.setItem(chatsKey(profileId), JSON.stringify(trimmed));
  return trimmed;
}
