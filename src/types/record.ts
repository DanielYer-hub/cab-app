export interface RecordItem {
  _id: string;
  userId: string;
  sectionId: string;
  values: Record<string, any>;
  searchText: string;
  createdAt: string;
  updatedAt: string;
}