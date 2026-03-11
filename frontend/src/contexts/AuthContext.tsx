// import { createContext, useContext, useState,type ReactNode, useEffect } from 'react';
// import { loginUser } from '../services/api'; // Import API ที่สร้างเมื่อกี้
// import { registerUser } from '../services/api';

// // ปรับ User Type ให้ตรงกับข้อมูลจริง (คร่าวๆ)
// export interface User {
//   id?: string;
//   username: string;
//   role: 'admin' | 'user';
//   token?: string; // เก็บ Token ด้วย
// }

// interface AuthContextType {
//   user: User | null;
//   login: (credentials: any) => Promise<void>;
//   register: (userData: any) => Promise<void>; // เปลี่ยนเป็นรับ username/password
//   logout: () => void;
//   isAuthenticated: boolean;
//   isLoading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);

//   // เช็ค Token เมื่อเปิดเว็บขึ้นมา (Persist Login)
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const savedUser = localStorage.getItem('user_data');
//     if (token && savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//     setIsLoading(false);
//   }, []);

//   // Function Login เชื่อม Backend
//   const login = async (credentials: any) => {
//     try {
//       const data = await loginUser(credentials);

//   // เพิ่มฟังก์ชันนี้ลงไปครับ
//   const register = async (userData: any) => {
//     try {
//       console.log("Register data:", userData);
//     } catch (error) {
//       console.error("Register Error:", error);
//       throw error;
//     }
//   };
      
//       // data คือสิ่งที่ Backend ส่งกลับมา (เช่น { access_token: "..." })
//       // *หมายเหตุ: ปกติ Backend ควรส่ง user info กลับมาด้วย หรือเราต้อง decode token
//       // เพื่อความง่ายใน Phase นี้ เราจะสมมติข้อมูล User ไปก่อน หรือรอแก้ Backend ให้ส่ง User กลับมา
      
//       // สมมติว่าเรา Set user จาก username ที่กรอกไปก่อน (เพื่อ UX) 
//       // หรือถ้า Backend ส่ง user object มาให้ใช้ data.user
//       const userData: User = {
//         ...data.user,
//         token: data.access_token 
//       };

//       setUser(userData);
//       localStorage.setItem('token', data.access_token);
//       localStorage.setItem('user_data', JSON.stringify(userData));
      
//     } catch (error) {
//       console.error("Login Failed:", error);
//       throw error; // ส่ง error กลับไปให้หน้า Login จัดการ
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('user_data');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api'; 

export interface User {
  id?: string;
  username: string;
  role: 'admin' | 'user';
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<User>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUserFromGoogle: (token: string, userData: User) => void; // ฟังก์ชันใหม่สำหรับ Google Login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user_data');
    if (token && savedUser) {
        try {
        setUser(JSON.parse(savedUser));
        } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem('user_data');
        localStorage.removeItem('token');
        }
    }
    setIsLoading(false);
    }, []);

  // --- ฟังก์ชัน Login ---
  const login = async (credentials: any) => {
    try {
      const data = await loginUser(credentials);
      const userData: User = {
        ...data.user,
        token: data.access_token 
      };

      setUser(userData);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      return userData; // Return user data for immediate use
    } catch (error) {
      console.error("Login Failed:", error);
      throw error;
    }
  }; // <--- ปิดฟังก์ชัน login ตรงนี้

  // --- ฟังก์ชัน Register (แยกออกมาให้ถูกต้อง) ---
  const register = async (userData: any) => {
    try {
      const data = await registerUser(userData);
      console.log("Register success:", data);
    } catch (error) {
      console.error("Register Error:", error);
      throw error;
    }
  };

  const setUserFromGoogle = (token: string, userData: any) => {
    const user: User = {
      ...userData,
      token: token,
    };
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
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