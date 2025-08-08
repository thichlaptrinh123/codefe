// File: app/admin/components/collection/collection-types.ts

export type CollectionStatus = "published" | "draft";

export interface Collection {
  id?: string;
  name: string;
  description?: string;
  images: string[];  
  status: CollectionStatus;
  createdAt: string; 
}
