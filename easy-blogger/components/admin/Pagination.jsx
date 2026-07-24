import React from 'react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onLimitChange 
}) {
  // Calculate the range of items currently being shown
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 mt-6 border-t border-gray-200 w-full">
      
      {/* Left Side: Showing 1-10 of 18 results */}
      <div className="text-sm text-gray-500 font-medium text-center lg:text-left">
        Showing {startItem}-{endItem} of {totalItems} results
      </div>

      {/* Right Side: Rows Dropdown & Navigation */}
      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 lg:gap-6">
        
        {/* Rows Per Page Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">Rows</span>
          <select 
            value={itemsPerPage} 
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Previous / Next Buttons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {/* Current Page Indicator (Styled to match your teal theme) */}
          <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-[#1ABC9C] text-white">
            {currentPage}
          </span>
          
          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
        
      </div>
    </div>
  );
}