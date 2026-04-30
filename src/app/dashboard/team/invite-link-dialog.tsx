"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInviteTokenAction } from "@/lib/actions/inviteToken";
import { Link } from "lucide-react";

export function InviteLinkDialog() {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setLoading(true);
    try {
      const token = await createInviteTokenAction();
      setLink(`${window.location.origin}/join/${token}`);
      setOpen(true);
    } catch {
      toast.error("Failed to generate invite link.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard.");
  }

  return (
    <>
      <Button variant="outline" onClick={handleOpen} disabled={loading}>
        <Link size={14} className="mr-1.5" />
        {loading ? "Generating..." : "Invite link"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite via link</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Share this link. It expires in 7 days and can only be used once.
          </p>
          <div className="flex gap-2 mt-2">
            <Input readOnly value={link ?? ""} className="text-xs" />
            <Button onClick={handleCopy}>Copy</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
