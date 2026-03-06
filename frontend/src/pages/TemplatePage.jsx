import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ThemeSelector from '../components/ThemeSelector'
import { DUMMY_RESUME_DATA, resumeTemplates } from '../utils/data'

const TemplatePage = () => {
  const navigate = useNavigate()
  const [selectedTheme, setSelectedTheme] = useState(resumeTemplates[0]?.id || "01")

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto mb-4'>
        <button
          type='button'
          onClick={() => navigate('/')}
          className='inline-flex items-center gap-2 px-4 py-2 bg-white border border-violet-100 rounded-xl text-slate-700 hover:bg-violet-50 transition-all'
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <ThemeSelector
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
        resumeData={DUMMY_RESUME_DATA}
      />
    </div>
  )
}

export default TemplatePage
