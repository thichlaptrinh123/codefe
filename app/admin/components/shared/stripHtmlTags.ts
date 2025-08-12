/**
 * Loại bỏ tất cả thẻ HTML và entity khỏi chuỗi.
 */
export function stripHtmlTags(html: string): string {
    if (!html) return "";
  
    // Tạo một DOMParser để parse HTML
    if (typeof window !== "undefined") {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body.textContent?.trim() || "";
    }
  
    // Nếu chạy ở server (Node.js), fallback sang regex
    return html
      .replace(/<[^>]+>/g, " ") // bỏ thẻ HTML
      .replace(/\s+/g, " ")     // bỏ khoảng trắng thừa
      .trim();
  }
  