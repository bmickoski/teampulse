"use client";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { OnboardingCard } from "./onboarding-card";

export function OnboardingWrapper({
  orgId,
  hasPulse,
  hasMember,
}: {
  orgId: string;
  hasPulse: boolean;
  hasMember: boolean;
}) {
  const { dismissed, dismiss } = useOnboarding(orgId);
  if (dismissed) return null;
  return <OnboardingCard hasPulse={hasPulse} hasMember={hasMember} onDismiss={dismiss} />;
}
