import React, { useState } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for conditional navigation
import Sidebar from '../Components/sidebar';
import '../Styles/DeploymentOptions.css'; // Import the CSS file
// import Footer from '../Components/footer';

const DeploymentOptions = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [redirectTo, setRedirectTo] = useState(false); // State to handle navigation

  const handleOptionClick = (option) => {
    setSelectedOption(option === selectedOption ? null : option); // Toggle selection
  };

  const handleNextClick = () => {
    // Handle next button click action here
    console.log("Next button clicked");
    // Determine where to navigate based on selectedOption
    if (selectedOption === "Standalone Cloud Setup") {
      setRedirectTo('/networkscanner'); // Redirect to Discoveredmachines
    } else if (selectedOption === "Distributed Cloud Setup") {
      setRedirectTo('/error'); // Redirect to error page
    }
  };

  // Render Navigate component if redirectTo is true
  if (redirectTo) {
    return <Navigate to={redirectTo} />;
  }

  return (
    <div className="container">
      <div className="main-content">
        {/* Add Google Fonts import */}
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
          `}
        </style>

        <h1>Deployment Options 🚀</h1>
        <div className="options-container">
          <div
            className={`option-box ${selectedOption === "Standalone Cloud Setup" ? 'selected' : ''}`}
            onClick={() => handleOptionClick("Standalone Cloud Setup")}
          >
            <div className="option">
              <div className="option-content front">
                <div className="option-text"><b>Single-node Setup</b></div>
              </div>
              <div className="option-content back">
                <div className="option-text"><strong>A self-contained cloud infrastructure managed by a single node.</strong></div>
              </div>
            </div>
          </div>
          <div
            className={`option-box ${selectedOption === "Distributed Cloud Setup" ? 'selected' : ''}`}
            onClick={() => handleOptionClick("Distributed Cloud Setup")}
          >
            <div className="option">
              <div className="option-content front">
                <div className="option-text"><b>Multi-node Setup</b></div>
              </div>
              <div className="option-content back">
                <div className="option-text"><strong>A Distributed cloud setup across multiple nodes.</strong></div>
              </div>
            </div>
          </div>
        </div>
        <button className="nextButton" onClick={handleNextClick} disabled={!selectedOption}>
          <strong>Next</strong>
        </button>
      </div>
      <Sidebar />
    </div>
  );
};

export default DeploymentOptions;
