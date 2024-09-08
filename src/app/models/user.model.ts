export interface User {
  userID: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber:string;
  username:string;
  hasReservations: boolean; // Add any other fields as necessary
  isClient:boolean;
  isAdmin:boolean;
}
