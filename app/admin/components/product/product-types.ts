// app/admin/components/product/product-type.ts

import { Category } from "../../components/category/category-types"

export interface ProductVariant {
  id?: number | string;
  _id?: string;
  size: string;
  color: string; // chỉ cần tên
  price?: number;
  stock_quantity?: number;
  sold_quantity?: number;
  id_category?: string;
  isBulkCreated?: boolean;

  name?: string;       
  productName?: string;    
  isActive?: boolean;
  productId?: string;
  id_product?: string;
}

  export interface Product {
    id?: string;
    _id?: string;

    id_category?: Category | string;

    name: string;
    category: string;
    categoryName: string;
    price: number;
    stock: number;
    status: "active" | "inactive";
    images?: string[];
    variants?: ProductVariant[];
    discount: number;
    featuredLevel: number;
    isNew?: boolean;
    description?: string;
    createdAt?: string;
  }
  
  export interface CategoryWithType {
    _id: string;
    name: string;
    categoryType: string;
    typeId?: {
      _id: string;
      name: string;
      isActive?: boolean;
    };
  }
  
  export interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data?: Product | Omit<Product, "id">) => void;
    initialData?: RawProduct | null;
    isEdit: boolean;
    categoryList: CategoryWithType[];
  }
  
  export interface RawProduct {
    _id: string;
    name: string;
    price?: number;
    stock?: number;
    image?: string;
    images?: string[];
    sale?: number;
    product_hot?: number;
    isActive?: boolean;
    description?: string;
    createdAt?: string;
    viewCount?: number;
  
    id_category?: {
      _id: string;
      name: string;
      typeId?: {
        _id: string;
        name: string;
        isActive?: boolean;
      };
    };
  
    // ✅ Không được quên phần này:
    variants?: ProductVariant[];
  }
  

  export interface Color {
    _id?: string;
    name: string;
    hex: string;
  }
  
export interface SafeRawProduct extends Omit<RawProduct, "sale" | "price" | "images" | "variants"> {
  sale: number;
  price: number;
  images: string[];
  variants: ProductVariant[];
}





// User lây nhờ của admin 


export interface WishlistItem {
  _id: string; // ID của wishlist item
  id_product: Product; // sản phẩm được populate
  id_user: string; // ID người dùng
  createdAt?: string;
  updatedAt?: string;
}