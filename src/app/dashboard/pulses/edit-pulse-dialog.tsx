"use client";
import { useState, useTransition } from "react";
import { pulseEditAction } from "@/lib/actions/pulses";
import { type PulsesActionState } from "@/lib/validations/pulses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Pulse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
};

export function EditPulseDialog({ id, title, description, status }: Pulse) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<PulsesActionState>({});
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await pulseEditAction(state, formData);
      setState(result);
      if (result.success) {
        setOpen(false);
        setState({});
        queryClient.invalidateQueries({ queryKey: ["pulses"] });
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setState({});
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Pencil />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit pulse</DialogTitle>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4 mt-2">
            {state.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <input type="hidden" name="pulseId" value={id} />

            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g. Q2 Website Redesign"
                defaultValue={title}
              />
              {state.errors?.title && (
                <p className="text-xs text-red-600">{state.errors.title[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="What is this pulse about?"
                defaultValue={description ?? ""}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Select key={status} name="status" defaultValue={status}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
