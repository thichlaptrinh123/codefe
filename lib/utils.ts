export function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(" ");
  }

export function formatCurrency(amount: number, currency: string = "₫"): string {
    return amount.toLocaleString("vi-VN") + " " + currency;
  }
  