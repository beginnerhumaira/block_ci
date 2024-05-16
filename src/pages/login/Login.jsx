import React, { useState } from "react";
import "./login.scss";
import { auth } from "../../firebase";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password)
       .then((userCredential) => {
          const user = userCredential.user;
          console.log(user);
          setLoginStatus("success");
          navigate("/dashboard");
        })
       .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
          setLoginStatus(errorCode)
          if (errorCode === "auth/wrong-password") {
            setLoginStatus("wrong-password");
          } else if (errorCode === "auth/user-not-found") {
            setLoginStatus("user-not-found");
          }
          (alert(loginStatus))
        });
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginStatus(error)
      
    }
    
  };

  return (
    <div className="login-container">

      
      <div className="login-box">
        <h1 className="login-title">BlockCi</h1>
        <form onSubmit={onSubmit} className="login-form">
          <label>Email Address:</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email address"
          />
          <label>Password:</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Enter your password"
          />
          <button type="submit">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;