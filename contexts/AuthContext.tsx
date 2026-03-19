'use client'

// Import các hook và component cần thiết từ React
import { createContext, useContext, useEffect, useState } from 'react'

// Định nghĩa interface cho User (người dùng)
interface User {
  id: number // ID duy nhất của người dùng
  username: string // Tên đăng nhập
  email: string // Email của người dùng
  firstName: string // Tên
  lastName: string // Họ
  gender: string // Giới tính
  image: string // URL ảnh đại diện
}

// Định nghĩa type cho StoredUser, bao gồm User và thêm password
type StoredUser = User & {
  password: string // Mật khẩu (chỉ lưu trong localStorage)
}

// Định nghĩa interface cho AuthContextType, chứa các hàm và state của auth
interface AuthContextType {
  user: User | null // Người dùng hiện tại hoặc null nếu chưa đăng nhập
  login: (email: string, password: string) => Promise<boolean> // Hàm đăng nhập
  signup: (email: string, password: string, fullName: string) => Promise<boolean> // Hàm đăng ký
  logout: () => void // Hàm đăng xuất
}

// Tạo AuthContext với giá trị mặc định là null
const AuthContext = createContext<AuthContextType | null>(null)

// Các key dùng để lưu trữ trong localStorage
const USERS_KEY = 'users' // Key cho danh sách người dùng
const SESSION_KEY = 'user' // Key cho phiên đăng nhập hiện tại

// Hàm an toàn để parse JSON, trả về fallback nếu lỗi
function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// Hàm chuẩn hóa email: loại bỏ khoảng trắng và chuyển về chữ thường
function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

// Hàm lấy danh sách người dùng đã lưu từ localStorage
function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [] // Kiểm tra môi trường client
  const users = safeParse<StoredUser[]>(localStorage.getItem(USERS_KEY), [])
  return Array.isArray(users) ? users : []
}

// Hàm lưu danh sách người dùng vào localStorage
function setStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Component AuthProvider cung cấp context cho authentication
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State để lưu thông tin người dùng hiện tại
  const [user, setUser] = useState<User | null>(null)

  // useEffect để khôi phục phiên đăng nhập từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem(SESSION_KEY)
    setUser(storedUser ? JSON.parse(storedUser) : null)
  }, [])

  // Hàm đăng nhập
  const login = async (email: string, password: string) => {
    const emailKey = normalizeEmail(email) // Chuẩn hóa email
    const users = getStoredUsers() // Lấy danh sách người dùng
    // Tìm người dùng có email và mật khẩu khớp
    const found = users.find((u) => normalizeEmail(u.email) === emailKey && u.password === password)
    if (!found) return false // Nếu không tìm thấy, trả về false

    // Loại bỏ password khỏi object để lưu vào session
    const { password: _pw, ...sessionUser } = found
    setUser(sessionUser) // Cập nhật state
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser)) // Lưu vào localStorage
    return true
  }

  // Hàm đăng ký
  const signup = async (email: string, password: string, fullName: string) => {
    const emailKey = normalizeEmail(email) // Chuẩn hóa email
    const users = getStoredUsers() // Lấy danh sách người dùng hiện tại
    // Kiểm tra xem email đã tồn tại chưa
    const exists = users.some((u) => normalizeEmail(u.email) === emailKey)
    if (exists) return false // Nếu đã tồn tại, trả về false

    // Tạo username từ phần trước @ của email
    const username = emailKey.split('@')[0]
    // Tách tên đầy đủ thành firstName và lastName
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Tạo object userData mới
    const userData: StoredUser = {
      id: Date.now(), // Sử dụng timestamp làm ID đơn giản
      username,
      email: emailKey,
      firstName,
      lastName,
      gender: 'other', // Giới tính mặc định
      image: `https://dummyjson.com/icon/${username}/128`, // URL ảnh đại diện giả
      password,
    }

    // Thêm user mới vào danh sách và lưu
    const nextUsers = [...users, userData]
    setStoredUsers(nextUsers)

    // Loại bỏ password và lưu vào session
    const { password: _pw, ...sessionUser } = userData
    setUser(sessionUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    return true
  }

  // Hàm đăng xuất
  const logout = () => {
    setUser(null) // Xóa state
    localStorage.removeItem(SESSION_KEY) // Xóa khỏi localStorage
  }

  // Trả về Provider với value chứa các hàm và state
  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook useAuth để sử dụng AuthContext trong các component
export const useAuth = () => {
  const context = useContext(AuthContext) // Lấy context
  if (!context) throw new Error('useAuth must be used within AuthProvider') // Ném lỗi nếu không có Provider
  return context // Trả về context
}
