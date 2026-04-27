export interface SpineRegion {
  name: "cervical" | "thoracic" | "lumbar" | "sacrum" | "coccyx";
  label: string;
  color: string;
  vertebrae: string[];
  startY: number;
}

export const SPINE_REGIONS: SpineRegion[] = [
  { name: "cervical",  label: "Cervical",  color: "#e0f2fe", vertebrae: ["C1","C2","C3","C4","C5","C6","C7"],                                        startY: 20  },
  { name: "thoracic",  label: "Torácica",  color: "#f0fdf4", vertebrae: ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"],              startY: 210 },
  { name: "lumbar",    label: "Lombar",    color: "#fef9c3", vertebrae: ["L1","L2","L3","L4","L5"],                                                    startY: 480 },
  { name: "sacrum",    label: "Sacro",     color: "#fee2e2", vertebrae: ["S1"],                                                                        startY: 550 },
  { name: "coccyx",   label: "Cóccix",    color: "#fce7f3", vertebrae: ["Co"],                                                                        startY: 576 },
];

export const VALID_VERTEBRAE = SPINE_REGIONS.flatMap((r) => r.vertebrae);

export const VERTEBRA_HEIGHT = 22;
export const VERTEBRA_WIDTH  = 180;
export const REGION_GAP      = 6;
export const CANVAS_WIDTH    = 200;
export const CANVAS_HEIGHT   = 610;
