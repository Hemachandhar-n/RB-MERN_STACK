import React, { useEffect, useRef, useState } from 'react'
import { DUMMY_RESUME_DATA, resumeTemplates } from './../utils/data';
import Tabs from './Tabs';
import { Check } from 'lucide-react';
import { TemplateCard } from './Cards';
import RenderResume from './RenderResume';

const TAB_DATA = [{ label: 'Templates'}]

const ThemeSelector = ({ selectedTheme, selectTheme, setSelectedTheme, resumeData, onClose }) => {

    const activeTheme = selectedTheme || selectTheme || resumeTemplates[0]?.id || "";

    const resumeRef = useRef(null);
    const [baseWidth, setBaseWidth] = useState(800);

    // selected theme template using ID
    const initialIndex = resumeTemplates.findIndex(t => t.id === activeTheme);

    const [selectedTemplate, setSelectedTemplate] = useState({
        theme: activeTheme,
        index: initialIndex >= 0 ? initialIndex : 0
    })

    const [tabValue, setTabValue] = useState('Templates');

    const handleThemeSelection = () => {
        setSelectedTheme(selectedTemplate.theme);
        onClose?.();
    }

    useEffect(() => {
        const idx = resumeTemplates.findIndex((t) => t.id === activeTheme);
        setSelectedTemplate({
            theme: activeTheme,
            index: idx >= 0 ? idx : 0,
        });
    }, [activeTheme]);
    
    const updateBaseWidth =() => {
        if(resumeRef.current) {
            setBaseWidth(resumeRef.current.offsetWidth)
        }
    }
    
    useEffect(() => {
        updateBaseWidth();
        window.addEventListener('resize', updateBaseWidth);
        return () => {window.removeEventListener('resize', updateBaseWidth)}
    }, []);

    return (
        <div className='max-w-7xl mx-auto px-4'>
            {/* header */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-4 sm:p-6
            bg-gradient-to-r from-white to-violet-50 rounded-2xl border border-violet-100'>

                <Tabs 
                    tabs={TAB_DATA} 
                    activeTab={tabValue} 
                    setActiveTab={setTabValue} 
                />

                <button 
                    className='w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 text-white font-extrabold rounded-2xl border border-white/20 ring-1 ring-blue-300/40 hover:brightness-105 hover:scale-[1.02] transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40' 
                    onClick={handleThemeSelection}>
                        <span className='grid place-items-center w-6 h-6 rounded-full bg-white/20 leading-none'>
                            <Check size={16} className='block' />
                        </span>
                        Apply changes
                </button>
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8'>
                <div className='lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6'>
                    <div className=' grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] lg:max-h-[70vh] overflow-auto p-2'>
                        {resumeTemplates.map((template, index) => (
                            <TemplateCard key={`templates_${index}`}
                                thumbnailImg={template.thumbnailImg}
                                isSelected={selectedTemplate.index === index}
                                onSelect={() => setSelectedTemplate({ theme: template.id, index })}
                            />
                        ))}
                    </div>
                </div>

                {/* right Area */}
                <div className='lg:col-span-8 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6'>
                    <div className='w-full overflow-x-auto' ref={resumeRef}>
                        <div className='mx-auto w-full max-w-[900px]'>
                        <RenderResume templateId={selectedTemplate?.theme || ""}
                            resumeData={resumeData || DUMMY_RESUME_DATA}
                            containerWidth={baseWidth}
                        />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ThemeSelector
