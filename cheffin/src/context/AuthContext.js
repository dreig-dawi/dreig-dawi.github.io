import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { endpoint } from '../Utils/Constants';

// Create the context
export const AuthContext = createContext(null);

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists and is valid on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Verify token expiration
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp > currentTime) {
          // Token is valid, fetch user profile
          fetchUserProfile(token);
        } else {
          // Token is expired, remove it
          localStorage.removeItem('authToken');
          setLoading(false);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('authToken');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user profile with token
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${endpoint}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('authToken');
      setLoading(false);
    }
  };

  // Register a new user
  const register = async (userData, isChef = false) => {
    setError(null);
    try {
      const endpointed = isChef ? `${endpoint}/users/register/chef` : `${endpoint}/users/register`;
      const response = await axios.post(endpointed, userData);
      
      // If registration returns a token, store it and set user
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        setCurrentUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Login a user
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await axios.post(`${endpoint}/users/login`, credentials);
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        setCurrentUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout the user
  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const token = localStorage.getItem('authToken');    // Handle profile picture if it's a data URL
    const updatedProfileData = { ...profileData };
    if (profileData.profilePicture?.startsWith('data:')) {
      // Extract base64 data by removing the prefix
      updatedProfileData.profilePicture = profileData.profilePicture.split(',')[1];
    }

    const response = await axios.put(`${endpoint}/users/profile`, updatedProfileData, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!currentUser;

  // Check if user is a chef
  const isChef = () => currentUser?.role === 'CHEF';

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated,
    isChef
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};