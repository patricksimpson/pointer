import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useParams } from 'react-router';
import socketIOClient from 'socket.io-client';
import { endpoint } from '../endpoint';
import { CopyButton } from './CopyButton';

const Room = () => {
  let { roomId } = useParams();
  let socket;
  let isNameSet = false;

  const [currentVote, setCurrentVote] = useState(-1);
  const [session, setSession] = useState();
  const [userId, setUserId] = useState(0);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('') ;
  const [showVotes, setShowVotes] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [leaderUser, setLeaderUser] = useState(false);
  const [waffledUser, setWaffledUser] = useState(false);

  useEffect(() => {
    if (name === '') {
      let hasLocalName = localStorage.getItem('name');
      if (typeof hasLocalName !== 'undefined' && hasLocalName !== null) {
        setName(hasLocalName);
      }
    }
    socket = socketIOClient(endpoint);
    socket.emit('join-session', {roomId});
    socket.on('joined-room', data => {
      setUserId(data.userId);
    });
    socket.on('room-show-votes', data => {
      setShowVotes(true);
    });
    socket.on('room-hide-votes', data => {
      setShowVotes(false);
    });
    socket.on('promoted-user', data => {
      setLeaderUser(data.id);
    });
    socket.on('person-list', data => {
      setUsers(data.users);
    });
    socket.on('no-such-room', data => { setNotFound(true); });
    setSession(socket);
    return (() => {
      socket.emit('leave-room', {roomId});
      socket.disconnect();
    });
  }, []);

  const updateName = (e) => {
    setName(e.target.value);
  };

  const submitUpdateName = (e) => {
    e.preventDefault();

    if (name.trim() === '') {
      alert('Name is required');
      e.preventDefault();
      return false;
    }

    socket = session;
    socket.emit('person-update-name', {name});
    setJoinedRoom(true);
    localStorage.setItem('name', name);
    return false;
  };

  const displayVote = (id, vote) => (showVotes ? vote.toString() : (userId === id ? currentVote : (vote ? 'voted' : 'not voted')));

  const promote = () => {
    socket = session;
    let leadConfirm = confirm("Are you sure you want to take lead of this room?");
    if (leadConfirm) {
      socket.emit('promote-user', {userId});
    }
  };

  const usersList = (users) => {
    return(
      <ul className="user-list"> 
        {users ? users.map((user) => (<li key={user.id} className={`user${user.id === userId ? ' current-user' : ''}${user.leaderUser ? ' leader' : ''}`}>{showVotes && waffledUser ? <Waffle /> : ''}<span className='user-name'>{user.name}</span>{user.leaderUser ? <Leader /> : '' }<span className='user-vote'>{user.vote ? displayVote(user.id, user.vote) : 'not voted' }</span></li>)) : (<li>No one here...</li>)}
      </ul>
    );
  };

  const nameInput = () => {
    return (
      <form className="input-name" onSubmit={submitUpdateName}>
        <h3>Your Name</h3>
        <input autoFocus type="text" value={name} onChange={updateName} maxLength="26" placeholder="name"/> 
        <button onClick={submitUpdateName}>Set Name</button>
      </form>
    );
  };

  return notFound ? (<><h2>Not found</h2><p> Try another session, or create one!</p></>) : (
      <>
        <div className="header-wrapper">
          <h2 className="heading">Room - {roomId}</h2>
          <CopyButton />
        </div>
        {joinedRoom? (<Vote socket={session} currentVote={currentVote} setCurrentVote={setCurrentVote} setWaffledUser={setWaffledUser} leaderUser={leaderUser == userId} promote={promote} />) : null}
        {joinedRoom ? usersList(users) :  nameInput()}
      </>
  );
};

const Vote = ({socket, currentVote, setCurrentVote, setWaffledUser, leaderUser, promote}) => {
  let voteSequence = [false, '0', '0.5', 1, 2, 3, 5, 8, 13, 21, '?'];


  const castVote = (vote) => {
    setWaffledUser(currentVote != -1 && currentVote != vote);
    setCurrentVote(vote);
    socket.emit('cast-vote', {vote: vote});
  };

  const clearVotes = () => {
    setWaffledUser(false);
    socket.emit('room-clear-votes');
  };

  const showVotes = () => {
    setWaffledUser(false);
    socket.emit('room-show-votes');
  };

  const hideVotes = () => {
    setWaffledUser(false);
    socket.emit('room-hide-votes');
  };

  const voteClass = (v) => {
    return `vote${v === currentVote ? ' current-vote' : ''}`;
  };

  return (
    <>
      <div className="room-control">
        {leaderUser ? (
        <>
          <button onClick={showVotes}>Show Votes</button>
          <button onClick={hideVotes}>Hide Votes</button>
          <button onClick={clearVotes}>Clear Votes</button>
        </>
      ) : (<button onClick={promote}>Take Lead</button>)}
      </div>
      <div className="vote-control">
      {voteSequence.map((v) => (<button key={`key-${v.toString()}`} className={voteClass(v)} onClick={() => castVote(v)}>{v ? v : 'Remove Vote'}</button>))}
      </div>
    </>
  );
};

const Leader = () => {
  return (
    <div className="crown icon" title="This is the leader. Leader controls showing, hiding, and clearning votes. There can only be one leader at a time.">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.896 10l-4.896-8-4.896 8-7.104-4 3 11v5h18v-5l3-11-7.104 4zm-11.896 10v-2h14v2h-14zm14.2-4h-14.4l-1.612-5.909 4.615 2.598 4.197-6.857 4.197 6.857 4.615-2.598-1.612 5.909z"/></svg> 
    </div>
  );
};

const Waffle = () => {
  return (
    <div className="waffle icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64" xlinkHref="http://www.w3.org/1999/xlink">
        <path data-name="layer2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M40.5 3.2L3.2 40.5m50.6-29.1L11.3 53.8m50-28.6l-36.1 36M22.7 3.5l37.8 37.8M9.6 11.9L52 54.3M2.6 26.1l35.3 35.4"></path>
        <circle data-name="layer1" cx="32" cy="32" r="30" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"></circle>
      </svg>
    </div>
  )
}

export { Room };
