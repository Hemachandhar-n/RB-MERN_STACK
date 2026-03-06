import React from 'react'
import { Link } from "react-router-dom";
import { LayoutTemplate } from 'lucide-react';
import { ProfileInfoCard } from './Cards';

const Navbar = () => {
  return (
    <div className='h-16 bg-amber-50/70 backdrop-blur-xl border-b border-violet-100/50 px-4 md:px-6 sticky top-0 z-50'>
      <div className='max-w-6xl mx-auto h-full flex items-center justify-between gap-4'>
        <Link to='/' className='flex items-center gap-3 min-w-0'>
          <div className='w-10 h-10 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 shrink-0'>
            <LayoutTemplate className='w-5 h-5 text-white' />
          </div>
          <span className='text-lg sm:text-xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent truncate'>
            ResumeMachines
          </span>
        </Link>
        <ProfileInfoCard />
      </div>
    </div>
  )
}

export default Navbar
