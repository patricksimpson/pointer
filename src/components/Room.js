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
  const [observer, setObserver] = useState(false);
  const [session, setSession] = useState();
  const [userId, setUserId] = useState();
  const [users, setUsers] = useState([]);
  const [observers, setObservers] = useState([]);
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
  const [connecting, setConnecting] = useState(0);
  const [playClick] = useSound("/static/sound/click.mp3");
  const [playStart] = useSound("/static/sound/start.mp3");
  const [playWaffle] = useSound("/static/sound/waffle.mp3");
  const [playUnity] = useSound("/static/sound/unity.mp3");
  const [playPing] = useSound("/static/sound/ping.mp3");
  const [playPop] = useSound("/static/sound/pop.mp3");
  const [sound, setSound] = useState(true);
  const [kickUserId, setKickUserId] = useState();

  useEffect(() => {
    if (kickUserId) {
      if (kickUserId == userId) {
        alert("You have been kicked from the room!");
        window.location = `/`;
      }
      // Find the user's name who was kicked
      const kickedUser = [...users, ...observers].find(user => user.id === kickUserId);
      const kickedName = kickedUser ? kickedUser.name : "A user";

      // Create toast element
      const toast = document.createElement('div');
      toast.className = 'kick-toast';
      toast.textContent = `${kickedName} has been kicked from the room.`;

      // Add toast to the DOM
      document.body.appendChild(toast);

      // Remove toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    }
  }, [kickUserId]);

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

    socket.on("room-show-votes", (data) => {
      setShowVotes(true);
      setRoomWaffled(false);
    });
    socket.on("room-hide-votes", (data) => {
      setShowVotes(false);
      if (data?.data == "new") {
        setCurrentVote(-1);
      }
      setRoomWaffled(false);
      if (sound) {
        playPing();
      }
    });

    socket.on("kick-user", (data) => {
      setKickUserId(data.userId);
    });

    socket.on("promoted-user", (data) => {
      setLeaderUser(data.id);
    });
    socket.on("person-list", (data) => {
      setRoomVoteList(data.votes);
      let joining = data.users.filter((e) => e.new);
      let rawUsers = data.users.filter((e) => !e.observer);
      setConnecting(joining.length);
      setUsers(rawUsers);
      let rawObservers = data.users.filter((e) => e.observer);
      setObservers(rawObservers);
    });

    socket.on("fire", (data) => {
      setLaunch(true);
    });
    socket.on("emoji", (data) => {
      const userElementEmoji = document.getElementById(`user-${data.id}-emoji`);
      if (userElementEmoji) {
        userElementEmoji.textContent = data.emoji;
        userElementEmoji.style.opacity = '1';
        let ele = document.createElement('span');
        ele.className = "emoji";
        ele.textContent = data.emoji;
        ele.style.left = `${userElementEmoji.offsetLeft}px`;
        userElementEmoji.parentElement.appendChild(ele);

        // Make the emoji float up and disappear
        let startPosition = 0;
        let xOffset = 0;
        const randomStartX = userElementEmoji.offsetLeft + Math.random() * 20 - 10; // Random value between -10 and 10
        const wiggleAmplitude = 5; // How much to wiggle
        const wiggleFrequency = 0.1; // How fast to wiggle
        const animationDuration = 5000; // 5 seconds
        const animationInterval = 50; // Update every 50ms
        const totalSteps = animationDuration / animationInterval;
        const moveStep = 1000 / totalSteps; // Total distance to move

        ele.style.position = 'absolute';
        ele.style.opacity = '1';
        ele.style.transition = 'opacity 0.5s ease-out';
        ele.style.left = `${randomStartX}px`; // Initial random x position

        const floatAnimation = setInterval(() => {
          startPosition += moveStep;
          // Add wiggle effect with sine wave
          xOffset = Math.sin(startPosition * wiggleFrequency) * wiggleAmplitude;

          ele.style.bottom = `${startPosition}px`;
          ele.style.left = `${randomStartX + xOffset}px`;

          // Start fading out in the last second
          if (startPosition > (100 / totalSteps) * (totalSteps - 20)) {
            ele.style.opacity = '0';
          }
        }, animationInterval);

        // Store the interval and timeout on the element to clear them if needed
        //userElementEmoji.animationInterval = floatAnimation;

        // Remove the element after animation completes
        const animationTimeout = setTimeout(() => {
          if (ele.parentNode) {
            ele.parentNode.removeChild(ele);
          }
        }, animationDuration);

        // Reset the emoji container back to default after animation
        const resetTimeout = setTimeout(() => {
          if (userElementEmoji) {
            userElementEmoji.textContent = '😑'; // Reset to default emoji
            userElementEmoji.style.opacity = '0'; // Hide it again
          }
        }, animationDuration + 500); // Add a small delay after animation completes

        // Clear previous reset timeout if it exists
        if (userElementEmoji.resetTimeout) {
          clearTimeout(userElementEmoji.resetTimeout);
        }

        // Store the new reset timeout
        userElementEmoji.resetTimeout = resetTimeout;

        userElementEmoji.animationTimeout = animationTimeout;
      }
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

  const joinAsObserver = (e) => {
    e.preventDefault();
    setObserver(true);
    joinWithName(false);
    return;
  };

  const submitUpdateName = (e) => {
    e.preventDefault();
    joinWithName();
    return false;
  };

  const joinWithName = (vote = true) => {
    if (name.trim() === "") {
      alert("Name is required");
      e.preventDefault();
      return false;
    }

    socket = session;
    socket.emit("person-update-name", { name, observer: !vote });
    setJoinedRoom(true);
    localStorage.setItem("name", name);
  };

  useEffect(() => {
    if (users) {
      let v = [...new Set(users.map((e) => e.vote))];
      if (v.includes(true)) {
        if (sound) {
          playClick();
        }
        setRoomHasVotes(v.includes(true));
      } else {
        let x = [...new Set(users.map((e) => e.waffled))];
        if (x.includes(true) && sound) {
          playWaffle();
        }
      }
    }
  }, [users]);

  useEffect(() => {
    if (showVotes) {
      if (sound) {
        playPop();
      }
      let v = [
        ...new Set(users.filter((user) => !user.new).map((e) => e.vote)),
      ];
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

  const kickUser = (id) => {
    if (window.confirm("Are you sure you want to kick this user?")) {
      socket = session;
      socket.emit("kick-user", { userId: id });
    }
  };

  const usersList = (users) => {
    return (
      <>
        <div>
          {showVotes ? <span className="boom">Voting complete!</span> : ok()}
        </div>
        {users.length < 1 && (
          <div className="waiting">Waiting for voters...</div>
        )}
        <ul className="user-list">
          {users ? (
            users.map((user, index) => (
              <li
                key={user.id}
                id={`user-${user.id}`}
                className={`user${user.id === userId ? " current-user" : ""}${user.leaderUser ? " leader" : ""
                  }`}
              >
                {displayWaffle(user.vote, user.waffled) ? <Waffle /> : ""}

                <span className="user-name">
                  {user.id === userId ? <Me /> : ""}{" "}
                  {user.new ? (
                    <marquee>new user connecting...</marquee>
                  ) : (
                    user.name
                  )}
                  <span className="emoji-space" id={`user-${user.id}-emoji`} style={{ opacity: 0 }}>😑</span>
                  {leaderUser && user.id !== userId && (<button onClick={() => kickUser(user.id)}>Kick</button>)}
                </span>
                {user.leaderUser ? <Leader /> : ""}
                {!user.new && (
                  <span className="user-vote">
                    {user.vote
                      ? displayVote(user.id, user.vote, index)
                      : "not voted"}
                  </span>
                )}
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
        <button onClick={submitUpdateName}>Join as Voter</button>
        <button onClick={joinAsObserver}>Join as Observer</button>
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
          observer={observer}
          users={users}
        />
      ) : null}
      {joinedRoom ? usersList(users) : nameInput()}
      {joinedRoom && (
        <div className="observers">
          Observers ({observers.length}):{" "}
          {observers.map((observer, index) => (
            <span key={observer.name + index}>
              {observer.leaderUser && <LeaderSVG />} {observer.name}
              {index < observers.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      )}
      {joinedRoom && !observer && <Emoji socket={session} users={users} />}
    </>
  );
};

const Emoji = ({ socket, users }) => {
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

const Vote = ({
  socket,
  currentVote,
  setCurrentVote,
  leaderUser,
  promote,
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
            {!isShowing ? (
              <button onClick={showVotes}>Show Votes</button>
            ) : (
              <button style={{ display: "none" }} onClick={hideVotes}>
                Hide Votes
              </button>
            )}
            <button onClick={clearVotes}>Clear Votes</button>
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

const LeaderSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
  >
    <path d="M16.896 10l-4.896-8-4.896 8-7.104-4 3 11v5h18v-5l3-11-7.104 4zm-11.896 10v-2h14v2h-14zm14.2-4h-14.4l-1.612-5.909 4.615 2.598 4.197-6.857 4.197 6.857 4.615-2.598-1.612 5.909z" />
  </svg>
);

export { Room };
