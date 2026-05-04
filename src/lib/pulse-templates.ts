export const PULSE_TEMPLATES = [
  {
    id: "bug",
    label: "Bug Report",
    title: "",
    description: "**Steps to reproduce:**\n\n**Expected:**\n\n**Actual:**",
    priority: "high",
    status: "active",
  },
  {
    id: "feature",
    label: "Feature Request",
    title: "",
    description: "**Problem:**\n\n**Proposed solution:**",
    priority: "medium",
    status: "active",
  },
  {
    id: "task",
    label: "General Task",
    title: "",
    description: "",
    priority: "medium",
    status: "active",
  },
] as const;
