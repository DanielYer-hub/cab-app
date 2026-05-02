import axiosInstance from "./axios";

export interface RegisterPayload {
  name: {
    first: string;
    last: string;
  };
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const response = await axiosInstance.post("/api/auth/register", payload);
  return response.data;
};

export const loginUser = async (payload: LoginPayload) => {
  const response = await axiosInstance.post("/api/auth/login", payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get("/api/auth/me");
  return response.data;
};