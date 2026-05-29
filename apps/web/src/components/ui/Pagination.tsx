import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  page: number;
  lastPage: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, lastPage, isFetching = false, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <Button variant="secondary" disabled={page <= 1 || isFetching} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <span className="text-sm font-medium text-content-secondary">
        Page {page} of {lastPage}
      </span>
      <Button variant="secondary" disabled={page >= lastPage || isFetching} onClick={() => onPageChange(page + 1)}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
