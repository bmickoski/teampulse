"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileEditAction } from "@/lib/actions/profile";
import { ProfileActionState } from "@/lib/validations/profile";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";

export default function ProfileSettings({ name }: { name: string }) {
  const [state, setState] = useState<ProfileActionState>({});
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await profileEditAction(state, formData);
      setState(result);
      if (result.success) {
        setState({});
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 mt-2">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="e.g. Q2 Website Redesign"
          defaultValue={name}
        />
        {state.errors?.name && (
          <p className="text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  );
}
