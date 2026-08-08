import React from "react";

export type PaginationProps = {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  [key: string]: any;
};

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange, ...props }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "24px 0" }} {...props}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange && onPageChange(page)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1.5px solid #E5E7EB",
            background: page === currentPage ? "#6D28D9" : "#ffffff",
            color: page === currentPage ? "#ffffff" : "#374151",
            fontWeight: 800,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {page}
        </button>
      ))}
    </div>
  );
}

export default Pagination;
