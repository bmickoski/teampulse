"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pulseEditAction } from "@/lib/actions/pulses";
import { pulsesFormSchema, type PulsesFormValues } from "@/lib/validations/pulses";
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

  const { register, handleSubmit, control, reset } = useForm<PulsesFormValues>({
    resolver: zodResolver(pulsesFormSchema),
    defaultValues: { title, description: description ?? "", status: status as PulsesFormValues["status"] },
  });

  useEffect(() => {
    if (open) reset({ title, description: description ?? "", status: status as PulsesFormValues["status"] });
  }, [open, title, description, status, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => pulseEditAction({}, formData),
    onMutate: async (formData: FormData) => {
      await queryClient.cancelQueries({ queryKey: ["pulses"] });
      const previous = queryClient.getQueryData(["pulses"]);
      queryClient.setQueryData(["pulses"], (old: Pulse[]) =>
        old.map((p) =>
          p.id === id
            ? {
                ...p,
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                status: formData.get("status") as string,
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

  const onSubmit = (data: PulsesFormValues) => {
    const formData = new FormData();
    formData.append("pulseId", id);
    formData.append("title", data.title);
    formData.append("description", data.description ?? "");
    formData.append("status", data.status);
    mutate(formData);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
        <Pencil size={14} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit pulse</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Q2 Website Redesign"
                {...register("title")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="What is this pulse about?"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("description")}
              />
            </div>

            <div className="space-y-1.5">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
