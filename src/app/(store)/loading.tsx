import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="container-wide pt-4">
      <Skeleton className="h-[260px] w-full lg:h-[380px]" />
      <div className="mt-8">
        <ProductGridSkeleton count={24} />
      </div>
    </div>
  );
}
