import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export default function InputForm({ setIsOpen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? "signUp" : "login";

    try {
      const res = await axios.post(`${API_BASE_URL}/${endpoint}`, { email, password });

      if (res.data?.token) localStorage.setItem("token", res.data.token);
      if (res.data?.user) localStorage.setItem("user", JSON.stringify(res.data.user));

      if (typeof setIsOpen === "function") setIsOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Something went wrong";
      setError(errMsg);
    }
  };

  return (
    <form className='form' onSubmit={handleOnSubmit}>
      <div className='form-control'>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className='input'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className='form-control'>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className='input'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>

      <button type='submit'>{isSignUp ? "Sign Up" : "Login"}</button>

      {error && <h6 className='error'>{String(error)}</h6>}

      <p 
        style={{ cursor: "pointer", color: "blue" }}
        onClick={() => setIsSignUp(prev => !prev)}
      >
        {isSignUp ? "Already have an account?" : "Create new account"}
      </p>
    </form>
  );
}
