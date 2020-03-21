import React from 'react';

const Join = () => {
  return (
      <div className="box join-session">

      <div>
        <label>Session ID:<input type="text" placeholder="session id" /></label>
      </div>
      <div>
        <label>Name: <input type="text" placeholder="your name" /></label>
      </div>
      <div>
        <button>Join Session</button>
      </div>

      </div>
  );
};

export default Join;
