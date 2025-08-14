import React, { useState } from 'react'
import axios from 'axios'

export default function InputForm({ setIsOpen }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState("")

  const handleOnSubmit = async (e) => {
    e.preventDefault()
    let endpoint = isSignUp ? "signUp" : "login"

    try {
      const res = await axios.post(`http://localhost:5000/${endpoint}`, { email, password })
      
      // Store token
      localStorage.setItem("token", res.data.token)
      
      // Store entire user object
      localStorage.setItem("user", JSON.stringify(res.data.user))
      
      // Store userId separately for API calls
      localStorage.setItem("userId", res.data.user._id)

      setIsOpen()
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong")
    }
  }

  return (
    <>
      <form className='form' onSubmit={handleOnSubmit}>
        <div className='form-control'>
          <label>Email</label>
          <input 
            type="email" 
            className='input' 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className='form-control'>
          <label>Password</label>
          <input 
            type="password" 
            className='input' 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type='submit'>{isSignUp ? "Sign Up" : "Login"}</button><br />
        {error && <h6 className='error'>{error}</h6>}<br />
        <p onClick={() => setIsSignUp(pre => !pre)}>
          {isSignUp ? "Already have an account" : "Create new account"}
        </p>
      </form>
    </>
  )
}
