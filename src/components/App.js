import React from 'react';
import ReactDOM from 'react-dom';

import { Start, Join } from './session';

const App = () => {
  return (
      <>
      <Header />
      <Start />
      <Join />
      </>
  );
};

const Header = () => {
  return (
      <>
      <h1>Pointer</h1>
      <div className="subheader">Welcome to pointer... all of your pointing needs.</div>
      </>
  );
};


ReactDOM.render(<App />, document.getElementById('root'));

export default App;
