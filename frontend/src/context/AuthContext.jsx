import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('library-token')))

  useEffect(() => {
    const token = localStorage.getItem('library-token')
    if (!token) return
    authApi.me().then(setUser).catch(() => {
      localStorage.removeItem('library-token')
      setUser(null)
    }).finally(() => setLoading(false))
    const clearSession = () => setUser(null)
    window.addEventListener('library:unauthorized', clearSession)
    return () => window.removeEventListener('library:unauthorized', clearSession)
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const result = await authApi.login(credentials)
      localStorage.setItem('library-token', result.token)
      setUser(result.user)
      return result.user
    },
    async register(details) {
      const result = await authApi.register(details)
      localStorage.setItem('library-token', result.token)
      setUser(result.user)
      return result.user
    },
    logout() {
      localStorage.removeItem('library-token')
      setUser(null)
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
