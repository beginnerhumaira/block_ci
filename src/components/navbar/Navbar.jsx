import "./navbar.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useEffect, useState } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";

const Navbar = ({isShowSearch, search, setSearch}) => {
  const { dispatch } = useContext(DarkModeContext);

  const navigate = useNavigate();
  const handleLogout = () => {
    signOut(auth)
    .then(() => {
      navigate("/")
      console.log("Signed out successfully")
    })
    .catch((error) => {
    })
  
  };
  
 

  return (
    <div className="navbar">
      <div className="wrapper">
        {isShowSearch && <div className="search">
          <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
           type="text" placeholder="Search..." />
          <SearchOutlinedIcon />
        </div>}
        <div className="items">
          {/* <div className="item">
            <LanguageOutlinedIcon className="icon" />
            English
          </div> */}
          <div className="item">
            <DarkModeOutlinedIcon
              className="icon"
              onClick={() => dispatch({ type: "TOGGLE" })}
            />
          </div>
          
          
          
          <div className="item">
          <button className="logout-button" onClick={handleLogout}>
        Logout
      </button> 
          </div>
        </div>
      </div>
    </div>
  );
}
;

export default Navbar;
