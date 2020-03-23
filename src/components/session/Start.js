import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { Redirect } from 'react-router-dom';

const Start = () => {
  
  const [response, setResponse] = useState(0);
  const [sessionName, setSessionName] = useState('') ;
  const [redirect, setRediect] = useState();
  const endpoint = 'http://0.0.0.0:4001';
  let socket;

  useEffect(() => {
    socket = socketIOClient(endpoint);
    socket.on('api', data => setResponse(data));
  }, []);

  const startSession = () => {
    console.log(sessionName);
    socket = socketIOClient(endpoint);
    socket.emit('start-session', {sessionName});
    socket.on('create-room', data => {
      console.log(data);
      setRediect(data);
    });
  };

  const updateSession = (e) => {
    setSessionName(e.target.value);
  };

  return (
    <>
    <h2>Start Session</h2>
      <div className="box start-session">
        <input type="text" name="session-name" placeholder="session name" value={sessionName} onChange={updateSession}/>
        <button onClick={startSession}>Start Session</button>
        <div> 
            {response ? (<p> {response.data} </p>): (<p>Loading...</p>)}
        </div>
        {redirect ? (<Redirect to={`/room/${redirect.data}`} />) : null}
      </div>
    </>
  );
};

export default Start;
