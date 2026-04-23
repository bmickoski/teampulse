"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { updatePasswordAction } from "@/lib/actions/password";
import { updatePasswordFormValues, updatePasswordSchema } from "@/lib/validations/password";

export default function PasswordChange() {
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
      setError("root", { message: result.error });
      toast.error(result.error);
    } else {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
          Current password
        </label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="mt-1.5 text-xs text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
          New password
        </label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirm new password
        </label>
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}
