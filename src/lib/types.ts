export type Pulse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  assigneeIds: string[];
  priority: Priority;
};

export type PulseDetail = Omit<Pulse, "assigneeIds"> & {
  creatorName: string | null;
};

export type Priority = "low" | "medium" | "high";

export type ActivityLog = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
};

export type NotificationType =
  | "general"
  | "comment"
  | "mention"
  | "assignment";

export type Member = {
  userId: string;
  role: string;
  name: string;
  email: string;
};
