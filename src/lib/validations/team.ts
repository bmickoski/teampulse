import { z } from "zod";

export const inviteTeamMemberSchema = z.object({
  email: z.email({ message: "Please enter a valid email." }).trim(),
});

export type TeamActionState = {
  form?: {
    email?: string;
  };
  errors?: {
    email?: string[];
  };
  error?: string;
  success?: boolean;
};
