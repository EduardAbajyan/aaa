"use client";

import cssClasses from "./credentials-sign-in-form.module.css";

import { useActionState, useState, useEffect } from "react";
import { AuthAction } from "@/server_actions/auth";
import Link from "next/link";

export default function AuthForm({
  mode = "login",
}: {
  mode: "login" | "signup";
}) {
  const [formState, formAction] = useActionState(
    AuthAction.bind(null, mode),
    { success: false, error: undefined },
  );
  
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Hide error message after 3 seconds
  useEffect(() => {
    if (formState.error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formState.error]);

  // Hide success message after 3 seconds  
  useEffect(() => {
    if (formState.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formState.success]);

  return (
    <section className={cssClasses.auth}>
      <form className={cssClasses.form} action={formAction}>
        <h1 className={cssClasses.header}>
          {mode === "login" ? "Login" : "Sign Up"}
        </h1>
        {formState.error && showError && (
          <div className={cssClasses.error}>
            {formState.error}
          </div>
        )}
        {formState.success && showSuccess && (
          <div className={cssClasses.success}>
            {mode === "login" ? "Login successful!" : "Account created successfully!"}
          </div>
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
