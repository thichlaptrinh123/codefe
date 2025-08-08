// components/shared/format-date.ts
export function formatDateVN(dateInput: string | number | Date): string {
    const date = new Date(dateInput);
  
    if (isNaN(date.getTime())) return "Không rõ";
  
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  }
  