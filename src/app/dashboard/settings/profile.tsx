"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileEditAction } from "@/lib/actions/profile";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validations/profile";

export default function ProfileSettings({ name }: { name: string }) {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    const result = await profileEditAction({}, formData);
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
          Profile updated successfully.
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. John Doe"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
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
