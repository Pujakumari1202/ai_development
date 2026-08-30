import AsyncStorage from "@react-native-async-storage/async-storage";

import { createSeedData } from "@/data/mock-data";
import { apiRequest } from "@/services/api";
import type { CRMData } from "@/types/crm";

const STORAGE_KEY = "crm-kafy.demo-data.v3";
const USE_LOCAL_DATA = process.env.EXPO_PUBLIC_USE_LOCAL_DATA === "true";

export async function loadCrmData(): Promise<CRMData> {
  if (!USE_LOCAL_DATA) {
    return apiRequest<CRMData>("/api/crm");
  }
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
  if (!USE_LOCAL_DATA) {
    await apiRequest<CRMData>("/api/crm", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function resetCrmData(): Promise<CRMData> {
  const seed = createSeedData();
  if (!USE_LOCAL_DATA) {
    return apiRequest<CRMData>("/api/crm/reset", {
      method: "POST",
      body: JSON.stringify(seed),
    });
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}
