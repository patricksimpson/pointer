import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useParams } from 'react-router';
import socketIOClient from 'socket.io-client';
const Room = () => {
  let { roomId } = useParams();
  let socket;
  let isNameSet = false;
  const [session, setSession] = useState();
  const [response, setResponse] = useState(0);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState() ;
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const endpoint = 'http://0.0.0.0:4001';

  useEffect(() => {
    socket = socketIOClient(endpoint);
    socket.emit('join-session', {roomId});
    socket.on('join', data => setResponse(data));
    socket.on('person-joined', data => { console.log('got person', data); });
    socket.on('person-updated-name', data => { console.log('update person', data); });
    socket.on('person-list', data => {
      setUsers(data.users);
    });
    socket.on('no-such-room', data => { setNotFound(true); });
    setSession(socket);
    return () => (socket.emit('disconnect'));
  }, []);

  const updateName = (e) => {
    setName(e.target.value);
  };

  const submitUpdateName = () => {
    socket = session;
    socket.emit('person-update-name', {name});
    setJoinedRoom(true);
  };

  const usersList = (users) => {
    return(
      <ul> 
        {users ? users.map((user) => (<li>{user.name}</li>)) : (<li>No one here...</li>)}
      </ul>
    );
  };

  const nameInput = () => {
    return (
      <div className="input-name">
        <h3>Your Name</h3>
        <input type="text" value={name} onChange={updateName}/> 
        <button onClick={submitUpdateName}>Update</button>
      </div>
    );
  };

  return(
    <>
      <h2>Room - {roomId}</h2>
      {response ? null: (<p>Please wait...</p>)}
      {joinedRoom ? usersList(users) :  nameInput()}
      {notFound ? (<Redirect to="/" />) : null}
    </>
  );
};

export { Room };
