import { VALID_VERTEBRAE } from "@/lib/spineConfig";
import type { SpineMapData, SpineMapTechnique } from "@/types/spineMap";

export function spineDataToUI(data: Partial<SpineMapData> | undefined): SpineMapData {
  const rawAdjusted = Array.isArray(data?.adjusted) ? data.adjusted : [];
  const rawTechniques = Array.isArray(data?.techniques) ? data.techniques : [];

  const adjusted = rawAdjusted.filter((v): v is string => VALID_VERTEBRAE.includes(v));

  const techniques = rawTechniques.filter(
    (t): t is SpineMapTechnique =>
      typeof t === "object" &&
      t !== null &&
      typeof t.vertebra === "string" &&
      adjusted.includes(t.vertebra) &&
      typeof t.technique === "string",
  );

  return {
    adjusted,
    techniques,
    notes: typeof data?.notes === "string" ? data.notes : undefined,
  };
}

export function uiToSpinePayload(state: SpineMapData): SpineMapData {
  const adjustedSet = new Set(state.adjusted);

  const techniques = state.techniques.filter((t) => adjustedSet.has(t.vertebra));

  return {
    adjusted: [...state.adjusted],
    techniques,
    notes: state.notes,
  };
}
