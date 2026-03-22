"use client";

import cssClasses from "./credentials-sign-in-form.module.css";

import { useActionState, useState, useEffect } from "react";
import { AuthAction } from "@/server_actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthForm({
  mode = "login",
}: {
  mode: "login" | "signup";
}) {
  const router = useRouter();
  
  const [formState, formAction] = useActionState(AuthAction.bind(null, mode), {
    success: false,
    error: undefined,
  });

  const [showError, setShowError] = useState(false);

  // Hide error message after 10 seconds
  useEffect(() => {
    if (formState.error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [formState.error]);

  // Redirect on successful authentication
  useEffect(() => {
    if (formState.success) {
      router.push("/dashboard"); // or wherever you want to redirect
    }
  }, [formState.success, router]);

  return (
    <section className={cssClasses.auth}>
      <form className={cssClasses.form} action={formAction}>
        <h1 className={cssClasses.header}>
          {mode === "login" ? "Login" : "Sign Up"}
        </h1>
        {formState.error && showError && (
          <div className={cssClasses.error}>{formState.error}</div>
        )}
        <div className={cssClasses.control}>
          <label htmlFor="email">Your Email:</label>
          <input
            className={cssClasses.input}
            type="email"
            id="email"
            name="email"
            placeholder="user@server.domain"
            required
          />
        </div>
        <div className={cssClasses.control}>
          <label htmlFor="password">Your Password:</label>
          <input
            className={cssClasses.input}
            type="password"
            id="password"
            name="password"
            placeholder="****************"
            required
          />
        </div>
        <div className={cssClasses.actions}>
          <button className={cssClasses.button}>
            {mode === "login" ? "Login" : "Create Account"}
          </button>
          <Link href={`/?mode=${mode === "login" ? "signup" : "login"}`}>
            {mode === "login"
              ? "Create an account."
              : "Login with existing account."}
          </Link>
        </div>
      </form>
    </section>
  );
}
