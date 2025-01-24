import React from 'react';
import { useUser } from '../context/UserProvider';
import { Navigate } from 'react-router-dom';

interface SecuredProps {
    children: React.ReactNode;
}

const Secured = ({ children }: SecuredProps) => {
  const { user } = useUser();

  if (!user?.id) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default Secured;