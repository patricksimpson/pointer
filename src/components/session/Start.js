import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const Start = () => {
  
  const [response, setResponse] = useState(0);
  const endpoint = 'http://0.0.0.0:4001';

  useEffect(() => {
    const socket = socketIOClient(endpoint);
    socket.on('api', data => setResponse(data));
  }, []);

  return (
      <div className="box start-session">
        <button>Start Session</button>
        <div> 
            {response ? (<p> {response.data} </p>): (<p>Loading...</p>)}
        </div>
      </div>
  );
};

export default Start;
