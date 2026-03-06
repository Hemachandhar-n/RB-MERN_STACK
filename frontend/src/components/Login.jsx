import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { validateEmail } from '../utils/helper';
import { authStyles as styles } from "../assets/dummystyle.js";
import { Inputs } from './Inputs'; // Make sure this path is correct

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
      const { token, user } = response.data; // Assuming backend sends user object too, otherwise fetch profile

      if (!token) throw new Error('Token missing');

      localStorage.setItem('token', token);

      // Ensure user context is available before dashboard navigation.
      let userData = user;
      if (!userData) {
        const profileResponse = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        userData = profileResponse.data;
      }
      if (userData) {
        updateUser(userData);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <h3 className={styles.title}>Welcome Back</h3>
        <p className={styles.subtitle}>Sign in to continue building amazing resumes</p>
      </div>

      <form onSubmit={handleLogin} className={styles.form}>
        <Inputs
          label="Email Address"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        <Inputs
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />

        {error && <div className={styles.errorMessage}>{error}</div>}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <button
            type="button"
            className={styles.switchButton}
            onClick={() => setCurrentPage('signup')}
          >
            Create Account
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
