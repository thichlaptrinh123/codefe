// app/admin/components/user/user-types.ts

export interface User {
    id?: string;
    _id?: string;
    name: string;
    password: string;
    phone: string;
    email: string;
    role: "super-admin" | "product-manager" | "order-manager" | "post-manager" | "customer";
    status: "active" | "inactive";
    address: string;
    orderCount?: number; 
  }
  
  export interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    initialData?: User | null;
  }
  
  export {};