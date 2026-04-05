import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface Props {
  cards?: number;
  rows?: number;
}

export default function PageSkeleton({ cards = 3, rows = 8 }: Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Separator />

      {/* Cards */}
      <div className={`grid gap-4 sm:grid-cols-${cards}`}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-6 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <Skeleton className="h-72 w-full rounded-xl" />

      {/* Table rows */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-1">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex gap-4 px-4 py-3 border-b border-border last:border-0">
                <Skeleton className="h-4 w-20 shrink-0" />
                <Skeleton className="h-4 w-16 shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24 shrink-0" />
                <Skeleton className="h-4 w-24 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
