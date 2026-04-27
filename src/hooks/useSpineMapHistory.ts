import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { SpineMapHistoryEntry } from "@/types/spineMap";

export function useSpineMapHistory(patientId: string, page = 1) {
  return useQuery({
    queryKey: ["spineMapHistory", patientId, page],
    queryFn: async () => {
      const { data } = await api.get("/prontuario/coluna/", {
        params: { paciente: patientId, page, page_size: 10 },
      });
      return data as SpineMapHistoryEntry[];
    },
    enabled: !!patientId,
  });
}
