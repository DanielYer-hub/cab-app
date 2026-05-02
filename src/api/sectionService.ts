import axiosInstance from "./axios";
import type { Section } from "../types/section";

export interface CreateSectionPayload {
  title: string;
  description?: string;
}

export const getSections = async (): Promise<Section[]> => {
  const response = await axiosInstance.get("/api/sections");
  return response.data;
};

export const getSectionById = async (id: string): Promise<Section> => {
  const response = await axiosInstance.get(`/api/sections/${id}`);
  return response.data;
};

export const createSection = async (
  payload: CreateSectionPayload
): Promise<Section> => {
  const response = await axiosInstance.post("/api/sections", payload);
  return response.data;
};

export const updateSection = async (
  id: string,
  payload: CreateSectionPayload
): Promise<Section> => {
  const response = await axiosInstance.put(`/api/sections/${id}`, payload);
  return response.data;
};

export const deleteSection = async (id: string) => {
  const response = await axiosInstance.delete(`/api/sections/${id}`);
  return response.data;
};