import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="container-wide pt-5">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-16 rounded-full" />
        ))}
      </div>
      <div className="mt-8">
        <ProductGridSkeleton count={24} />
      </div>
    </div>
  );
}
