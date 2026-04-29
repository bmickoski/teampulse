export type Pulse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  assigneeIds: string[];
};

export type ActivityLog = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
};

export type Member = {
  userId: string;
  role: string;
  name: string;
  email: string;
};
