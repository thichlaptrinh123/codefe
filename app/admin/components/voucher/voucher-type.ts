export interface Voucher {
    id?: string;
    code: string;
    description?: string;
    type: "percent" | "fixed";
    discount_percent?: number;
    discount_amount?: number;
    quantity: number;
    min_order_value?: number;
    max_discount_value?: number;
    start_day: string;
    end_day: string;
    status: "active" | "inactive";
    createdAt?: string;
    updatedAt?: string;
  }

export interface VoucherForm {
  id?: string;
  code: string;
  description?: string;
  type: "percent" | "fixed";
  discount_percent?: number;
  discount_amount?: number;
  min_order_value?: number;
  max_discount_value?: number;
  quantity: number;
  start_day: string;
  end_day: string;
  status: "active" | "inactive";
}