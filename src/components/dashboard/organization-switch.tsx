"use client";

import { useState, useTransition } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { switchOrgAction } from "@/lib/actions/switchOrganization";
import { useRouter } from "next/navigation";

type Org = { orgId: string; name: string; role: string };

type Props = {
  orgs: Org[];
  currentOrgId: string;
};

export function OrgSwitcher({ orgs, currentOrgId }: Props) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const current = orgs.find((o) => o.orgId === currentOrgId);

  const handleSwitch = (orgId: string) => {
    setOpen(false);
    startTransition(async () => {
      await switchOrgAction(orgId);
      router.refresh();
    });
  };

  if (orgs.length <= 1)
    return (
      <p className="text-sm font-semibold text-gray-900 truncate">
        {current?.name}
      </p>
    );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 w-full text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate"
      >
        <span className="truncate">{current?.name}</span>
        <ChevronsUpDown size={14} className="shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute top-7 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {orgs.map((org) => (
            <button
              key={org.orgId}
              onClick={() => handleSwitch(org.orgId)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
            >
              <span className="flex-1 truncate">{org.name}</span>
              {org.orgId === currentOrgId && (
                <Check size={14} className="text-indigo-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
