"use server";
import bcrypt from "bcryptjs";
import { usersTable } from "@/db/schema";
import { db } from "@/db";
import {
  signUpFormSchema,
  type SignUpActionState,
} from "@/lib/validations/auth";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type SignInActionState = { error?: string };

export async function signInAction(
  _prev: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error; // re-throw, Next.js redirect works by throwing internally
  }
  return {};
}

export async function signUpAction(
  _prev: SignUpActionState,
  formData: FormData,
): Promise<SignUpActionState> {
  const form = Object.fromEntries(formData);
  const validationResult = signUpFormSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }
  const { name, email, password } = validationResult.data;

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await db.insert(usersTable).values({ name, email, passwordHash });
  } catch {
    return { errors: { email: ["Email already in use"] } };
  }

  await signIn("credentials", { email, password, redirectTo: "/create-organization" });
  return {};
}
