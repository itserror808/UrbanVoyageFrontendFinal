export interface Contact {
  id?: number;
  fullName: string;
  email: string;
  message: string;
  createdAt: string | Date; // Allow both string and Date
  read: boolean;
}
