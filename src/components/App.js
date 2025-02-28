import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import ReactDOM from "react-dom/client";
import { endpoint } from "../endpoint";
import useSound from "use-sound";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { Start, Join } from "./session";
import { Room } from "./Room";

import { ServerStatus } from "./Stats";

const VERSION = "2.28.2025-1";

const App = () => {
  const [mode, setMode] = useState(null);
  const [sound, setSound] = useState(1);
  const [playClick] = useSound("/static/sound/click2.mp3");

  useEffect(() => {
    if (mode == null) {
      let currentMode = localStorage.getItem("mode");
      if (currentMode == 1 || currentMode == 2) {
        displayMode(currentMode);
        setMode(currentMode);
      }
    }
  }, []);

  const switchMode = () => {
    let newMode;
    if (sound) {
      playClick();
    }
    if (mode == 1) {
      newMode = 2;
    } else {
      newMode = 1;
    }
    localStorage.setItem("mode", newMode);
    displayMode(newMode);
    setMode(newMode);
  };

  const switchSoundMode = () => {
    playClick();
    if (sound) {
      localStorage.setItem("sound", 0);
      setSound(0);
    } else {
      localStorage.setItem("sound", 1);
      setSound(1);
    }
    window.dispatchEvent(new Event("storage"));
  };

  const displayMode = (whichMode) => {
    if (whichMode == 1) {
      document.querySelector("html").classList.add("dark");
      document.querySelector("body").classList.add("dark");
    } else {
      document.querySelector("html").classList.remove("dark");
      document.querySelector("body").classList.remove("dark");
    }
  };

  return (
    <>
      <Router>
        <Nav
          switchMode={switchMode}
          switchSoundMode={switchSoundMode}
          sound={sound}
        />
        <Routes>
          <Route path="/join" element={<Join />} />
          <Route path="/start-session" element={<Start />} />
          <Route path="/about" element={<About />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/" element={<Home />} />
          <Route element={NoMatch} />
        </Routes>
      </Router>
      <Footer />
    </>
  );
};

const Nav = ({ switchMode, switchSoundMode, sound }) => {
  const soundOnButton = "/static/sound-on.svg";
  const soundOffButton = "/static/sound-off.svg";
  const navigate = useNavigate();
  const location = useLocation();
  const [room, setRoom] = useState(null);
  const [button, setButton] = useState(soundOnButton);

  const doubleCheck = (e) => {
    let path = window.location.pathname;
    setRoom(null);
    if (path.includes("room")) {
      e.preventDefault();
      if (window.confirm("Are you sure you want to leave your sesson?")) {
        navigate(e.target.pathname);
      }
    }
  };

  useEffect(() => {
    let roomId = localStorage.getItem("disconnect-room");
    if (roomId) {
      setRoom(roomId);
      localStorage.removeItem("disconnect-room");
    }
  }, []);

  useEffect(() => {
    let soundOn = localStorage.getItem("sound");
    if (sound || soundOn !== "0") {
      setButton(soundOnButton);
    } else {
      setButton(soundOffButton);
    }
  }, [sound]);

  return (
    <>
      <div className="header-wrapper">
        <Link to="/" className="header" onClick={doubleCheck}>
          <h1>
            <span>Pointer</span>
          </h1>
        </Link>
        <img src="/static/logo.svg" className="header-icon" />
        <img
          src="/static/logo-dark.svg"
          className="dark-header-icon header-icon"
        />
        <span className="toggle">
          <img
            className="toggle-button"
            src="/static/mode-toggle.svg"
            alt="dark/light mode toggle"
            title="dark/light mode toggle"
            height="24px"
            width="24px"
            onClick={switchMode}
          />
        </span>
        <span className="toggle-sound">
          <img
            className="toggle-button toggle-button-sound"
            src={button}
            alt="dark/light mode toggle"
            title="sound on/off toggle"
            height="24px"
            width="24px"
            onClick={switchSoundMode}
          />
        </span>
        <nav className="header-nav">
          <ul>
            <li>
              <Link to="/" onClick={doubleCheck}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/start-session" onClick={doubleCheck}>
                Start Session
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={doubleCheck}>
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="subheader">
        <span>A simple agile pointing tool.</span>
      </div>
      {room && (
        <div>
          <h2>Thanks for using pointer!</h2>
          <p>You have been removed for being idle for over one hour...</p>
          <p>
            If this was a mistake, you can rejoin your room{" "}
            <Link to={`/room/${room}`} onClick={doubleCheck}>
              here
            </Link>
            .
          </p>
          <h3>{room}</h3>
        </div>
      )}
    </>
  );
};

const NoMatch = () => {
  return (
    <div>
      <h2>404 - Not Found</h2>
    </div>
  );
};

const Header = () => {
  return <></>;
};

const Home = () => {
  return (
    <>
      <h2>Home</h2>
      <p>
        <Link to="/join">Join a Session</Link> or{" "}
        <Link to="/start-session">Start Session</Link>
      </p>
      <ServerStatus />
    </>
  );
};

const Footer = () => {
  return (
    <>
      <div className="footer">
        Built in 2020. | <a href="https://patricksimpson.me/about">Patrick Simpson</a><br />
        Version {VERSION}
      </div>
    </>
  );
};

const About = () => {
  return (
    <>
      <h2>About</h2>
      <p>This is a free pointing tool, for agile/scrum story planning.</p>
      <p>Created by Patrick Simpson.</p>
      <p></p>
      <p>
        You can read about{" "}
        <a href="https://github.com/patricksimpson/pointer/blob/master/HOWTO.md">
          using pointer here
        </a>
        . This project is{" "}
        <a href="https://github.com/patricksimpson/pointer">
          open source on GitHub
        </a>
        .
      </p>
      <h2>Support</h2>
      <p>This tool is free to use, enjoy!</p>
      <p>
        If you find some value in this tool, please consider supporting me{" "}
        <a href="https://www.buymeacoffee.com/patricksimpson">
          https://www.buymeacoffee.com/patricksimpson
        </a>{" "}
      </p>
      <p>Thank you ☕!</p>
      <p>
        If you need help with pointer or have a suggestion file an issue on{" "}
        <a href="https://github.com/patricksimpson/pointer/issues">GitHub</a>!{" "}
      </p>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
