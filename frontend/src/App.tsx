import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
// Import หน้าอื่นๆ ที่จะทำในลำดับถัดไป (ใส่ Placeholder ไว้ก่อน)
const Login = () => <div>Login Page</div>;
const Register = () => <div>Register Page</div>;
const Home = () => <div>Home Page (User)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        {/* Redirect กรณีไม่เจอหน้า */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;