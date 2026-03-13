import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ message, rows = 4 }: { message?: string; rows?: number }) {
  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-muted-foreground animate-pulse">{message}</p>}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
