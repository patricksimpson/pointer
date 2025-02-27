import React from "react";

const Waffle = () => {
  return (
    <div
      className="waffle icon"
      title="Vote changed after votes had been shown!"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 64 64"
        xlinkHref="http://www.w3.org/1999/xlink"
      >
        <path
          data-name="layer2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M40.5 3.2L3.2 40.5m50.6-29.1L11.3 53.8m50-28.6l-36.1 36M22.7 3.5l37.8 37.8M9.6 11.9L52 54.3M2.6 26.1l35.3 35.4"
        ></path>
        <circle
          data-name="layer1"
          cx="32"
          cy="32"
          r="30"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        ></circle>
      </svg>
    </div>
  );
};

export { Waffle };