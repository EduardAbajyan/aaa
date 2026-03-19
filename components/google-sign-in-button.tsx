"use client"; // Ensure this is a client component

import { signIn } from "next-auth/react"; // Import from the REACT package, not your auth.ts
export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition"
    >
      <img
        src="https://authjs.dev/img/providers/google.svg"
        alt="Google logo"
        width={20}
      />
      <span>Sign in with Google</span>
    </button>
  );
}
