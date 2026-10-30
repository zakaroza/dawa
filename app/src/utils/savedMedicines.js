import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'savedMedicines_v1';

function medicinesKey(profileId) {
  return profileId ? `${KEY}/${profileId}` : KEY;
}

export async function loadSavedMedicines(profileId) {
  try {
    const raw = await AsyncStorage.getItem(medicinesKey(profileId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveMedicine(medicine, profileId) {
  try {
    const current = await loadSavedMedicines(profileId);
    const already = current.some((m) => m.name === medicine.name);
    if (already) return current;
    const next = [{ ...medicine, savedAt: new Date().toISOString() }, ...current];
    await AsyncStorage.setItem(medicinesKey(profileId), JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function unsaveMedicine(medicineName, profileId) {
  try {
    const current = await loadSavedMedicines(profileId);
    const next = current.filter((m) => m.name !== medicineName);
    await AsyncStorage.setItem(medicinesKey(profileId), JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}
