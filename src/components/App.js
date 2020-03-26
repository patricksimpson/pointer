import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import ReactDOM from 'react-dom';
import { endpoint } from '../endpoint';

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link
} from 'react-router-dom';

import { Start, Join } from './session';
import { Room } from './Room';

const App = () => {

  return (
    <>
      <Header />
      <Router>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/start-session">Start Session</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>
        <Switch>
          <Route path="/join">
            <Join/>
          </Route>
          <Route path="/start-session">
            <Start/>
          </Route>
          <Route path="/about">
            <About/>
          </Route>
          <Route path="/room/:roomId" component={Room} />
          <Route path="/">
            <Home />
          </Route>
          <Route component={NoMatch}/>
        </Switch>
      </Router>
      <Footer />
    </>
  );
};

const Stats = () => {
  const [response, setResponse] = useState(0);
  const [usersOnline, setUsersOnline] = useState(0);
  const [roomsOnline, setRoomsOnline] = useState(0);

  useEffect(() => {
    let socket = socketIOClient(endpoint);
    socket.on('api', data => setResponse(data));
    socket.on('users-online', data => setUsersOnline(data.users));
    socket.on('rooms-online', data => setRoomsOnline(data.rooms));
  }, []);

  return response ? (
    <div className="stats">
      <p>Server Online</p>
      <p>{usersOnline} users online</p>
      <p>{roomsOnline} rooms online</p>
    </div>
  ) : (<div className="stats"><p>Server Offline</p></div>);
};

const NoMatch = () => {
  return (
    <div>
      <h2>404 - Not Found</h2>
    </div>
  );
};

const Header = () => {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    if(mode == null) {
      let currentMode = localStorage.getItem('mode');
      if (currentMode == 1 || currentMode == 2) {
        displayMode(currentMode);
        setMode(currentMode);
      }
    }
  });

  const switchMode = () => {
    let newMode;
    if(mode == 1) {
      newMode = 2;
    } else {
      newMode = 1;
    }
    localStorage.setItem('mode', newMode);
    displayMode(newMode);
    setMode(newMode);
  };

  const displayMode = (whichMode) => {
    if(whichMode == 1) {
      document.querySelector('html').classList.add('dark');
      document.querySelector('body').classList.add('dark');
    } else {
      document.querySelector('html').classList.remove('dark');
      document.querySelector('body').classList.remove('dark');
    }
  };

  return (
      <>
        <h1>Pointer</h1>
        <span className="toggle">
          <img className="toggle-button" src="/static/mode-toggle.svg" alt="dark/light mode toggle" title="dark/light mode toggle" height="24px" width="24px" onClick={switchMode}/>
        </span>
        <div className="subheader">
          <span>A simple agile pointing tool.</span>
        </div>
      </>
  );
};

const Home = () => {
  return (
    <>
      <h2>Home</h2>
      <p><Link to="/join">Join a Session</Link> or <Link to="/start-session">Start Session</Link></p>
      <Stats />
    </>
  );
};

const Footer = () => {
  return (
    <>
      <div className="footer">Built in 2020 | <a href="https://patricksimpson.me/about">Patrick Simpson</a></div>
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
      <p><a href="https://github.com/patricksimpson/pointer">https://github.com/patricksimpson/pointer</a></p>
    </>
  );
};


ReactDOM.render(<App />, document.getElementById('root'));

export default App;
