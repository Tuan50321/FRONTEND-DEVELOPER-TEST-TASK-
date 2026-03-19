'use client'

import { createContext, useContext, useState } from 'react'

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, fullName: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    }
    return null
  })

  const login = async (email: string, password: string) => {
    // Hardcode for demo - in production, use real API
    if (email === 'emily.johnson@x.dummyjson.com' && password === 'emilyspass') {
      const userData = {
        id: 1,
        username: 'emilys',
        email: 'emily.johnson@x.dummyjson.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        gender: 'female',
        image: 'https://dummyjson.com/icon/emilys/128'
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const signup = async (email: string, password: string, fullName: string) => {
    // For demo purposes, create a new user account
    // In production, this would call a real API
    const username = email.split('@')[0] // Generate username from email
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const userData = {
      id: Date.now(), // Simple ID generation for demo
      username,
      email,
      firstName,
      lastName,
      gender: 'other', // Default gender
      image: `https://dummyjson.com/icon/${username}/128`
    }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
