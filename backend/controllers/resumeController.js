import Resume from '../models/resumeModel.js'
import fs from 'fs'
import path from 'path'

const normalizeResumeResponse = (resumeDoc) => {
  const resume = typeof resumeDoc?.toObject === 'function' ? resumeDoc.toObject() : resumeDoc
  if (!resume) return resume

  return {
    ...resume,
    profileInfo: {
      ...resume.profileInfo,
      fullName: resume.profileInfo?.fullName || resume.profileInfo?.fullname || '',
      profilePreviewUrl: resume.profileInfo?.profilePreviewUrl || resume.profileInfo?.previewUrl || '',
    },
    contactInfo: {
      ...resume.contactInfo,
      linkedin: resume.contactInfo?.linkedin || resume.contactInfo?.linkedIn || '',
    },
  }
}

// CREATE RESUME
export const createResume = async (req, res) => {
  try {
    const { title } = req.body

    const defaultResumeData = {
      profileInfo: {
        profilePreviewUrl: '',
        fullName: '',
        designation: '',
        summary: '',
      },
      contactInfo: {
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
      },
      workExperience: [
        {
          company: '',
          role: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
      education: [
        {
          degree: '',
          institution: '',
          startDate: '',
          endDate: '',
        },
      ],
      skills: [
        {
          name: '',
          progress: 0,
        },
      ],
      projects: [
        {
          title: '',
          description: '',
          github: '',
          liveDemo: '',
        },
      ],
      certifications: [
        {
          title: '',
          issuer: '',
          year: '',
        },
      ],
      languages: [
        {
          name: '',
          progress: 0,
        },
      ],
      interests: [''],
    }

    const newResume = await Resume.create({
      userId: req.user._id,
      title,
      ...defaultResumeData,
      ...req.body,
    })

    res.status(201).json(normalizeResumeResponse(newResume))
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create resume',
      error: error.message,
    })
  }
}

// GET USER RESUMES
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      userId: req.user._id, // ❌ UserId → ✅ userId
    }).sort({ updatedAt: -1 })

    res.json(resumes.map(normalizeResumeResponse))
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get resumes',
      error: error.message,
    })
  }
}

// GET RESUME BY ID
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id, // ❌ useID → ✅ userId
    })

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    res.json(normalizeResumeResponse(resume))
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get resume',
      error: error.message,
    })
  }
}

// UPDATE RESUME
export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!resume) {
      return res
        .status(404)
        .json({ message: 'Resume not found or not authorized' })
    }

    Object.assign(resume, req.body)
    if (resume.profileInfo?.fullName && !resume.profileInfo?.fullname) {
      resume.profileInfo.fullname = resume.profileInfo.fullName
    }
    if (resume.contactInfo?.linkedin && !resume.contactInfo?.linkedIn) {
      resume.contactInfo.linkedIn = resume.contactInfo.linkedin
    }

    const savedResume = await resume.save()
    res.json(normalizeResumeResponse(savedResume))
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update resume',
      error: error.message,
    })
  }
}

// DELETE RESUME
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!resume) {
      return res
        .status(404)
        .json({ message: 'Resume not found or not authorized' })
    }

    const uploadFolder = path.join(process.cwd(), 'upload')

    // delete thumbnail
    if (resume.thumbnailLink) {
      const oldThumbnail = path.join(
        uploadFolder,
        path.basename(resume.thumbnailLink)
      )
      if (fs.existsSync(oldThumbnail)) {
        fs.unlinkSync(oldThumbnail)
      }
    }

    // delete profile image
    if (resume.profileInfo?.previewUrl) {
      const oldProfile = path.join(
        uploadFolder,
        path.basename(resume.profileInfo.previewUrl)
      )
      if (fs.existsSync(oldProfile)) {
        fs.unlinkSync(oldProfile)
      }
    }

    await Resume.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    res.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete resume',
      error: error.message,
    })
  }
}
