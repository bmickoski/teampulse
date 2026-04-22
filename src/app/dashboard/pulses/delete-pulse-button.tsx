"use client";

import { Button } from "@/components/ui/button";
import { pulseDeleteAction } from "@/lib/actions/pulses";
import { PulsesActionState } from "@/lib/validations/pulses";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";

export function DeletePulseButton({ pulseId }: { pulseId: string }) {
  const [state, setState] = useState<PulsesActionState>({});
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await pulseDeleteAction(state, formData);
      if (result.success) {
        setState({});
        queryClient.invalidateQueries({ queryKey: ["pulses"] });
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="pulseId" value={pulseId} />

      <Button type="submit" variant="destructive" disabled={isPending}>
        {isPending ? "Deleting..." : "X"}
      </Button>

      {state?.error ? (
        <p className="mt-1 text-xs text-red-500">{state.error}</p>
      ) : null}
    </form>
  );
}
