export const isNewProduct = (createdAt?: string): boolean => {
    if (!createdAt) return false;
  
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInDays =
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  
    return diffInDays <= 14;
  };

  export const getFeaturedLevel = (
    viewCount: number,
    variants: { sold_quantity?: number }[]
  ): number => {
    const score =
      (viewCount || 0) * 0.5 +
      variants.reduce((sum, v) => sum + (v.sold_quantity || 0), 0) * 2;
    return score >= 5 ? 1 : 0;
  };