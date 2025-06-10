
import { useState, useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsePaginatedQueryOptions<T> extends PaginationOptions {
  queryKey: (string | number)[];
  queryFn: (page: number, pageSize: number) => Promise<PaginatedResult<T>>;
  enableCache?: boolean;
}

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  pageSize = 50,
  initialPage = 1,
  enableCache = true,
}: UsePaginatedQueryOptions<T>) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginatedQueryKey = useMemo(() => 
    [...queryKey, 'paginated', currentPage, pageSize], 
    [queryKey, currentPage, pageSize]
  );

  const query = useOptimizedQuery({
    queryKey: paginatedQueryKey,
    queryFn: () => queryFn(currentPage, pageSize),
    cacheConfig: 'FUNCTION_METADATA',
    enableCache,
  });

  const pagination = useMemo(() => {
    if (!query.data) return null;

    return {
      currentPage,
      totalPages: query.data.totalPages,
      hasNextPage: query.data.hasNextPage,
      hasPreviousPage: query.data.hasPreviousPage,
      goToPage: (page: number) => {
        if (page >= 1 && page <= query.data!.totalPages) {
          setCurrentPage(page);
        }
      },
      nextPage: () => {
        if (query.data!.hasNextPage) {
          setCurrentPage(prev => prev + 1);
        }
      },
      previousPage: () => {
        if (query.data!.hasPreviousPage) {
          setCurrentPage(prev => prev - 1);
        }
      },
    };
  }, [query.data, currentPage]);

  return {
    ...query,
    pagination,
    pageSize,
  };
}
