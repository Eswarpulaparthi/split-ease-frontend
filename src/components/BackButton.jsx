import React from "react";

function BackButton() {
  return (
    <button className="back-btn" onClick={() => window.history.back()}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back
    </button>
  );
}

export default BackButton;
