import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { type ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'user')[]; // เผื่ออนาคตอยากแยกสิทธิ์ Admin
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  
  // ✅ 1. ดึง Token มาเช็คเป็นด่านแรกสุด 
  const token = localStorage.getItem('token'); 

  // 🚪 2. ถ้าไม่มี Token เลย (แปลว่าไม่ได้ล็อกอินแน่ๆ) ให้เตะไปหน้า Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ⏳ 3. ถ้ามี Token แต่ระบบกำลังโหลด Context อยู่ ให้รอเงียบๆ (ไม่กระพริบไปหน้า Login)
  if (isLoading) {
    return null; 
  }

  // 🛡️ 4. [เผื่ออนาคต] ถ้าโหลดเสร็จแล้วเช็คสิทธิ์ Role 
  if (user && allowedRoles && !allowedRoles.includes((user as any).role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;