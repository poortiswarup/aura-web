import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

axios.defaults.withCredentials = true

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(undefined) // undefined = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = () => { window.location.href = '/auth/google' }

  const logout = async () => {
    await axios.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
