export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "CREATOR" | "USER";
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  bio?: string;
  website?: string;
  avatar?: string;
  accessLevel?: string;
  sendWelcomeEmail?: boolean;
  lastLogin: string;
  createdAt: string;
  // Add other user properties as needed
}
