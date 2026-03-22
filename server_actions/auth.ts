"use server";
import { createUser } from "@/lib/auth";
import { LoginSchema, SignupSchema } from "@/schemas/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

async function login(
  prevState: { success?: boolean; error?: string },
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  console.log("Login with:", { email, password });
  try {
    const validatedData = LoginSchema.parse({ email, password });
    console.log("Validated login data:", validatedData);
    await signIn("credentials", {
      email: validatedData.email,
      password: password,
      redirect: false,
    });
    console.log("Login successful for user:", validatedData.email);
    return { success: true, error: undefined };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid credentials." };
        default:
          return { success: false, error: "Something went wrong." };
      }
    }
    console.error("Login error:", error);
    return {
      success: false,
      error: "Invalid credentials format or login error",
    };
  }
}
async function signUp(
  prevState: { success?: boolean; error?: string },
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  console.log("Sign up with:", { email, password });
  try {
    const validatedData = SignupSchema.parse({ email, password });
    console.log("Validated signup data:", validatedData);
    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);
    try {
      const result = await createUser(validatedData.email, hash);
      console.log("User created in database:", result);
      return { success: true, error: undefined };
    } catch (dbError: any) {
      console.error("Database error during signup:", dbError);
      if (dbError.message.includes("already exists")) {
        return { success: false, error: "User with this email already exists" };
      }
      return { success: false, error: "Failed to create user account" };
    }
  } catch (error) {
    console.error("Signup validation error:", error);
    return { success: false, error: "Invalid credentials format" };
  }
}
export async function AuthAction(
  mode: "login" | "signup",
  prevState: { success?: boolean; error?: string },
  formData: FormData,
) {
  console.log("Auth action called with mode:", mode);
  if (mode === "login") return await login(prevState, formData);
  else return await signUp(prevState, formData);
}
