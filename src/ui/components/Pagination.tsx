import {
  Pagination as ShadPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "../components/ui/pagination";

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
}

function Pagination({
  itemsPerPage,
  totalItems,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const renderPageNumber = (pageNumber: number) => (
    <PaginationItem key={pageNumber}>
      <PaginationLink
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onPageChange(pageNumber);
        }}
        isActive={pageNumber === currentPage}
        className={`px-3 py-1 rounded-md transition-colors ${
          pageNumber === currentPage
            ? "bg-accent text-accent-foreground font-bold"
            : "text-muted-foreground hover:bg-muted"
        }`}
      >
        {pageNumber}
      </PaginationLink>
    </PaginationItem>
  );

  const pageItems: React.ReactNode[] = [];

  // Always show first page
  pageItems.push(renderPageNumber(1));

  // Show leading ellipsis if needed
  if (currentPage > 3) {
    pageItems.push(
      <PaginationItem key="start-ellipsis">
        <PaginationEllipsis />
      </PaginationItem>
    );
  }

  // Show middle pages (currentPage - 1, currentPage, currentPage + 1)
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pageItems.push(renderPageNumber(i));
  }

  // Show trailing ellipsis if needed
  if (currentPage < totalPages - 2) {
    pageItems.push(
      <PaginationItem key="end-ellipsis">
        <PaginationEllipsis />
      </PaginationItem>
    );
  }

  // Always show last page (if not already shown)
  if (totalPages > 1) {
    pageItems.push(renderPageNumber(totalPages));
  }

  return (
    <ShadPagination>
      <PaginationContent className="bg-background border border-border rounded-lg px-4 py-2 shadow-sm">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className="text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {pageItems}

        <PaginationItem>
          <PaginationNext
            href="#"
            className="text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadPagination>
  );
}

export default Pagination;
