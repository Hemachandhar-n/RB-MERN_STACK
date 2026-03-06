import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { validateEmail } from '../utils/helper';
import { authStyles as styles } from '../assets/dummystyle.js';
import { Inputs } from './Inputs';

const SignUp = ({ setCurrentPage }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) return setError('Please enter your full name');
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    if (password.length < 8) return setError('Password must be at least 8 characters');

    setError(null);
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, { 
        name: fullName, 
        email, 
        password 
      });

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        if (user) updateUser(user);
        navigate('/dashboard');
      } else {
        // Fallback if your API requires login after signup
        setCurrentPage('login');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <h3 className={styles.title}>Create Account</h3>
        <p className={styles.subtitle}>Join thousands of professionals today</p>
      </div>

      <form onSubmit={handleSignUp} className={styles.form}>
        <Inputs
          label="Full Name"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Inputs
          label="Email Address"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        <Inputs
          label="Password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />

        {error && <div className={styles.errorMessage}>{error}</div>}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <button
            type="button"
            className={styles.switchButton}
            onClick={() => setCurrentPage('login')}
          >
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignUp;