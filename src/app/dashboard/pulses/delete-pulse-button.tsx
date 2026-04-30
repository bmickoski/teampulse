"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pulseDeleteAction } from "@/lib/actions/pulses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function DeletePulseButton({
  pulseId,
  pulseTitle,
}: {
  pulseId: string;
  pulseTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("pulseId", pulseId);
      const result = await pulseDeleteAction({}, formData);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onError: () => {
      toast.error("Failed to delete pulse.");
    },
    onSuccess: () => {
      setOpen(false);
      toast.success("Pulse deleted.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pulses"] });
    },
  });

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="destructive"
        size="icon"
        disabled={isPending}
      >
        <Trash2 size={14} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete pulse?</DialogTitle>
            <DialogDescription>
              {pulseTitle
                ? `This will remove "${pulseTitle}" from your workspace.`
                : "This will remove the pulse from your workspace."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => mutate()}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
