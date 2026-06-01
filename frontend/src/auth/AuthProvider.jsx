import { useState } from 'react'
import { api } from '../lib/api'
import { AuthContext } from './auth-context'

const SESSION_KEY = 'nexa-session'

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  const saveSession = (nextSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }

  const login = async (credentials) => {
    const nextSession = await api.login(credentials)
    saveSession(nextSession)
    return nextSession
  }

  const register = async (details) => {
    const nextSession = await api.register(details)
    saveSession(nextSession)
    return nextSession
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  const updateSession = (updates) => {
    saveSession({ ...session, ...updates })
  }

  const value = { session, token: session?.token, login, register, logout, updateSession }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
