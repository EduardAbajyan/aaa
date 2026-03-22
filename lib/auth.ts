import { prisma } from "@/lib/prisma";

export async function createUser(email: string, password: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.password)
      throw new Error("User with this email already exists");
    else if (existingUser) {
      console.log(
        "User exists but has no password, updating with new password",
      );
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { password },
      });
      console.log("User updated successfully:", {
        id: updatedUser.id,
        email: updatedUser.email,
      });
      return {
        success: true,
        user: { id: updatedUser.id, email: updatedUser.email },
      };
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          password,
        },
      });
      console.log("User created successfully:", {
        id: user.id,
        email: user.email,
      });
      return { success: true, user: { id: user.id, email: user.email } };
    }
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
