import React from "react";

const Emoji = ({ socket }) => {
  const emoji = (emoji) => {
    socket.emit("emoji", { emoji });
  }

  return (
    <div className="emoji-control">
      <button onClick={() => emoji("😃")}>😃</button>
      <button onClick={() => emoji("😔")}>😔</button>
      <button onClick={() => emoji("🤔")}>🤔</button>
      <button onClick={() => emoji("🤯")}>🤯</button>
      <button onClick={() => emoji("👏")}>👏</button>
      <button onClick={() => emoji("💩")}>💩</button>
      <button onClick={() => emoji("👍")}>👍</button>
      <button onClick={() => emoji("👎")}>👎</button>
      <button onClick={() => emoji("👌")}>👌</button>
      <button onClick={() => emoji("❤️")}>❤️</button>
      <button onClick={() => emoji("🔥")}>🔥</button>
      <button onClick={() => emoji("🎉")}>🎉</button>
    </div>
  )
}

export { Emoji };