"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { pulseEditAction } from "@/lib/actions/pulses";
import { type Member, type Pulse } from "@/lib/types";
import {
  pulsesFormSchema,
  type PulsesFormValues,
} from "@/lib/validations/pulses";
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

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export function EditPulseDialog({
  id,
  title,
  description,
  status,
  dueDate,
  assigneeIds,
  members,
}: Pulse & { members: Member[] | null }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, reset } = useForm<PulsesFormValues>({
    resolver: zodResolver(pulsesFormSchema),
    defaultValues: {
      title,
      description: description ?? "",
      status: status as PulsesFormValues["status"],
      dueDate: toDateInputValue(dueDate),
      assigneeIds: assigneeIds ?? [],
    },
  });

  useEffect(() => {
    if (open)
      reset({
        title,
        description: description ?? "",
        status: status as PulsesFormValues["status"],
        dueDate: toDateInputValue(dueDate),
        assigneeIds: assigneeIds ?? [],
      });
  }, [open, title, description, status, dueDate, assigneeIds, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => pulseEditAction({}, formData),
    onError: () => {
      toast.error("Failed to update pulse.");
    },
    onSuccess: () => {
      toast.success("Pulse updated.");
      queryClient.invalidateQueries({ queryKey: ["pulses"] });
    },
  });

  const onSubmit = (data: PulsesFormValues) => {
    const formData = new FormData();
    formData.append("pulseId", id);
    formData.append("title", data.title);
    formData.append("description", data.description ?? "");
    formData.append("status", data.status ?? "active");
    formData.append("dueDate", data.dueDate ?? "");
    // remove any existing assigneeIds first,
    // then append each
    data.assigneeIds?.forEach((id) => formData.append("userId", id));
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
              <Label htmlFor="dueDate">
                Due date{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
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

            {members && members.length > 0 && (
              <div className="space-y-1.5">
                <Label>Assignees</Label>
                <div className="space-y-2 max-h-36 overflow-y-auto rounded-md border border-input p-2">
                  {members.map((member) => (
                    <label
                      key={member.userId}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={member.userId}
                        {...register("assigneeIds")}
                        className="rounded"
                      />
                      <span>{member.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {member.role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
