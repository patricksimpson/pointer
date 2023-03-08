import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useParams } from "react-router";
import socketIOClient from "socket.io-client";
import { endpoint } from "../endpoint";
import { CopyButton } from "./CopyButton";
import JSConfetti from "js-confetti";
import useSound from "use-sound";

const jsConfetti = new JSConfetti();

const ROOM_TIMEOUT = 60 * 60 * 1000;
const ROOM_TIMEOUT_TWO = 1 * 6 * 1000;

const Room = () => {
  let { roomId } = useParams();
  let socket;
  let isNameSet = false;
  const inactivityTime = () => {
    let time;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    function resetTimer() {
      clearTimeout(time);
      time = setTimeout(logout, ROOM_TIMEOUT);
    }
    function logout() {
      localStorage.setItem("disconnect-room", roomId);
      window.location = `/`;
    }

    resetTimer();
  };
  let voteSequenceV = [
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ];

  const [currentVote, setCurrentVote] = useState(-1);
  const [session, setSession] = useState();
  const [userId, setUserId] = useState(0);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [showVotes, setShowVotes] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [leaderUser, setLeaderUser] = useState(false);
  const [roomVoteList, setRoomVoteList] = useState(voteSequenceV);
  const [roomStartTime, setRoomStartTime] = useState(null);
  const [roomTime, setRoomTime] = useState(null);
  const [launch, setLaunch] = useState(false);
  const [roomWaffled, setRoomWaffled] = useState(false);
  const [roomHasVotes, setRoomHasVotes] = useState(false);
  const [playClick] = useSound("/static/sound/click.mp3");
  const [playStart] = useSound("/static/sound/start.mp3");
  const [playWaffle] = useSound("/static/sound/waffle.mp3");
  const [playUnity] = useSound("/static/sound/unity.mp3");
  const [playPing] = useSound("/static/sound/ping.mp3");
  const [playPop] = useSound("/static/sound/pop.mp3");
  const [sound, setSound] = useState(true);

  useEffect(() => {
    if (name === "") {
      let hasLocalName = localStorage.getItem("name");
      if (typeof hasLocalName !== "undefined" && hasLocalName !== null) {
        setName(hasLocalName);
      }
    }
    socket = socketIOClient(endpoint);
    socket.emit("join-session", { roomId });
    socket.on("no-session", () => {
      alert("Room does not exist!");
      window.location = `/`;
    });
    socket.on("joined-room", (data) => {
      setRoomStartTime(data.startTime);
      setUserId(data.userId);
    });

    socket.on("joined-room", (data) => {
      setRoomStartTime(data.startTime);
      setUserId(data.userId);
    });
    socket.on("room-show-votes", (data) => {
      setShowVotes(true);
      setRoomWaffled(false);
    });
    socket.on("room-hide-votes", (data) => {
      setShowVotes(false);
      if (data == "new") {
        setCurrentVote(-1);
      }
      setRoomWaffled(false);
      if (sound) {
        playPing();
      }
    });
    socket.on("promoted-user", (data) => {
      setLeaderUser(data.id);
    });
    socket.on("person-list", (data) => {
      setRoomVoteList(data.votes);
      setUsers(data.users);
    });

    socket.on("fire", (data) => {
      setLaunch(true);
    });
    socket.on("no-such-room", (data) => {
      setNotFound(true);
    });
    setSession(socket);
    inactivityTime();
    checkSound();
    window.addEventListener("storage", checkSound);
    return () => {
      window.removeEventListener("storage", checkSound);
      socket.emit("leave-room", { roomId });
      socket.disconnect();
    };
  }, []);

  const checkSound = () => {
    let soundOn = localStorage.getItem("sound");
    if (soundOn === "0") {
      setSound(false);
    } else {
      setSound(true);
    }
  };

  useEffect(() => {
    if (sound) {
      console.log("SOUND ON");
    } else {
      console.log("SOUND OFF");
    }
  }, [sound]);

  useEffect(() => {
    let timer = setInterval(() => {
      function convertTime(miliseconds) {
        let totalSeconds = Math.floor(miliseconds / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds - minutes * 60;
        return `${minutes.toString().padStart(2, "00")}:${seconds
          .toString()
          .padStart(2, "00")}`;
      }
      var timeSince = Date.now() - roomStartTime;
      let tick = convertTime(timeSince);
      setRoomTime(tick);
    }, 100);

    return () => clearInterval(timer);
  }, [roomStartTime]);

  const updateName = (e) => {
    setName(e.target.value);
  };

  const submitUpdateName = (e) => {
    e.preventDefault();

    if (name.trim() === "") {
      alert("Name is required");
      e.preventDefault();
      return false;
    }

    socket = session;
    socket.emit("person-update-name", { name });
    setJoinedRoom(true);
    localStorage.setItem("name", name);
    return false;
  };

  useEffect(() => {
    if (users) {
      let v = [...new Set(users.map((e) => e.vote))];
      if (v.includes(true)) {
        if (sound) {
          playClick();
        }
      }
      setRoomHasVotes(v.includes(true));
    }
  }, [users]);

  useEffect(() => {
    if (showVotes) {
      if (sound) {
        playPop();
      }
      let v = [...new Set(users.map((e) => e.vote))];
      if (v.length === 1) {
        if (v[0] && users.length > 1) {
          if (sound) {
            playUnity();
          }
          jsConfetti.addConfetti();
        }
      }
    } else {
      if (sound) {
        playPing();
      }
    }
  }, [showVotes]);

  useEffect(() => {
    if (launch) {
      jsConfetti.addConfetti();
      setLaunch(false);
    }
  }, [launch]);

  const displayVote = (id, vote, index) => {
    return showVotes
      ? vote.toString()
      : userId === id
      ? currentVote
      : vote
      ? "voted"
      : "not voted";
  };

  useEffect(() => {
    if (roomWaffled) {
      if (sound) {
        playWaffle();
      }
    }
  }, [roomWaffled]);

  const displayWaffle = (vote, waffled) => {
    if (showVotes && waffled && vote) {
      if (!roomWaffled) {
        setRoomWaffled(true);
      }
    }
    return showVotes && waffled && vote;
  };

  const promote = () => {
    socket = session;
    let leadConfirm = confirm(
      "Are you sure you want to take lead of this room?"
    );
    if (leadConfirm) {
      socket.emit("promote-user", { userId });
    }
  };

  const ok = () => {
    let buffer =
      currentVote >= 0 ? (
        <span>You voted: {currentVote}</span>
      ) : (
        <span>Voting in progress...</span>
      );
    return buffer;
  };

  const usersList = (users) => {
    return (
      <>
        <div>{showVotes ? <span>Voting complete!</span> : ok()}</div>
        <ul className="user-list">
          {users ? (
            users.map((user, index) => (
              <li
                key={user.id}
                className={`user${user.id === userId ? " current-user" : ""}${
                  user.leaderUser ? " leader" : ""
                }`}
              >
                {displayWaffle(user.vote, user.waffled) ? <Waffle /> : ""}

                <span className="user-name">
                  {user.id === userId ? <Me /> : ""} {user.name}
                </span>
                {user.leaderUser ? <Leader /> : ""}
                <span className="user-vote">
                  {user.vote
                    ? displayVote(user.id, user.vote, index)
                    : "not voted"}
                </span>
              </li>
            ))
          ) : (
            <li>No one here...</li>
          )}
        </ul>
      </>
    );
  };

  const nameInput = () => {
    return (
      <form className="input-name" onSubmit={submitUpdateName}>
        <h3>Your Name</h3>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={updateName}
          maxLength="26"
          placeholder="name"
        />
        <button onClick={submitUpdateName}>Set Name</button>
      </form>
    );
  };

  return notFound ? (
    <>
      <h2>Not found</h2>
      <p>Try another session, or create one!</p>
    </>
  ) : (
    <>
      <div className="header-wrapper">
        <h2 className="heading">Room - {roomId}</h2>
        <CopyButton />
      </div>
      <div style={{ fontSize: "0.75rem" }}>Room Time: {roomTime}</div>
      {joinedRoom ? (
        <Vote
          socket={session}
          currentVote={currentVote}
          setCurrentVote={setCurrentVote}
          leaderUser={leaderUser == userId}
          promote={promote}
          isShowing={showVotes}
          roomHasVotes={roomHasVotes}
          roomVoteList={roomVoteList}
        />
      ) : null}

      {joinedRoom ? usersList(users) : nameInput()}
    </>
  );
};

const Vote = ({
  socket,
  currentVote,
  setCurrentVote,
  leaderUser,
  promote,
  isShowing,
  roomVoteList,
  roomHasVotes,
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
        {leaderUser ? (
          <>
            {!isShowing ? (
              <button onClick={showVotes}>Show Votes</button>
            ) : (
              <button style={{ display: "none" }} onClick={hideVotes}>
                Hide Votes
              </button>
            )}
            <button onClick={clearVotes}>Clear Votes</button>
            <button style={{ visibility: "hidden" }} onClick={launch}>
              🚀
            </button>
          </>
        ) : (
          <button onClick={promote}>Take Lead</button>
        )}
      </div>
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
    </>
  );
};

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

const Me = () => {
  return (
    <span className="me icon" title="You">
      (Me)
    </span>
  );
};

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

export { Room };
