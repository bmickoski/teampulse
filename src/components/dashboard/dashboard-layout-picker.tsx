"use client";

import { useState, useTransition } from "react";
import { saveDashboardLayout } from "@/lib/actions/dashboardLayout";
import { Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ALL_CHARTS = [
  { id: "status", label: "Pulse status" },
  { id: "workload", label: "Workload per member" },
  { id: "timeline", label: "Pulses over time" },
];

type Props = {
  initialLayout: string[];
};

export function DashboardLayoutPicker({ initialLayout }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initialLayout);
  const [isPending, startTransition] = useTransition();

  const openModal = () => {
    setDraft(initialLayout);
    setOpen(true);
  };

  const toggle = (id: string) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const save = () => {
    startTransition(async () => {
      await saveDashboardLayout(draft);
      setOpen(false);
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={openModal}>
          <Settings2 size={14} className="mr-1.5" />
          Customize
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Customize dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {ALL_CHARTS.map((chart) => (
              <label
                key={chart.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={draft.includes(chart.id)}
                  onChange={() => toggle(chart.id)}
                  className="rounded"
                />
                <span className="text-sm">{chart.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
