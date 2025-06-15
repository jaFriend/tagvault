import React from 'react';
import NavBar from './NavBar';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div>
      <NavBar />
      <div className="landing-container">
        <h1>Welcome to TagVault!</h1>
        <p>Organize your links, images, and files with ease.</p>
      </div>
    </div >
  );
};

export default LandingPage;
