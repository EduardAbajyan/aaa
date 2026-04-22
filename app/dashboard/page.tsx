"use server";
import { signOut } from "@/auth";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const message = (await searchParams).message;

  async function handleSignOut() {
    "use server";
    return await signOut({ redirectTo: "/" });
  }

  return (
    <div>
      <p>Dashboard</p>
      {message && <p>{message}</p>}
      <form action={handleSignOut}>
        <button type="submit">Go back to Home</button>
      </form>
    </div>
  );
}
