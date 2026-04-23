"use client";
import { useRef, useState } from "react";
import { pulseEditAction } from "@/lib/actions/pulses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      return pulseEditAction({}, formData);
    },

    onMutate: async (formData: FormData) => {
      const newTitle = formData.get("title") as string;
      const newDescription = formData.get("description") as string;
      const newStatus = formData.get("status") as string;

      await queryClient.cancelQueries({ queryKey: ["pulses"] });

      const previous = queryClient.getQueryData(["pulses"]);
      queryClient.setQueryData(["pulses"], (old: Pulse[]) =>
        old.map((p) =>
          p.id === id
            ? {
                ...p,
                title: newTitle,
                description: newDescription,
                status: newStatus,
              }
            : p,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["pulses"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pulses"] });
    },
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Pencil />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit pulse</DialogTitle>
          </DialogHeader>

          <form ref={formRef} className="space-y-4 mt-2">
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const formData = new FormData(formRef.current!);
                  mutate(formData);
                  setOpen(false);
                }}
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
