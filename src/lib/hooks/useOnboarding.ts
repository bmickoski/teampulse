import { useState } from "react";

export function useOnboarding(orgId: string) {
  const key = `onboarding-dismissed-${orgId}`;

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(key) === "true";
  });

  function dismiss() {
    localStorage.setItem(key, "true");
    setDismissed(true);
  }

  return { dismissed, dismiss };
}
