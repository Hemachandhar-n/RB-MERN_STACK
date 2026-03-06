import React, { createContext, useEffect, useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { API_PATHS } from '../utils/apiPaths'

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext(null)

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearUser = () => {
    setUser(null)
    localStorage.removeItem('token')
    setLoading(false)
  }

  const updateUser = (userData) => {
    setUser(userData)
    setLoading(false)
  }

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem('token')

      if (!accessToken) {
        setLoading(false)
        return
      }

      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE)
        setUser(response.data)
      } catch (error) {
        if (error?.response?.status === 401) {
          console.error('User Not Authenticated', error)
          clearUser()
        } else {
          console.error('Unable to reach auth server', error)
          setLoading(false)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
