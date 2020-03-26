import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Stats } from '../Stats';

const Join = () => {

  const [sessionId, setSessionId] = useState('');
  const [redirect, setRedirect] = useState();

  const submitHandler = () => {
    setRedirect((<Redirect to={`/room/${sessionId}` }/>));
  };

  return redirect ? redirect : (<InputSession {...{submitHandler, sessionId, setSessionId}} />);
};

const InputSession = ({submitHandler, sessionId, setSessionId}) => {
  const handleUpdate = (e) => (setSessionId(e.target.value));

  return (
      <form onSubmit={submitHandler}>
        <h2>Join</h2>
      <div className="box join-session">
        <div>
          <label>Session ID: <br /><input type="text" value={sessionId} placeholder="session id" onChange={handleUpdate} /></label>
          <button>Join Session</button>
        </div>
        <Stats />
      </div>
      </form>
  );
};

export default Join;
