import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      studentLevel: number | null;
    };
  }

  interface User {
    role: Role;
    studentLevel: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    studentLevel: number | null;
  }
}
