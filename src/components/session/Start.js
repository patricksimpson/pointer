import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { Redirect } from "react-router-dom";

import { endpoint } from "../../endpoint";

const Start = () => {
  const [response, setResponse] = useState(0);
  const [sessionName, setSessionName] = useState("");
  const [redirect, setRediect] = useState();
  let socket;

  useEffect(() => {
    socket = socketIOClient(endpoint);
    socket.on("api", (data) => setResponse(data));

    return () => {
      socket.disconnect();
      socket = null;
    };
  }, []);

  const startSession = () => {
    socket = socketIOClient(endpoint);
    socket.emit("start-session", { sessionName: null, votes: roomVotes });
    socket.on("create-room", (data) => {
      setRediect(data);
    });
  };

  const updateSession = (e) => {
    setSessionName(e.target.value);
  };

  const [voteSequence, setVoteSequence] = useState([
    "0",
    "0.5",
    1,
    2,
    3,
    5,
    8,
    13,
    21,
    "?",
  ]);
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

  const [roomVotes, setRoomVotes] = useState(voteSequenceV);

  useEffect(() => {
    let oldRoomVotes = localStorage.getItem("keep-safe-votes");
    try {
      let data = JSON.parse(oldRoomVotes);
      if (data) {
        setRoomVotes(data);
      }
    } catch (e) {
      console.error("Failed to load old vote info");
    }
  }, []);

  const toggle = (v) => {
    let i = voteSequence.indexOf(v);
    let d = [...roomVotes];
    d[i] = !d[i];
    setRoomVotes(d);
    localStorage.setItem("keep-safe-votes", JSON.stringify(d));
  };

  return (
    <>
      <h2>Start Session</h2>
      <div className="box start-session">
        <div className="vote-control">
          Session Points:{" "}
          {voteSequence.map((v, i) => (
            <button
              key={`key-${v.toString()}`}
              className={`vote-button ${roomVotes[i] ? "current-vote" : ""}`}
              onClick={() => toggle(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <button onClick={startSession}>Start Session</button>
        {redirect ? <Redirect to={`/room/${redirect.data}`} /> : null}
      </div>
    </>
  );
};

export default Start;
