export type Pulse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
};

export type ActivityLog = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
};
