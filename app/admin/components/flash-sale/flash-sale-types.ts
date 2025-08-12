// /flash-sale/flash-sale-types.ts
import type { Product } from "../../components/product/product-types";

export interface FlashSale {
    _id?: string;
    id?: string;
    name: string;
    id_product: string[]; // Chứa các ObjectId dưới dạng string
    
    products?: Product[]; // <-- THÊM DÒNG NÀY để dùng cho UI/ADMIN hiển thị

    quantity: number | string;
    discount_percent: number;
    start_date: string; // ISO date string
    end_date: string;   // ISO date string
    start_time?: string; // VD: "08:00"
    end_time?: string;   // VD: "12:00"
    status: "scheduled" | "active" | "inactive";
    createdAt?: string;
    updatedAt?: string;
    product?: Product; 
  }
  
  export interface FlashSaleForm {
    id?: string;
    name: string;
    id_product: string[]; // chọn nhiều sản phẩm
    quantity: number | string;
    discount_percent: number;
    start_date: string;
    end_date: string;
    start_time?: string;
    end_time?: string;
    status: "scheduled" | "active" | "inactive";

    start_datetime: Date | null;
    end_datetime: Date | null;
  }
  