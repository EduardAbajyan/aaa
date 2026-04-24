"use server";
import { createUser } from "@/lib/auth";
import {
  LoginSchema,
  SignupSchema,
  VerifyEmailSchema,
  ResendVerificationSchema,
} from "@/schemas/auth";
import {
  generateVerificationToken,
  verifyToken,
} from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

// Consistent type for all action states
export type ActionState = {
  success: boolean;
  error?: string;
  message?: string;
  needsVerification?: boolean;
  email?: string;
};

async function login(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const validatedData = LoginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    try {
      const result = await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (!result || result.error) {
        return { success: false, error: "Invalid credentials" };
      }

      return { success: true, message: "Login successful" };
    } catch (authError: any) {
      if (authError?.cause?.err?.message?.includes("EMAIL_NOT_VERIFIED")) {
        return {
          success: false,
          error:
            "Please verify your email before signing in. Check your inbox for a verification link.",
          needsVerification: true,
          email: validatedData.email,
        };
      }
      throw authError;
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Invalid credentials format or login error",
    };
  }
}
async function signUp(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  console.log("Sign up with:", { email, password });
  try {
    const validatedData = SignupSchema.parse({ email, password });
    console.log("Validated signup data:", validatedData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        if (existingUser.password) {
          return {
            success: false,
            error: "User with this email already exists",
          };
        } else {
          const salt = bcrypt.genSaltSync(10);
          const hash = await bcrypt.hash(password, salt);
          await prisma.user.update({
            where: { id: existingUser.id }, // 👈 which row
            data: { password: hash }, // 👈 what to change
          });
          return {
            success: true,
            message: "Password set successfully! You can now log in.",
          };
        }
      } else {
        // User exists but not verified - resend verification email
        const token = await generateVerificationToken(validatedData.email);
        await sendVerificationEmail({
          to: validatedData.email,
          token,
        });
        return {
          success: true,
          error: undefined,
          message: "Verification email sent. Please check your inbox.",
        };
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);

    try {
      const result = await createUser(validatedData.email, hash);
      console.log("User created in database:", result);

      // Generate verification token and send email
      const token = await generateVerificationToken(validatedData.email);
      await sendVerificationEmail({
        to: validatedData.email,
        token,
      });

      return {
        success: true,
        error: undefined,
        message:
          "Account created! Please check your email to verify your account.",
      };
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
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  console.log("Auth action called with mode:", mode);
  if (mode === "login") return await login(prevState, formData);
  else return await signUp(prevState, formData);
}

export async function verifyEmailAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const validatedData = VerifyEmailSchema.parse({
      token: formData.get("token"),
      email: formData.get("email"),
    });

    const isValid = await verifyToken(validatedData.token, validatedData.email);

    if (!isValid) {
      return {
        success: false,
        error:
          "Invalid or expired verification token. Please request a new verification email.",
      };
    }

    return {
      success: true,
      message: "Email verified successfully! You can now sign in.",
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      error: "Invalid verification data. Please try again.",
    };
  }
}

export async function resendVerificationAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const validatedData = ResendVerificationSchema.parse({
      email: formData.get("email"),
    });

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return {
        success: false,
        error: "No account found with this email address.",
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        error: "This email is already verified. You can sign in normally.",
      };
    }

    const token = await generateVerificationToken(validatedData.email);
    await sendVerificationEmail({
      to: validatedData.email,
      token,
    });

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      error: "Failed to send verification email. Please try again.",
    };
  }
}
