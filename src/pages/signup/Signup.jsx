import React, { useState } from "react";
import "./signup.scss";
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password)
       .then((userCredential) => {
          const user = userCredential.user;
          console.log(user);
          setSignUpSuccess(true);
          navigate("/login");
        })
       .catch((error) => {
          const errorCode = error.code;
          alert(errorCode)
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
        });
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div className="signup-container">
      {signUpSuccess && (
        <div className="signup-success">
          <h2>Sign Up Successful!</h2>
          <p>Welcome to BlockCi! Let's save our donations</p>
        </div>
      )}
      <div className="signup-box">
        <h1 className="signup-title">BlockCi</h1>
        <form onSubmit={onSubmit} className="signup-form">
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
          <button type="submit">Sign Up</button>
        </form>
        <p className="login-link">
          Already have an account?
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;