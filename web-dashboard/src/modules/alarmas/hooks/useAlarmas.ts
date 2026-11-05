import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlarmas, atenderAlarma, cerrarAlarma } from "../services/alarmasApi";
import type { Alarma } from "../../../shared/types/alarma";

export function useAlarmas() {
  return useQuery<Alarma[]>({
    queryKey: ["alarmas"],
    queryFn: getAlarmas,
    refetchInterval: 30_000, // Refresco automático cada 30s
  });
}

export function useAtenderAlarma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => atenderAlarma(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alarmas"] }),
  });
}

export function useCerrarAlarma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cerrarAlarma(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alarmas"] }),
  });
}
