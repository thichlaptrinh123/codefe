
export interface Category {
    _id: string;
    name: string;
    isActive: boolean;
    typeId: {
      _id: string;
      name: string;
    } | string;
  }
  
  export interface CategoryType {
    _id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
  }