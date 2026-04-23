"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrganizationAction } from "@/lib/actions/organizations";
import { organizationsFormSchema, type OrganizationsFormValues } from "@/lib/validations/organizations";

export default function OrganizationSettings({
  name,
  defaultSlug,
}: {
  name: string;
  defaultSlug: string;
}) {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationsFormValues>({
    resolver: zodResolver(organizationsFormSchema),
    defaultValues: { name, slug: defaultSlug },
  });

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slug = e.target.value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setValue("slug", slug, { shouldValidate: true });
  }

  const onSubmit = async (data: OrganizationsFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug);
    const result = await updateOrganizationAction({}, formData);
    if (result.error) {
      setSuccess(false);
      setError("root", { message: result.error });
    } else {
      setSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      {errors.root && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Organization updated successfully.
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. Acme Corp"
          {...register("name", { onChange: handleNameChange })}
        />
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          placeholder="e.g. acme-corp"
          {...register("slug")}
        />
        {errors.slug && (
          <p className="mt-1.5 text-xs text-red-600">{errors.slug.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  );
}
