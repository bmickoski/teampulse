"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { pulsesAction } from "@/lib/actions/pulses";
import {
  pulsesFormSchema,
  type PulsesFormValues,
} from "@/lib/validations/pulses";
import { type Priority } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PULSE_TEMPLATES } from "@/lib/pulse-templates";

export function CreatePulseDialog() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PulsesFormValues>({
    resolver: zodResolver(pulsesFormSchema),
    defaultValues: { priority: "medium" },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      setServerError(null);
      setSelectedTemplate("");
    }
  }

  const onDefaultTemplate = (templateId: string | null) => {
    const template = PULSE_TEMPLATES.find((item) => item.id === templateId);

    if (template) {
      setSelectedTemplate(template.id);
      setValue("title", template.title, { shouldDirty: true });
      setValue("description", template.description, { shouldDirty: true });
      setValue("priority", template.priority as Priority, {
        shouldDirty: true,
      });
      setValue("status", template.status, { shouldDirty: true });
    } else {
      setSelectedTemplate("");
      setValue("title", "", { shouldDirty: true });
      setValue("description", "", { shouldDirty: true });
      setValue("priority", "medium", {
        shouldDirty: true,
      });
      setValue("status", "active", { shouldDirty: true });
    }
  };

  const onSubmit = async (data: PulsesFormValues) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("priority", data.priority ?? "medium");
    if (data.description) formData.append("description", data.description);
    if (data.dueDate) formData.append("dueDate", data.dueDate);
    const result = await pulsesAction({}, formData);
    if (result.error) {
      setServerError(result.error);
      toast.error(result.error);
    } else {
      handleOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["pulses"] });
      toast.success("Pulse created.");
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ New Pulse</Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new Pulse</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Select value={selectedTemplate} onValueChange={onDefaultTemplate}>
              <SelectTrigger id="template" className="w-full">
                <SelectValue placeholder="Choose predefined template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No template</SelectItem>
                {PULSE_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                <p className="text-xs text-red-600">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="priority"
                      className="w-full sm:w-[180px]"
                    >
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
                )}
              />
            </div>

            {serverError && (
              <p className="text-xs text-red-600">{serverError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
