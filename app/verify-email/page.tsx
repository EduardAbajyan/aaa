"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmailAction, type ActionState } from "@/server_actions/auth";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new verification email.");
      return;
    }

    // Create FormData and verify
    const formData = new FormData();
    formData.append("token", token);
    formData.append("email", email);

    verifyEmailAction({ success: false } as ActionState, formData)
      .then((result) => {
        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully!");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/?verified=true");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.error || "Verification failed.");
        }
      })
      .catch((error) => {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again.");
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>
        
        <div className="bg-white shadow-2xl rounded-lg px-8 py-12">
          <div className="text-center space-y-6">
            {status === "loading" && (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Verifying your email...
                  </h3>
                  <p className="text-sm text-gray-600">
                    Please wait while we verify your email address.
                  </p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    Email Verified Successfully! ✅
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{message}</p>
                  <p className="text-xs text-gray-500">
                    Redirecting you to the sign-in page in 3 seconds...
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/?verified=true"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Go to Sign In
                    </Link>
                  </div>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-900 mb-2">
                    Verification Failed ❌
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{message}</p>
                  <div className="space-y-2">
                    <Link
                      href="/resend-verification"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Request New Verification Email
                    </Link>
                    <div>
                      <Link
                        href="/"
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Back to Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}