import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import img1 from '../Images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faArrowUp, faArrowDown, faUser, faSignOutAlt, faRocket, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import '../Styles/Sidebar.css'; // Ensure to have Sidebar.css for styling

const Sidebar = ({ children }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('loginDetails')).data;
    setUserData(data);
  }, []);

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage
    navigate('/signup'); // Redirect to login page
  };

  return (
    <div className='Main'>
    <div className="layout">
      <div className="user-profile" onClick={toggleProfileMenu}>
        <FontAwesomeIcon icon={faUser} className="profile-icon" />
        <span className="user-name"><strong>&nbsp; {userData.companyName}&nbsp; </strong></span>
        {profileMenuOpen && (
          <div className="profile-menu">
            <button className="logout-button" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span><strong> &nbsp; Logout</strong></span>
            </button>
          </div>
        )}
      </div>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={img1} alt="Logo" className="logo-image" />
        </div>
        <ul className="sidebar-menu">
        <li>
            <Link to="/">
              <FontAwesomeIcon icon={faRocket} />
              <span className="menu-text">Deployment</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <FontAwesomeIcon icon={faTachometerAlt} />
              <span className="menu-text">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/scaleup">
              <FontAwesomeIcon icon={faArrowUp} />
              <span className="menu-text">&nbsp;Scale Up</span>
            </Link>
          </li>
          <li>
            <Link to="/scaledown">
              <FontAwesomeIcon icon={faArrowDown} />
              <span className="menu-text">&nbsp;Scale Down</span>
            </Link>
          </li>
          <li>
            <Link to="/cloudsiem">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <span className="menu-text">&nbsp;SIEM</span>
            </Link>
          </li>
        </ul>
      </aside>
    </div>
    </div>
  );
};

export default Sidebar;
