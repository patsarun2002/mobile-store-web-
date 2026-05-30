import prisma from "../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { Prisma } from "@prisma/client";

const saltRounds = 12;

export const UserService = {
  async signIn(username: string, password: string) {
    console.log(`[SignIn] Attempting login for username: ${username}`);

    const user = await prisma.user.findFirst({
      where: {
        username,
        status: "active",
      },
    });

    if (!user) {
      console.log(
        `[SignIn] User not found or inactive for username: ${username}`,
      );
      throw new Error("User not found");
    }

    console.log(
      `[SignIn] User found: ${user.username}, status: ${user.status}`,
    );
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log(`[SignIn] Invalid password for username: ${username}`);
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, level: user.level },
      process.env.SECRET_KEY as string,
      {
        expiresIn: "1h",
      },
    );

    console.log(`[SignIn] Login successful for username: ${username}`);
    return { token };
  },

  async getUserInfo(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId },
      select: {
        name: true,
        level: true,
        username: true,
      },
    });
  },

  async updateUser(
    userId: string,
    data: { name?: string; level?: UserRole; password?: string },
  ) {
    const oldUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!oldUser) {
      throw new Error("User not found");
    }

    if (data.password && data.password !== "") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(data.password)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        );
      }
    }

    let newPassword = oldUser.password;
    if (data.password && data.password !== "") {
      newPassword = await bcrypt.hash(data.password, saltRounds);
    }

    const updateData: Prisma.UserUpdateInput = {
      name: data.name,
      password: newPassword,
    };

    if (data.level !== undefined) {
      updateData.level = data.level;
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  },

  async listUsers() {
    return prisma.user.findMany({
      where: {
        status: "active",
      },
      orderBy: {
        id: "desc",
      },
    });
  },

  async createUser(data: {
    name: string;
    username: string;
    password: string;
    level: UserRole;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    return prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        level: data.level,
      },
    });
  },

  async updateUserById(
    userId: string,
    requesterId: string,
    requesterLevel: UserRole,
    data: {
      name?: string;
      username?: string;
      password?: string;
      level?: UserRole;
    },
  ) {
    const oldUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!oldUser) {
      throw new Error("User not found");
    }

    if (requesterLevel !== "admin" && requesterId !== userId) {
      throw new Error("Access denied");
    }

    if (requesterLevel !== "admin" && data.level !== undefined) {
      throw new Error("Cannot change user level");
    }

    let newPassword = oldUser.password;
    if (data.password && data.password !== "") {
      newPassword = await bcrypt.hash(data.password, saltRounds);
    }

    const updateData: Prisma.UserUpdateInput = {
      name: data.name,
      username: data.username,
      password: newPassword,
    };

    if (requesterLevel === "admin" && data.level !== undefined) {
      updateData.level = data.level;
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  },

  async removeUser(
    userId: string,
    requesterId: string,
    requesterLevel: UserRole,
  ) {
    const targetUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new Error("User not found");
    }

    if (requesterLevel !== "admin" && requesterId !== userId) {
      throw new Error("Access denied");
    }

    return prisma.user.update({
      where: { id: userId },
      data: { status: "inactive" },
    });
  },
};
