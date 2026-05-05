"use client";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { OnboardingCard } from "./onboarding-card";
import { useEffect } from "react";

export function OnboardingWrapper({
  orgId,
  hasPulse,
  hasMember,
}: {
  orgId: string;
  hasPulse: boolean;
  hasMember: boolean;
}) {
  const allDone = hasPulse && hasMember;
  const { dismissed, dismiss } = useOnboarding(orgId);

  useEffect(() => {
    if (allDone) {
      const timer = setTimeout(() => dismiss(), 2000);
      return () => clearTimeout(timer);
    }
  }, [allDone, dismiss]);

  if (dismissed) return null;
  return (
    <OnboardingCard
      hasPulse={hasPulse}
      hasMember={hasMember}
      onDismiss={dismiss}
    />
  );
}
