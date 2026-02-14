import { createContext, useContext, useState,type ReactNode } from 'react';

// 1. กำหนด Type ของ User (ตามที่คุณต้องการใช้ในโปรเจกต์)
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  token?: string;
}

// 2. กำหนด Type ของ Context State
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// สร้าง Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. สร้าง Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Function สำหรับ Login (ในอนาคตจะรับ token จาก Backend)
  const login = (userData: User) => {
    setUser(userData);
    // TODO: อาจจะมีการเก็บลง localStorage ตรงนี้
    localStorage.setItem('user_role', userData.role); 
  };

  // Function สำหรับ Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_role');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. สร้าง Custom Hook เพื่อเรียกใช้ Context ง่ายๆ
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};