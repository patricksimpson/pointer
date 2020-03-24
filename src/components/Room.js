import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useParams } from 'react-router';
import socketIOClient from 'socket.io-client';
const Room = () => {
  let { roomId } = useParams();
  let socket;
  let isNameSet = false;
  const [session, setSession] = useState();
  const [userId, setUserId] = useState(0);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('') ;
  const [showVotes, setShowVotes] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const endpoint = 'http://0.0.0.0:4001';

  useEffect(() => {
    socket = socketIOClient(endpoint);
    socket.emit('join-session', {roomId});
    socket.on('joined-room', data => {
      setUserId(data.userId);
    });
    socket.on('person-joined', data => { console.log('got person', data); });
    socket.on('person-updated-name', data => { console.log('update person', data); });
    socket.on('cast-vote', data => {
      console.log(data);
    });
    socket.on('room-show-votes', data => {
      setShowVotes(true);
    });

    socket.on('room-hide-votes', data => {
      setShowVotes(false);
    });
    socket.on('person-list', data => {
      setUsers(data.users);
    });
    socket.on('no-such-room', data => { setNotFound(true); });
    setSession(socket);
    return () => (socket.emit('leave-room', {roomId}));
  }, []);

  const updateName = (e) => {
    setName(e.target.value);
  };

  const submitUpdateName = () => {
    socket = session;
    socket.emit('person-update-name', {name});
    setJoinedRoom(true);
  };

  const displayVote = (id, vote) => (showVotes || userId === id ? vote : 'voted');

  const usersList = (users) => {
    return(
      <ul> 
        {users ? users.map((user) => (<li key={user.id}>{user.name} {user.vote ? displayVote(user.id, user.vote) : 'not voted' }</li>)) : (<li>No one here...</li>)}
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
      {joinedRoom? (<Vote socket={session}/>) : null}
      {userId ? null: (<p>Please wait...</p>)}
      {joinedRoom ? usersList(users) :  nameInput()}
      {notFound ? (<Redirect to="/" />) : null}
    </>
  );
};

const Vote = ({socket}) => {
  let voteSequence = [0, 1, 2, 3, 5, 8, 13, '?'];

  const castVote = (vote) => {
    socket.emit('cast-vote', {vote});
  };

  const clearVotes = () => {
    socket.emit('room-clear-votes');
  };

  const showVotes = () => {
    socket.emit('room-show-votes');
  };

  return (
    <>
      <div>
        <button onClick={showVotes}>Show Votes</button>
        <button onClick={clearVotes}>Clear Votes</button>
      </div>
      <br />
      <div>
        {voteSequence.map((v) => (<button key={`key-${v}`} onClick={() => castVote(v)}>{v}</button>))}
      </div>
    </>
  );
}

export { Room };
