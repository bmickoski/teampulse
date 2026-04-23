"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { updatePasswordAction } from "@/lib/actions/password";
import {
  updatePasswordFormValues,
  updatePasswordSchema,
} from "@/lib/validations/password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function PasswordChange() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<updatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: updatePasswordFormValues) => {
    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    const result = await updatePasswordAction({}, formData);
    if (result?.error) {
      setSuccess(false);
      setError("root", { message: result.error });
    } else {
      reset();
      setSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Password updated successfully.
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
          Current password
        </label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700"
          >
            New password
          </label>
        </div>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="confirm-new-password"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm new password
          </label>
        </div>
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="confirm-new-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  );
}
