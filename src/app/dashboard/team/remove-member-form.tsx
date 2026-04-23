"use client";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeamActionState } from "@/lib/validations/team";
import { removeMemberAction } from "@/lib/actions/team";

type RemoveMemberButtonProps = {
  memberName: string;
  memberEmail: string;
  memberId: string;
  memberRole: string;
};

export function RemoveMemberButton({
  memberId,
  memberName,
  memberEmail,
  memberRole,
}: RemoveMemberButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<TeamActionState>({});
  const [isPending, startTransition] = useTransition();

  if (memberRole === "owner") {
    return null;
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await removeMemberAction(state, formData);
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
      <Button
        variant="destructive"
        size="xs"
        type="button"
        onClick={() => setOpen(true)}
      >
        Remove
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove team member</DialogTitle>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4 mt-2">
            {state.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <input type="hidden" name="memberId" value={memberId} />

            <p className="text-sm text-gray-600">
              Are you sure you want to remove{" "}
              <span className="font-medium text-gray-900">{memberName}</span>{" "}
              from the team?
            </p>
            <p className="text-xs text-gray-500">{memberEmail}</p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "Removing..." : "Remove"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
