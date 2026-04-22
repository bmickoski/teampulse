"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrganizationAction } from "@/lib/actions/organizations";
import { OrganizationsActionState } from "@/lib/validations/organizations";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";

export default function OrganizationSettings({
  name,
  defaultSlug,
}: {
  name: string;
  defaultSlug: string;
}) {
  const [state, setState] = useState<OrganizationsActionState>({});
  const [slug, setSlug] = useState(defaultSlug);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateOrganizationAction(state, formData);
      setState(result);
      if (result.success) {
        setState({});
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }
    });
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    );
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
          onChange={handleNameChange}
        />
        {state.errors?.name && (
          <p className="text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700"
        >
          Slug
        </label>
        <input
          id="slug"
          type="text"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          placeholder="Enter Slug (e.g. my-organization)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {state.errors?.slug && (
          <p className="mt-1.5 text-xs text-red-600">{state.errors.slug[0]}</p>
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
