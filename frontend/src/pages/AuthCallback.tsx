import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUserFromGoogle } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user = params.get('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        setUserFromGoogle(token, parsedUser);
        setTimeout(() => navigate('/'), 500);
      } catch (err) {
        console.error('Parse error:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl">กำลังเข้าสู่ระบบ...</p>
    </div>
  );
};

export default AuthCallback;