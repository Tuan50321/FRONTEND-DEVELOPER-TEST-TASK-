'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

type StoredUser = User & {
  password: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, fullName: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const USERS_KEY = 'users'
const SESSION_KEY = 'user'

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  const users = safeParse<StoredUser[]>(localStorage.getItem(USERS_KEY), [])
  return Array.isArray(users) ? users : []
}

function setStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem(SESSION_KEY)
    setUser(storedUser ? JSON.parse(storedUser) : null)
  }, [])

  const login = async (email: string, password: string) => {
    const emailKey = normalizeEmail(email)
    const users = getStoredUsers()
    const found = users.find((u) => normalizeEmail(u.email) === emailKey && u.password === password)
    if (!found) return false

    const { password: _pw, ...sessionUser } = found
    setUser(sessionUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    return true
  }

  const signup = async (email: string, password: string, fullName: string) => {
    const emailKey = normalizeEmail(email)
    const users = getStoredUsers()
    const exists = users.some((u) => normalizeEmail(u.email) === emailKey)
    if (exists) return false

    const username = emailKey.split('@')[0] // Generate username from email
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const userData: StoredUser = {
      id: Date.now(), // Simple ID generation for demo
      username,
      email: emailKey,
      firstName,
      lastName,
      gender: 'other', // Default gender
      image: `https://dummyjson.com/icon/${username}/128`,
      password,
    }

    const nextUsers = [...users, userData]
    setStoredUsers(nextUsers)

    const { password: _pw, ...sessionUser } = userData
    setUser(sessionUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
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
