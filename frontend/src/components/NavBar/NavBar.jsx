import './NavBar.css';
import { useNavigate } from 'react-router';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate('/')} >
        <img src="tagvault.svg" alt="TagVault Logo" className="logo" />
        <span className="brand-name">TagVault</span>
      </div>
      <div className="navbar-right">
        <SignedOut>
          <SignInButton mode='modal' className="nav-link">Sign In</SignInButton>
          <SignUpButton mode='modal' className="nav-button">Sign Up</SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}

export default NavBar;
