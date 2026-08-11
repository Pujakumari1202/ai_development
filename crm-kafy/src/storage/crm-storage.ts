/**
 * CRM persistence layer.
 *
 * Today: AsyncStorage (local demo).
 * Later: replace load/save/reset bodies with HTTP calls to your API.
 * Keep the same function signatures so hooks/screens stay unchanged.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createSeedData } from "@/data/mock-data";
import type { CRMData } from "@/types/crm";

/** Bump when seed shape changes so demos re-seed cleanly. */
const STORAGE_KEY = "crm-kafy.demo-data.v3";

export async function loadCrmData(): Promise<CRMData> {
  // API swap: GET /api/crm
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedData();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as CRMData;
  } catch (error) {
    console.warn("Failed to load CRM data; reseeding.", error);
    const seed = createSeedData();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

export async function saveCrmData(data: CRMData): Promise<void> {
  // API swap: PUT /api/crm
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function resetCrmData(): Promise<CRMData> {
  // API swap: POST /api/crm/reset (dev only)
  const seed = createSeedData();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}
