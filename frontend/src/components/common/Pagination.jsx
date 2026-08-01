import React from "react";

export default function Pagination({ pageNumber, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex gap-8" style={{ justifyContent: "center", marginTop: 20 }}>
      <button
        className="btn btn-secondary btn-sm"
        disabled={pageNumber === 0}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        Previous
      </button>
      <span className="text-muted" style={{ alignSelf: "center", fontSize: 13 }}>
        Page {pageNumber + 1} of {totalPages}
      </span>
      <button
        className="btn btn-secondary btn-sm"
        disabled={pageNumber >= totalPages - 1}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Next
      </button>
    </div>
  );
}
