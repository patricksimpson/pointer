import React from "react";

const Vote = ({
  socket,
  currentVote,
  setCurrentVote,
  leaderUser,
  kickMode,
  setKickMode,
  autoShowVote,
  setAutoShowVote,
  isShowing,
  roomVoteList,
  roomHasVotes,
  users,
  observer,
}) => {
  let voteSequence = [false, "0", "0.5", 1, 2, 3, 5, 8, 13, 21, "?"];

  const castVote = (vote) => {
    if (!vote) {
      setCurrentVote(-1);
    } else {
      setCurrentVote(vote);
    }
    socket.emit("cast-vote", { vote: vote });
  };

  const launch = () => {
    socket.emit("fire");
  };

  const clearVotes = () => {
    socket.emit("room-clear-votes");
  };

  const showVotes = () => {
    if (roomHasVotes) {
      socket.emit("room-show-votes");
    }
  };

  const hideVotes = () => {
    socket.emit("room-hide-votes");
  };

  const voteClass = (v, i) => {
    if (i > 0) {
      if (!roomVoteList[i - 1]) return `vote-hide`;
    }
    return `vote${v === currentVote ? " current-vote" : ""}`;
  };

  return (
    <>
      <div className="room-control">
        {users.length > 0 && leaderUser ? (
          <>
            {leaderUser && autoShowVote && (<button className="vote-button" onClick={() => setAutoShowVote(false)}>Disable Auto</button>)}
            {leaderUser && !autoShowVote && (<button className="vote-button" onClick={() => setAutoShowVote(true)}>Enable Auto</button>)}
            {!isShowing ? (
              <button onClick={showVotes}>Show Votes</button>
            ) : (
              <button style={{ display: "none" }} onClick={hideVotes}>
                Hide Votes
              </button>
            )}
            <button onClick={clearVotes}>Clear Votes</button>
            {leaderUser && kickMode && (<button className="vote-button" onClick={() => setKickMode(false)}>Hide Kick</button>)}
            {leaderUser && !kickMode && (<button className="vote-button" onClick={() => setKickMode(true)}>Show Kick</button>)}
            <button onClick={launch}>🚀</button>
          </>
        ) : null}
      </div>
      {!observer && (
        <div className="vote-control">
          {voteSequence.map((v, i) => (
            <button
              key={`key-${v.toString()}`}
              className={`vote-button ${voteClass(v, i)}`}
              onClick={() => castVote(v)}
            >
              {v ? v : "Remove Vote"}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export { Vote };