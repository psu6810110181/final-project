import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api'; 

export interface User {
  id?: string;
  username: string;
  role: 'admin' | 'user';
  token?: string;
  userImage?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<User>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUserFromGoogle: (token: string, userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // เช็ก Token เมื่อเปิดเว็บขึ้นมา
  useEffect(() => {
    // ✅ หา Token และ User Data จาก sessionStorage ก่อน (ถ้าไม่ได้ติ๊กจำฉัน) แล้วค่อยหาใน localStorage
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');
    
    if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to parse user data", error);
          // ถ้าข้อมูลเสีย ให้ล้างทิ้งทั้งสองที่
          localStorage.removeItem('user_data');
          localStorage.removeItem('token');
          sessionStorage.removeItem('user_data');
          sessionStorage.removeItem('token');
        }
    }
    setIsLoading(false);
  }, []);

  // --- ฟังก์ชัน Login ---
  const login = async (credentials: any) => {
    try {
      // ✅ แยก rememberMe ออกมา ตัวแปรที่เหลือส่งไปให้ Backend ปกติ
      const { rememberMe, ...apiCredentials } = credentials; 
      
      const data = await loginUser(apiCredentials);
      const userData: User = {
        ...data.user,
        token: data.access_token 
      };

      setUser(userData);
      
      // ✅ ตรวจสอบว่าผู้ใช้ติ๊ก "จดจำฉัน" หรือไม่
      if (rememberMe) {
        // ติ๊ก "จดจำฉัน" -> เก็บไว้ใน localStorage (อยู่ได้จนกว่าจะหมดอายุ)
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(userData));
      } else {
        // ไม่ติ๊ก "จดจำฉัน" -> เก็บไว้ใน sessionStorage (หายไปเมื่อปิดแท็บ)
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('user_data', JSON.stringify(userData));
      }

      return userData; 
    } catch (error) {
      console.error("Login Failed:", error);
      throw error;
    }
  };

  // --- ฟังก์ชัน Register ---
  const register = async (userData: any) => {
    try {
      const data = await registerUser(userData);
      console.log("Register success:", data);
    } catch (error) {
      console.error("Register Error:", error);
      throw error;
    }
  };

  // --- ฟังก์ชัน Login ด้วย Google ---
  const setUserFromGoogle = (token: string, userData: any) => {
    const user: User = {
      ...userData,
      token: token,
    };
    setUser(user);
    // ค่าเริ่มต้นของ Google Login ให้จำค่าไว้เลย
    localStorage.setItem('token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
  };

  // --- ฟังก์ชัน Logout ---
  const logout = () => {
    setUser(null);
    // ✅ ล้างข้อมูลทิ้งทั้งสองที่ เพื่อให้มั่นใจว่าออกระบบจริงๆ
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUserFromGoogle, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};