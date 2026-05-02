export interface User {
  _id: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}