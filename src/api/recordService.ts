import axiosInstance from "./axios";
import type { RecordItem } from "../types/record";

export interface CreateRecordPayload {
  values: Record<string, any>;
}

export const getRecordsBySection = async (
  sectionId: string
): Promise<RecordItem[]> => {
  const response = await axiosInstance.get(`/api/sections/${sectionId}/records`);
  return response.data;
};

export const createRecord = async (
  sectionId: string,
  payload: CreateRecordPayload
): Promise<RecordItem> => {
  const response = await axiosInstance.post(
    `/api/sections/${sectionId}/records`,
    payload
  );
  return response.data;
};

export const updateRecord = async (
  id: string,
  payload: CreateRecordPayload
): Promise<RecordItem> => {
  const response = await axiosInstance.put(`/api/records/${id}`, payload);
  return response.data;
};

export const deleteRecord = async (id: string) => {
  const response = await axiosInstance.delete(`/api/records/${id}`);
  return response.data;
};