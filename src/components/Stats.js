import React, { useState, useEffect } from 'react';
import { endpoint } from '../endpoint';
import socketIOClient from 'socket.io-client';

const ServerStatus = () => {
  const [response, setResponse] = useState(0);
  const [usersOnline, setUsersOnline] = useState(0);
  const [roomsOnline, setRoomsOnline] = useState(0);

  useEffect(() => {
    let socket = socketIOClient(endpoint);
    socket.on('server-status', data => {
      setResponse(data.status);
      setUsersOnline(data.users);
      setRoomsOnline(data.rooms);
    });
    return (() => {
      socket.disconnect();
    });
  }, []);

  return response ? (
    <div className="stats">
      <p>Server Online <GoodIcon /></p>
      <p>{usersOnline} users online</p>
      <p>{roomsOnline} rooms online</p>
    </div>
  ) : (<div className="stats"><p>Server Offline <BadIcon /></p></div>);
};

const GoodIcon = () => (
  <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 17l-5-5.299 1.399-1.43 3.574 3.736 6.572-7.007 1.455 1.403-8 8.597z"/></svg>
);

const BadIcon = () => (
  <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.151 17.943l-4.143-4.102-4.117 4.159-1.833-1.833 4.104-4.157-4.162-4.119 1.833-1.833 4.155 4.102 4.106-4.16 1.849 1.849-4.1 4.141 4.157 4.104-1.849 1.849z"/></svg>
);


export { ServerStatus, GoodIcon, BadIcon };
