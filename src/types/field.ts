export type FieldType =
  | "text"
  | "number"
  | "date"
  | "phone"
  | "textarea"
  | "image";

export interface FieldTemplate {
  _id: string;
  userId: string;
  sectionId: string;
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}