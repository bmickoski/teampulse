"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePasswordAction } from "@/lib/actions/password";
import { updatePasswordActionState } from "@/lib/validations/password";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";

export default function PasswordChange() {
  const [state, setState] = useState<updatePasswordActionState>({});
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updatePasswordAction(state, formData);
      setState(result);
      if (result.success) {
        setState({});
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Current password
          </label>
        </div>
        <Input
          id="password"
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {state.errors?.currentPassword && (
          <p className="text-xs text-red-600">
            {state.errors.currentPassword[0]}
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
          name="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {state.errors?.password && (
          <p className="text-xs text-red-600">{state.errors.password[0]}</p>
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
          name="confirmPassword"
          required
          autoComplete="confirm-new-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {state.errors?.confirmPassword && (
          <p className="text-xs text-red-600">
            {state.errors.confirmPassword[0]}
          </p>
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
