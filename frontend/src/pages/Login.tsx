import { useAuth } from '../contexts/AuthContext'; // Import Hook
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth(); // ดึง function login มาใช้
  const navigate = useNavigate();

  const handleLoginMock = () => {
    // จำลองข้อมูล User ที่ได้จาก Backend
    const mockUser = {
      id: "1",
      username: "testuser",
      role: "user" as const // หรือ "admin"
    };
    
    login(mockUser); // อัปเดต Global State
    alert("เข้าสู่ระบบสำเร็จ (Mock)");
    navigate('/home'); // Redirect ไปหน้า Home
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h1>
      {/* Form Login - ปุ่มจำลองการกด Login */}
      <button 
        onClick={handleLoginMock}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Click to Login (Mock)
      </button>
    </div>
  );
};

export default Login;