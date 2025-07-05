import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Routes, Route, Navigate } from 'react-router';
import './App.css'

import LandingPage from './components/LandingPage';
import MainUserPage from './components/MainUserPage';
import NotFoundPage from './components/NotFoundPage'
import NavBar from './components/NavBar';

function App() {

  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/'
          element={
            <>
              <SignedOut>
                <LandingPage />
              </SignedOut>
              <SignedIn>
                <Navigate to='/app' />
              </SignedIn>
            </>
          }
        />
        <Route path='/app'
          element={
            <>
              <SignedOut>
                <Navigate to='/' />
              </SignedOut>
              <SignedIn>
                <MainUserPage />
              </SignedIn>

            </>
          }
        />
        <Route path='*' element={<Navigate to='/404' />} />
        <Route path='/404' element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App
