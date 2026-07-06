import type { Timestamp } from "firebase/firestore";

export function tsToIso(value: Timestamp | Date | string | null | undefined): string {
  if (!value) return new Date(0).toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date(0).toISOString();
}
