// app/admin/components/user/user-types.ts

export interface Address {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  _id: string;
}

export function parseAddress(address: string | null | undefined): Address | null {
  if (!address) return null;
  try {
    return JSON.parse(address);
  } catch {
    return null;
  }
}

export interface User {
    id?: string;
    _id?: string;
    name: string;
    // username: string;
    password: string;
    phone: string;
    email: string;
    // role: "super-admin" | "product-manager" | "order-manager" | "post-manager" | "customer";
    role: "admin" | "product-lead" | "content-lead" | "customer";
    status: "active" | "inactive" | "pump_1" | "pump_2" | "pump_multi";
    address?: string;
    orderCount?: number; 
  }
  
  export interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    initialData?: User | null;
    users: User[];
  }
  
  export {};