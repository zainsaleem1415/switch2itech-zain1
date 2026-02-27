import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/ContextProvider';

const RequestAuth = () => {
  const { authenticated, loading } = useAuth();

  // If we are still checking the session, show a generic loading state or nothing
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If authenticated, redirect away from login/signup to dashboard
  return authenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export default RequestAuth;