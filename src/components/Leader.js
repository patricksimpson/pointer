import React from "react";
const Leader = () => {
  return (
    <div
      className="crown icon"
      title="This is the leader. Leader controls showing, hiding, and clearing votes. There can only be one leader at a time."
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M16.896 10l-4.896-8-4.896 8-7.104-4 3 11v5h18v-5l3-11-7.104 4zm-11.896 10v-2h14v2h-14zm14.2-4h-14.4l-1.612-5.909 4.615 2.598 4.197-6.857 4.197 6.857 4.615-2.598-1.612 5.909z" />
      </svg>
    </div>
  );
};

export { Leader };