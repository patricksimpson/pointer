import React from 'react';
import ReactDOM from 'react-dom';
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
  return (
      <>
      <h1>Pointer</h1>
      <div className="subheader">Pointing tool</div>
      </>
  );
};

const Home = () => {
  return (
    <>
      <h2>Home</h2>
      <p>Join or Start a Session...</p>
    </>
  );
}

const About = () => {
  return (
    <>
    <h2>About</h2>
      <p>This is a pointing tool, for story planning</p>
      <p>Created by Patrick Simpson</p>
      <p><a href="https://github.com/patricksimpson/pointer">https://github.com/patricksimpson/pointer</a></p>
    </>
  );
};


ReactDOM.render(<App />, document.getElementById('root'));

export default App;
