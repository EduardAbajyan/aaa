"use server";

import { createUser } from "@/lib/auth";
import { LoginSchema, SignupSchema } from "@/schemas/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user || !user.password) {
      console.log("User not found or no password set");
      return { success: false, error: "Invalid credentials" };
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      console.log("Login successful for user:", user.email);
      return { success: true, error: undefined };
    } else {
      console.log("Password mismatch for user:", user.email);
      return { success: false, error: "Invalid credentials" };
    }

  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Invalid credentials format" };
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
    // Validate signup credentials
    const validatedData = SignupSchema.parse({ email, password });
    console.log("Validated signup data:", validatedData);

    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);

    try {
      // Save user to database
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

// async function submitHandler(event: React.FormEvent<HTMLFormElement>) {
//   event.preventDefault();
//   if (isLogin) {
//     const result = await signIn("credentials", {
//       redirect: false,
//       email: event.currentTarget.email.value ?? "",
//       password: event.currentTarget.password.value ?? "",
//     });
//     if (!result.error) {
//       router.replace("/profile");
//     } else {
//       console.error(result.error);
//     }
//   } else {
//     const email = event.currentTarget.email.value;
//     const password = event.currentTarget.password.value;
//     try {
//       const result = await createUser(email, password);
//       console.log(result);
//     } catch (error) {
//       console.error(error);
//     }
//   }
// }
