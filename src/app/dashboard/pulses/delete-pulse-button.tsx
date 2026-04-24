"use client";

import { Button } from "@/components/ui/button";
import { pulseDeleteAction } from "@/lib/actions/pulses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { type Pulse } from "@/lib/types";

export function DeletePulseButton({ pulseId }: { pulseId: string }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("pulseId", pulseId);
      return pulseDeleteAction({}, formData);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["pulses"] });

      const previous = queryClient.getQueryData(["pulses"]);
      queryClient.setQueryData(["pulses"], (old: Pulse[]) =>
        old.filter((p) => p.id !== pulseId),
      );
      return { previous }; // returned as context
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["pulses"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pulses"] });
    },
  });

  return (
    <Button
      type="button"
      onClick={() => mutate()}
      variant="destructive"
      size="icon"
      disabled={isPending}
    >
      <Trash2 size={14} />
    </Button>
  );
}
