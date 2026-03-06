import React, { useEffect, useState } from 'react'
import DashboardLayout from './../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { dashboardStyles as styles } from "../assets/dummystyle.js";
import { LucideFilePlus, LucideTrash2 } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance.js';
import { API_PATHS } from '../utils/apiPaths.js';
import moment from 'moment';
import toast from 'react-hot-toast';
import { ResumeSummaryCard } from '../components/Cards.jsx';
import CreateResumeForm from './../components/CreateResumeForm';
import Modal from '../components/Modal';

const Dashboard = () => {
    const navigate = useNavigate();
    const [openCreateModal, setOpenCreateModal] = useState(false)
    const [allResumes, setAllResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resumeToDelete, setResumeToDelete] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const calculateCompletion = (resume) => {
        let completedFields = 0;
        let totalFields = 0;

        // Profile Info
        totalFields += 3;
        if (resume.profileInfo?.fullName) completedFields++;
        if (resume.profileInfo?.designation) completedFields++;
        if (resume.profileInfo?.summary) completedFields++;

        // Contact Info
        totalFields += 2;
        if (resume.contactInfo?.email) completedFields++;
        if (resume.contactInfo?.phone) completedFields++;

        // Work Experience
        resume.workExperience?.forEach(exp => {
            totalFields += 5;
            if (exp.company) completedFields++;
            if (exp.role) completedFields++;
            if (exp.startDate) completedFields++;
            if (exp.endDate) completedFields++;
            if (exp.description) completedFields++;
        });

        // Education
        resume.education?.forEach(edu => {
            totalFields += 4;
            if (edu.degree) completedFields++;
            if (edu.institution) completedFields++;
            if (edu.startDate) completedFields++;
            if (edu.endDate) completedFields++;
        });

        // Skills
        resume.skills?.forEach(skill => {
            totalFields += 2;
            if (skill.name) completedFields++;
            if (skill.progress > 0) completedFields++;
        });

        // Projects
        resume.projects?.forEach(project => {
            totalFields += 4;
            if (project.title) completedFields++;
            if (project.description) completedFields++;
            if (project.github) completedFields++;
            if (project.liveDemo) completedFields++;
        });

        // Certifications
        resume.certifications?.forEach(cert => {
            totalFields += 3;
            if (cert.title) completedFields++;
            if (cert.issuer) completedFields++;
            if (cert.year) completedFields++;
        });

        // Languages
        resume.languages?.forEach(lang => {
            totalFields += 2;
            if (lang.name) completedFields++;
            if (lang.progress > 0) completedFields++;
        });

        // Interests
        totalFields += (resume.interests?.length || 0);
        completedFields += (resume.interests?.filter(i => i?.trim() !== "")?.length || 0);

        return Math.round((completedFields / totalFields) * 100);
    };

    const fetchAllResumes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_PATHS.RESUME.GET_ALL);
            const resumesWithCompletion = response.data.map(resume => ({
                ...resume,
                completion: calculateCompletion(resume)
            }));
            setAllResumes(resumesWithCompletion);
        } catch (error) {
            console.error('Error Fetching resume', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAllResumes();
    }, []);

    const handleDeleteResume = async () => {
        if (!resumeToDelete) return;
        try {
            await axiosInstance.delete(API_PATHS.RESUME.DELETE(resumeToDelete));
            toast.success('Resume deleted successfully');
            fetchAllResumes();
        } catch (error) {
            console.error('Error deleting resume:', error);
            toast.error('Failed to delete resume. Please try again.');
        } finally {
            setResumeToDelete(null);
            setShowDeleteConfirm(false);
        }
    }

    const handleDeleteClick = (id) => {
        setResumeToDelete(id);
        setShowDeleteConfirm(true);
    }

    return (
        <DashboardLayout>
            <div className={styles.container}>
                <div className={styles.headerWrapper}>
                    <div className={styles.container}>
                        <div className={styles.headerWrapper}>
                            <div>
                                <h1 className={styles.headerTitle}>Resumes</h1>
                                <p className={styles.headerSubtitle}>
                                    {allResumes.length > 0
                                        ? `You have ${allResumes.length} resume${allResumes.length === 1 ? '' : 's'}`
                                        : 'You have no resumes yet. Create one to get started!'}
                                </p>
                            </div>

                            <div className='flex gap-4'>
                                <button className={styles.createButton} onClick={() => setOpenCreateModal(true)}>
                                    <div className={styles.createButtonOverlay}></div>
                                    <span className={styles.createButtonContent}>
                                        Create New Resume
                                        <LucideFilePlus className='group-hover:translate-x-1 transition-transform' size={18} />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className={styles.spinnerWrapper}>
                        <div className={styles.spinner}></div>
                    </div>
                )}

                {!loading && allResumes.length === 0 && (
                    <div className={styles.emptyStateWrapper}>
                        <div className={styles.emptyIconWrapper}>
                            <LucideFilePlus size={32} className='text-violet-600' />
                        </div>
                        <h3 className={styles.emptyTitle}>No Resume Yet</h3>
                        <p className={styles.emptyText}>
                            Get started by creating your first resume. Click the button above to begin!
                        </p>

                        <button className={styles.createButton} onClick={() => setOpenCreateModal(true)} >
                            <div className={styles.createButtonOverlay}></div>
                            <span className={styles.createButtonContent}>
                                Create New Resume
                                <LucideFilePlus className='group-hover:translate-x-1 transition-transform' size={20} />
                            </span>
                        </button>
                    </div>
                )}

                {!loading && allResumes.length > 0 && (
                    <div className={styles.grid}>
                        <div className={styles.newResumeCard} onClick={() => setOpenCreateModal(true)}>
                            <div className={styles.newResumeIcon}>
                                <LucideFilePlus size={32} className='text-white' />
                            </div>
                            <h3 className={styles.newResumeTitle}>Create New Resume</h3>
                            <p className={styles.newResumeText}> start building your career</p>
                        </div>
                        {allResumes.map((resume) => (
                            <ResumeSummaryCard
                                key={resume._id}  // ✅ FIXED: changed from resume.id to resume._id
                                imgUrl={resume.thumbnailLink}
                                title={resume.title}
                                createdAt={resume.createdAt}
                                updatedAt={resume.updatedAt}
                                onSelect={() => navigate(`/resume/${resume._id}`)}
                                onDelete={() => handleDeleteClick(resume._id)}
                                completion={resume.completion || 0}
                                isPremium={resume.isPremium}
                                isNew={moment().diff(moment(resume.createdAt), 'days') < 7}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)} hideHeader maxWidth="max-w-2xl">
                <div className='p-6'>
                    <div className={styles.modalHeader}>
                        <h3 className={styles.modalTitle}>Create New Resume</h3>
                        <button onClick={() => setOpenCreateModal(false)} className={styles.modalCloseButton}>
                            X
                        </button>
                    </div>
                    <CreateResumeForm onSuccess={() => {
                        fetchAllResumes();
                        setOpenCreateModal(false);
                    }} />
                </div>
            </Modal>

            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Confirm Delete Resume"
                showActionBtn
                actionBtnText="Delete"
                actionBtnClassName="bg-red-600 hover:bg-red-700 text-white font-bold"
                onActionClick={handleDeleteResume}
            >
                <div className='p-8 flex flex-col items-center text-center'>
                    <div className={`${styles.deleteIconWrapper} mb-4 bg-orange-50 p-4 rounded-full`}>
                        <LucideTrash2 className='text-orange-600' size={32} />
                    </div>
                    <h3 className={`${styles.deleteTitle} text-xl font-bold text-gray-900 mb-2`}>
                        Are you sure you want to delete this resume?
                    </h3>
                    <p className={`${styles.deleteText} text-gray-500 max-w-xs`}>
                        This action cannot be undone. All data associated with this resume will be permanently removed.
                    </p>
                </div>
            </Modal>
        </DashboardLayout>
    )
}

export default Dashboard