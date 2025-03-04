import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useParams } from "react-router";
import socketIOClient from "socket.io-client";
import { endpoint } from "../endpoint";
import { CopyButton } from "./CopyButton";
import JSConfetti from "js-confetti";
import useSound from "use-sound";
import { Emoji } from "./Emoji";
import { Leader } from "./Leader";
import { LeaderSVG } from "./LeaderSVG";
import { Me } from "./Me";
import { Waffle } from "./Waffle";
import { addEmoji } from "./utils";
import { Vote } from "./Vote";

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
  const [kickMode, setKickMode] = useState(false);
  const [kickUserId, setKickUserId] = useState();
  const [autoShowVote, setAutoShowVote] = useState(false);
  const [roomEmojis, setRoomEmojis] = useState(0);

  const checkAutoShowVote = () => {
    if (autoShowVote && !showVotes) {
      let filteredUsers = users.filter((e) => !e.vote);
      if (filteredUsers.length == 0 && users.length > 0) {
        setTimeout(() => {
          session.emit("room-show-votes", { roomId });
        }, 1000);
      }
    }
  }

  useEffect(() => {
    if (kickUserId) {
      if (kickUserId == userId) {
        alert("You have been kicked from the room!");
        window.location = `/`;
      }
      const kickedUser = [...users, ...observers].find(user => user.id === kickUserId);
      const kickedName = kickedUser ? kickedUser.name : "A user";
      const toast = document.createElement('div');
      toast.className = 'kick-toast';
      toast.textContent = `${kickedName} has been kicked from the room.`;

      document.body.appendChild(toast);
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
      setShowVotes(data.roomData.showVotes);
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
      console.log("person-list", data.emojis);
      setRoomEmojis(data.emojis);
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
      addEmoji(data);
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
      if (autoShowVote) {
        checkAutoShowVote();
      }
    }
  }, [users]);

  useEffect(() => {
    if (leaderUser) {
      fetchRoomData();
    }
  }, [leaderUser]);

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

  const fetchRoomData = () => {
    socket = session;
    socket.emit("fetch-room-data", { roomId });
  }



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

                {leaderUser && user.id !== userId && kickMode && (<button className="kick-ass" onClick={() => kickUser(user.id)}>👞</button>)}
                {displayWaffle(user.vote, user.waffled) ? <Waffle /> : ""}

                <span className="user-name">
                  {user.id === userId ? <Me /> : ""}{" "}
                  {user.new ? (
                    <marquee>new user connecting...</marquee>
                  ) : (
                    user.name
                  )}
                  <span className="emoji-space" id={`user-${user.id}-emoji`} style={{ opacity: 0 }}>😑</span>
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
          kickMode={kickMode}
          setKickMode={setKickMode}
          autoShowVote={autoShowVote}
          setAutoShowVote={setAutoShowVote}
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
            <div key={observer.name + index} className="observer-item">
              {leaderUser && observer.id !== userId && kickMode && (<button className="kick-ass" onClick={() => kickUser(observer.id)}>👞</button>)}
              {observer.leaderUser && <LeaderSVG />} {observer.name}
              {index < observers.length - 1 ? ", " : ""}
              <span className="emoji-space" id={`user-${observer.id}-emoji`} style={{ opacity: 0 }}>😑</span>
            </div>
          ))}
        </div>
      )}
      {joinedRoom && <Emoji socket={session} users={users} />}
      {joinedRoom && (
        <div className="observers">
          Emoji Score: {roomEmojis}
        </div>
      )}
    </>
  );
};

export { Room };