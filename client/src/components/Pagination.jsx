import React from 'react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
}) => {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        {onPageSizeChange && (
          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / trang
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(currentPage - 1)}
        >
          Trước
        </button>
        <span className="text-sm text-gray-600">
          Trang {currentPage} / {Math.max(1, totalPages)}
        </span>
        <button
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(currentPage + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;
