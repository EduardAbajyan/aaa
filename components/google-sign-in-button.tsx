"use client"; // Ensure this is a client component

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <button
        onClick={() => {
          signIn("google", { callbackUrl: "/dashboard" });
        }}
        className="w-full max-w-[400px] flex items-center gap-2 px-4 py-3 border rounded-md bg-[transparten] hover:bg-[#34A853]/15 transition"
      >
        <img
          src="https://authjs.dev/img/providers/google.svg"
          alt="Google logo"
          width={20}
        />
        <span>Sign in with Google</span>
      </button>
    </div>
  );
}
