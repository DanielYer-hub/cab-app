import axiosInstance from "./axios";
import type { FieldTemplate, FieldType } from "../types/field";

export interface CreateFieldPayload {
  label: string;
  type: FieldType;
  required?: boolean;
  order?: number;
}

export const getFieldsBySection = async (
  sectionId: string
): Promise<FieldTemplate[]> => {
  const response = await axiosInstance.get(`/api/sections/${sectionId}/fields`);
  return response.data;
};

export const createField = async (
  sectionId: string,
  payload: CreateFieldPayload
): Promise<FieldTemplate> => {
  const response = await axiosInstance.post(`/api/sections/${sectionId}/fields`, payload);
  return response.data;
};

export const updateField = async (
  id: string,
  payload: Partial<CreateFieldPayload>
): Promise<FieldTemplate> => {
  const response = await axiosInstance.put(`/api/fields/${id}`, payload);
  return response.data;
};

export const deleteField = async (id: string) => {
  const response = await axiosInstance.delete(`/api/fields/${id}`);
  return response.data;
};