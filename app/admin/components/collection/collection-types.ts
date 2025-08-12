// File: app/admin/components/collection/collection-types.ts

export type CollectionStatus = "active" | "inactive";


export interface Collection {
  id?: string;
  name: string;
  description?: string;
  images: string[];  
  createdAt: string; 
  isActive: boolean;   
}
