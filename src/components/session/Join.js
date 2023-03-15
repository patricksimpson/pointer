import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const Join = () => {
  const [sessionId, setSessionId] = useState("");
  const [redirect, setRedirect] = useState();
  const [observer, setObserver] = useState(false);

  const submitHandler = () => {
    setRedirect(<Navigate to={`/room/${sessionId}`} />);
  };

  return redirect ? (
    redirect
  ) : (
    <InputSession {...{ submitHandler, sessionId, setSessionId, setObserver }} />
  );
};

const InputSession = ({ submitHandler, sessionId, setSessionId, setObserver }) => {
  const handleUpdate = (e) => setSessionId(e.target.value);

  return (
    <form onSubmit={submitHandler}>
      <h2>Join</h2>
      <div className="box join-session">
        <div>
          <label>
            Session ID: <br />
            <input
              type="text"
              value={sessionId}
              placeholder="session id"
              onChange={handleUpdate}
            />
          </label>
          <button onClick={()=>setObserver(false)}>Join session</button>
        </div>
      </div>
    </form>
  );
};

export default Join;
