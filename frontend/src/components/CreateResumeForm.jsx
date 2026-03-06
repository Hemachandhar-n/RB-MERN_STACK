import React, { useState } from 'react';
import { Inputs } from "./Inputs"; 
import { useNavigate } from 'react-router-dom';
import axiosInstance from './../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const CreateResumeForm = () => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreateResume = async (e) => {
    e.preventDefault();

    if (!title) {
      setError('Title is required');
      return;
    }
    setError("");

    try {
      // FIX: Changed API_PATHS.RESUME_CREATE to API_PATHS.RESUME.CREATE
      const response = await axiosInstance.post(API_PATHS.RESUME.CREATE, { title });
      
      if (response.data?._id) {
        navigate(`/resume/${response.data._id}`);
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred while creating the resume. Please try again.');
      }
    }
  };

  return (
    <div className='w-full max-w-md p-8 bg-white rounded-2xl border border-gray-100 shadow-lg'>
      <h3 className='text-2xl font-bold text-gray-900 mb-2'> Create New Resume </h3>
      <p className='text-gray-600 mb-6'>
        Create a new resume by providing a title. You can customize it later.
      </p>

      <form onSubmit={handleCreateResume} className="space-y-4">
        <Inputs
          label='Resume Title'
          type="text"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
          placeholder='e.g., John Doe - Developer'
        />

        {error && (
          <p className='text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg border border-red-100'>
            {error}
          </p>
        )}

        <button
          type='submit'
          className='w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 hover:shadow-xl hover:shadow-rose-200 transition-all'
        >
          Create Resume
        </button>
      </form>
    </div>
  );
};

export default CreateResumeForm;