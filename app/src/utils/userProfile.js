import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILES_KEY = '@dawa/user-profiles/v1';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function loadProfiles() {
  try {
    const raw = await AsyncStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveProfiles(profiles) {
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function createEmptyProfile() {
  return {
    id: generateId(),
    name: '',
    age: '',
    sex: '',
    conditions: [],
    medications: [],
    allergies: [],
    pregnancyStatus: null,
    weight: null,
    adverseReactions: [],
  };
}
