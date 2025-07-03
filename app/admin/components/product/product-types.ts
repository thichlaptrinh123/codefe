export interface ProductVariant {
  id?: number | string;
  size: string;
  color: string; // chỉ cần tên
  price?: number;
  stock_quantity?: number;
  sold_quantity?: number;
  id_category?: string;
  isBulkCreated?: boolean;

}

  
  export interface Product {
    id: string;
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
    _id: string;
    name: string;
    hex: string;
  }
  
export interface SafeRawProduct extends Omit<RawProduct, "sale" | "price" | "images" | "variants"> {
  sale: number;
  price: number;
  images: string[];
  variants: ProductVariant[];
}