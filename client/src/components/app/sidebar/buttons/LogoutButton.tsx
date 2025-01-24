import { useCallback } from 'react';
import { useUser } from '@/context/UserProvider';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useUser() ?? {};
  const navigate = useNavigate();

  const logoutHandler = useCallback(async () => {
    if (logout) {
      const redirectTo = await logout();
      if (redirectTo) navigate(redirectTo);
      else navigate('/');
    }
  }, [logout, navigate]);

  return (
    <DropdownMenuItem className="cursor-pointer" onClick={logoutHandler}>
      Logout
    </DropdownMenuItem>
  );
};

export default LogoutButton;
