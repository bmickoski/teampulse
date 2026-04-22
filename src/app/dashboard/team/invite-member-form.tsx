"use client";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InviteTeamActionState } from "@/lib/validations/team";
import { inviteMemberAction } from "@/lib/actions/team";

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<InviteTeamActionState>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await inviteMemberAction(state, formData);
      setState(result);
      if (result.success) {
        setOpen(false);
        setState({});
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setState({});
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite member</Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite member by given email</DialogTitle>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4 mt-2">
            {state.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="e.g. john.doe@example.com"
              />
              {state.errors?.email && (
                <p className="text-xs text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Inviting..." : "Invite"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
