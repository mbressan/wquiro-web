export type TechniqueOption =
  | "Diversificada"
  | "Thompson"
  | "Activator"
  | "Gonstead"
  | "Drop"
  | "SOT"
  | "Outro";

export interface SpineMapTechnique {
  vertebra: string;
  technique: TechniqueOption;
  notes?: string;
}

export interface SpineMapData {
  adjusted: string[];
  techniques: SpineMapTechnique[];
  notes?: string;
}

export interface SpineMapHistoryEntry {
  id: string;
  date: string;
  professional_name: string;
  spine_map: SpineMapData;
}
