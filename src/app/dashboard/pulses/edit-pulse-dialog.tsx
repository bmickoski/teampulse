"use client";
import { useEffect, useMemo, useState } from "react";
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
  priority,
  assigneeIds,
  members,
}: Pulse & { members: Member[] | null }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const queryClient = useQueryClient();

  const filteredMembers = useMemo(() => {
    const query = assigneeSearch.trim().toLowerCase();
    if (!members || query.length === 0) return members ?? [];

    return members.filter((member) =>
      [member.name, member.email, member.role].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [assigneeSearch, members]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PulsesFormValues>({
    resolver: zodResolver(pulsesFormSchema),
    defaultValues: {
      title,
      description: description ?? "",
      status: status as PulsesFormValues["status"],
      dueDate: toDateInputValue(dueDate),
      assigneeIds: assigneeIds ?? [],
      priority: priority ?? "medium",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title,
        description: description ?? "",
        status: status as PulsesFormValues["status"],
        dueDate: toDateInputValue(dueDate),
        assigneeIds: assigneeIds ?? [],
        priority: priority,
      });
    }
  }, [open, title, description, status, dueDate, assigneeIds, priority, reset]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setServerError(null);
      setAssigneeSearch("");
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await pulseEditAction({}, formData);
      if (result.error || result.errors) {
        throw new Error(result.error ?? "Failed to update pulse.");
      }
      return result;
    },
    onError: () => {
      setServerError("Failed to update pulse.");
      toast.error("Failed to update pulse.");
    },
    onSuccess: () => {
      toast.success("Pulse updated.");
      setOpen(false);
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
    formData.append("priority", data.priority ?? "medium");
    data.assigneeIds?.forEach((id) => formData.append("userId", id));
    mutate(formData);
  };

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
        <Pencil size={14} />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
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
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              )}
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
              {errors.description && (
                <p className="text-xs text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate">
                Due date{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-xs text-red-600">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status" className="w-full">
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

              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue placeholder="Choose priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>

            {members && members.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Label>Assignees</Label>
                  <span className="text-xs text-gray-400">
                    {members.length} teammate{members.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {members.length > 5 && (
                  <Input
                    type="search"
                    value={assigneeSearch}
                    onChange={(event) => setAssigneeSearch(event.target.value)}
                    placeholder="Search assignees..."
                  />
                )}
                <div className="space-y-2 max-h-44 overflow-y-auto rounded-md border border-input p-2">
                  {filteredMembers.length === 0 ? (
                    <p className="px-1 py-2 text-sm text-gray-400">
                      No teammates found.
                    </p>
                  ) : (
                    filteredMembers.map((member) => (
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
                    ))
                  )}
                </div>
              </div>
            )}

            {serverError && (
              <p className="text-xs text-red-600">{serverError}</p>
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
