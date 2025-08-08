import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProductSkeleton() {
  return (
    <div className="hidden md:grid grid-cols-[0.5fr_1fr_2fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 px-2 py-3 items-center border-b border-gray-100">
      <Skeleton width={24} height={16} />
      <Skeleton width={88} height={88} />
      <Skeleton height={16} />
      <Skeleton height={16} />
      <Skeleton width={60} height={16} />
      <Skeleton width={40} height={16} />
      <Skeleton width={70} height={24} />
      <Skeleton width={80} height={32} />
    </div>
  );
}

export function ProductSkeletonMobile() {
    return (
      <div className="md:hidden border border-gray-200 rounded-xl p-4 bg-white space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <Skeleton width={40} height={12} />
          <Skeleton width={60} height={20} />
        </div>
        <div className="flex gap-3 items-start">
          <Skeleton width={80} height={80} />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} />
            <Skeleton height={14} width="60%" />
            <Skeleton height={16} width="40%" />
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm text-gray-600">
          <Skeleton width={60} height={16} />
          <Skeleton width={70} height={32} />
        </div>
      </div>
    );
  }
  