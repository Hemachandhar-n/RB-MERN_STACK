import React, { useCallback, useEffect, useRef, useState } from 'react'
import DashboardLayout from './DashboardLayout';
import { buttonStyles, containerStyles, iconStyles, statusStyles } from '../assets/dummystyle.js';
import { TitleInput } from './Inputs';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Download, Loader2, Palette, Save, Trash2 } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance.js';
import toast from 'react-hot-toast';
import { API_PATHS } from '../utils/apiPaths.js';
import { fixTailwindColors } from './../utils/color';

import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas';


import {
  ProfileInfoForm,
  ContactInfoForm,
  WorkExperienceForm,
  EducationDetailsForm,
  SkillsInfoForm,
  ProjectDetailForm,
  CertificationInfoForm,
  AdditionalInfoForm
} from './Forms';
import StepProgress from './StepProgress.jsx';
import { AlertCircle } from 'react-feather';
import RenderResume from './RenderResume.jsx';
import ThemeSelector from './ThemeSelector.jsx';
import Modal from './Modal.jsx';

//Resize observer hook
const useResizeObserver = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useCallback((node) => {
    if (node) {
      const resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      });
      resizeObserver.observe(node);
    }
  }, []);
  return { ...size, ref };
}

const EditResume = () => {
  const { resumeId } = useParams()
  const navigate = useNavigate()
  const resumeDownloadRef = useRef(null)
  const thumbnailRef = useRef(null)

  const [_openThemeSelector, setOpenThemeSelector] = useState(false)
  const [_openPreviewModal, setOpenPreviewModal] = useState(false)
  const [currentPage, setCurrentPage] = useState("profile-info")
  const [_progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [_isDownloading, setIsDownloading] = useState(false)
  const [_downloadSuccess, setDownloadSuccess] = useState(false)
  const [_errorMsg, setErrorMsg] = useState("")
  const [completionPercentage, setCompletionPercentage] = useState(0)

  const { width: _previewWidth, ref: _previewContainerRef } = useResizeObserver();

  const [resumeData, setResumeData] = useState({
    title: "Professional Resume",
    thumbnailLink: "",
    profileInfo: {
      fullName: "",
      designation: "",
      summary: "",
    },
    template: {
      theme: "modern",
      colorPalette: []
    },
    contactInfo: {
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
    },
    workExperience: [
      {
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ],
    education: [
      {
        degree: "",
        institution: "",
        startDate: "",
        endDate: "",
      },
    ],
    skills: [
      {
        name: "",
        progress: 0,
      },
    ],
    projects: [
      {
        title: "",
        description: "",
        github: "",
        liveDemo: "",
      },
    ],
    certifications: [
      {
        title: "",
        issuer: "",
        year: "",
      },
    ],
    languages: [
      {
        name: "",
        progress: 0,
      },
    ],
    interests: [""],
  })

  // Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    let completedFields = 0;
    let totalFields = 0;

    // Profile Info
    totalFields += 3;
    if (resumeData.profileInfo.fullName) completedFields++;
    if (resumeData.profileInfo.designation) completedFields++;
    if (resumeData.profileInfo.summary) completedFields++;

    // Contact Info
    totalFields += 2;
    if (resumeData.contactInfo.email) completedFields++;
    if (resumeData.contactInfo.phone) completedFields++;

    // Work Experience
    resumeData.workExperience.forEach(exp => {
      totalFields += 5;
      if (exp.company) completedFields++;
      if (exp.role) completedFields++;
      if (exp.startDate) completedFields++;
      if (exp.endDate) completedFields++;
      if (exp.description) completedFields++;
    });

    // Education
    resumeData.education.forEach(edu => {
      totalFields += 4;
      if (edu.degree) completedFields++;
      if (edu.institution) completedFields++;
      if (edu.startDate) completedFields++;
      if (edu.endDate) completedFields++;
    });

    // Skills
    resumeData.skills.forEach(skill => {
      totalFields += 2;
      if (skill.name) completedFields++;
      if (skill.progress > 0) completedFields++;
    });

    // Projects
    resumeData.projects.forEach(project => {
      totalFields += 4;
      if (project.title) completedFields++;
      if (project.description) completedFields++;
      if (project.github) completedFields++;
      if (project.liveDemo) completedFields++;
    });

    // Certifications
    resumeData.certifications.forEach(cert => {
      totalFields += 3;
      if (cert.title) completedFields++;
      if (cert.issuer) completedFields++;
      if (cert.year) completedFields++;
    });

    // Languages
    resumeData.languages.forEach(lang => {
      totalFields += 2;
      if (lang.name) completedFields++;
      if (lang.progress > 0) completedFields++;
    });

    // Interests
    totalFields += resumeData.interests.length;
    completedFields += resumeData.interests.filter(i => i.trim() !== "").length;

    const percentage = Math.round((completedFields / totalFields) * 100);
    setCompletionPercentage(percentage);
    return percentage;
  }, [resumeData]);

  useEffect(() => {
    calculateCompletion();
  }, [calculateCompletion]);

  // Validate Inputs
  const validateAndNext = () => {
    const errors = []

    switch (currentPage) {
      case "profile-info": {
        const { fullName, designation, summary } = resumeData.profileInfo
        if (!fullName.trim()) errors.push("Full Name is required")
        if (!designation.trim()) errors.push("Designation is required")
        if (!summary.trim()) errors.push("Summary is required")
        break
      }

      case "contact-info": {
        const { email, phone } = resumeData.contactInfo
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required.")
        if (!phone.trim() || !/^\d{10}$/.test(phone)) errors.push("Valid 10-digit phone number is required")
        break
      }

      case "work-experience":
        resumeData.workExperience.forEach(({ company, role, startDate, endDate }, index) => {
          if (!company || !company.trim()) errors.push(`Company is required in experience ${index + 1}`)
          if (!role || !role.trim()) errors.push(`Role is required in experience ${index + 1}`)
          if (!startDate || !endDate) errors.push(`Start and End dates are required in experience ${index + 1}`)
        })
        break

      case "education-info":
        resumeData.education.forEach(({ degree, institution, startDate, endDate }, index) => {
          if (!degree.trim()) errors.push(`Degree is required in education ${index + 1}`)
          if (!institution.trim()) errors.push(`Institution is required in education ${index + 1}`)
          if (!startDate || !endDate) errors.push(`Start and End dates are required in education ${index + 1}`)
        })
        break

      case "skills":
        resumeData.skills.forEach(({ name, progress }, index) => {
          if (!name.trim()) errors.push(`Skill name is required in skill ${index + 1}`)
          if (progress < 1 || progress > 100)
            errors.push(`Skill progress must be between 1 and 100 in skill ${index + 1}`)
        })
        break

      case "projects":
        resumeData.projects.forEach(({ title, description }, index) => {
          if (!title.trim()) errors.push(`Project Title is required in project ${index + 1}`)
          if (!description.trim()) errors.push(`Project description is required in project ${index + 1}`)
        })
        break

      case "certifications":
        resumeData.certifications.forEach(({ title, issuer }, index) => {
          if (!title.trim()) errors.push(`Certification Title is required in certification ${index + 1}`)
          if (!issuer.trim()) errors.push(`Issuer is required in certification ${index + 1}`)
        })
        break

      case "additionalInfo":
        if (resumeData.languages.length === 0 || !resumeData.languages[0].name?.trim()) {
          errors.push("At least one language is required")
        }
        if (resumeData.interests.length === 0 || !resumeData.interests[0]?.trim()) {
          errors.push("At least one interest is required")
        }
        break

      default:
        break
    }

    if (errors.length > 0) {
      setErrorMsg(errors.join(", "))
      return
    }

    setErrorMsg("")
    goToNextStep()
  }

  const goToNextStep = () => {
    const pages = [
      "profile-info",
      "contact-info",
      "work-experience",
      "education-info",
      "skills",
      "projects",
      "certifications",
      "additionalInfo",
    ]

    if (currentPage === "additionalInfo") setOpenPreviewModal(true)

    const currentIndex = pages.indexOf(currentPage)
    if (currentIndex !== -1 && currentIndex < pages.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentPage(pages[nextIndex])

      const percent = Math.round((nextIndex / (pages.length - 1)) * 100)
      setProgress(percent)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }
  // Take  Back to previous form state or take to first or to  Dash board
  const _goBack = () => {
    const pages = [
      "profile-info",
      "contact-info",
      "work-experience",
      "education-info",
      "skills",
      "projects",
      "certifications",
      "additionalInfo",
    ]

    if (currentPage === "profile-info") navigate("/dashboard")

    const currentIndex = pages.indexOf(currentPage)
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentPage(pages[prevIndex])

      const percent = Math.round((prevIndex / (pages.length - 1)) * 100)
      setProgress(percent)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const _renderForm = () => {
    switch (currentPage) {
      case "profile-info":
        return (
          <ProfileInfoForm
            profileData={resumeData?.profileInfo}
            updateSection={(key, value) => updateSection("profileInfo", key, value)}
            onNext={validateAndNext}
          />
        )

      case "contact-info":
        return (
          <ContactInfoForm
            contactInfo={resumeData?.contactInfo}
            updateSection={(key, value) => updateSection("contactInfo", key, value)}
          />
        )

      case "work-experience":
        return (
          <WorkExperienceForm
            workExperience={resumeData?.workExperience}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("workExperience", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("workExperience", newItem)}
            removeArrayItem={(index) => removeArrayItem("workExperience", index)}
          />
        )

      case "education-info":
        return (
          <EducationDetailsForm
            educationInfo={resumeData?.education}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("education", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("education", newItem)}
            removeArrayItem={(index) => removeArrayItem("education", index)}
          />
        )

      case "skills":
        return (
          <SkillsInfoForm
            skillsInfo={resumeData?.skills}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("skills", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("skills", newItem)}
            removeArrayItem={(index) => removeArrayItem("skills", index)}
          />
        )

      case "projects":
        return (
          <ProjectDetailForm
            projectInfo={resumeData?.projects}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("projects", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("projects", newItem)}
            removeArrayItem={(index) => removeArrayItem("projects", index)}
          />
        )

      case "certifications":
        return (
          <CertificationInfoForm
            certifications={resumeData?.certifications}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("certifications", index, key, value)
            }}
            addArrayItem={(newItem) => addArrayItem("certifications", newItem)}
            removeArrayItem={(index) => removeArrayItem("certifications", index)}
          />
        )

      case "additionalInfo":
        return (
          <AdditionalInfoForm
            languages={resumeData.languages}
            interests={resumeData.interests}
            updateArrayItem={(section, index, key, value) => updateArrayItem(section, index, key, value)}
            addArrayItem={(section, newItem) => addArrayItem(section, newItem)}
            removeArrayItem={(section, index) => removeArrayItem(section, index)}
          />
        )

      default:
        return null
    }
  }
  //update the section state

  const updateSection = (section, key, value) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }
  //update array item as a array

  const updateArrayItem = (section, index, key, value) => {
    setResumeData((prev) => {
      const updatedArray = [...prev[section]]

      if (key === null) {
        updatedArray[index] = value
      } else {
        updatedArray[index] = {
          ...updatedArray[index],
          [key]: value,
        }
      }

      return {
        ...prev,
        [section]: updatedArray,
      }
    })
  }

  //add the array item
  const addArrayItem = (section, newItem) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }))
  }

  // remove the info delete index
  const removeArrayItem = (section, index) => {
    setResumeData((prev) => {
      const updatedArray = [...prev[section]]
      updatedArray.splice(index, 1)
      return {
        ...prev,
        [section]: updatedArray,
      }
    })
  }

  // fetch the data to backend url
  const fetchResumeDetailsById = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.RESUME.GET_BY_ID(resumeId))

      if (response.data && response.data.profileInfo) {
        const resumeInfo = response.data
        const normalizeDate = (value) => {
          if (!value) return ""
          return /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value
        }
        const normalizedWorkExperience = (resumeInfo?.workExperience || []).map((item) => ({
          ...item,
          startDate: normalizeDate(item?.startDate),
          endDate: normalizeDate(item?.endDate),
        }))
        const normalizedEducation = (resumeInfo?.education || []).map((item) => ({
          ...item,
          startDate: normalizeDate(item?.startDate),
          endDate: normalizeDate(item?.endDate),
        }))

        setResumeData((prevState) => ({
          ...prevState,
          title: resumeInfo?.title || "Untitled",
          template: resumeInfo?.template || prevState?.template,
          profileInfo: resumeInfo?.profileInfo || prevState?.profileInfo,
          contactInfo: resumeInfo?.contactInfo || prevState?.contactInfo,
          workExperience: normalizedWorkExperience.length ? normalizedWorkExperience : prevState?.workExperience,
          education: normalizedEducation.length ? normalizedEducation : prevState?.education,
          skills: resumeInfo?.skills || prevState?.skills,
          projects: resumeInfo?.projects || prevState?.projects,
          certifications: resumeInfo?.certifications || prevState?.certifications,
          languages: resumeInfo?.languages || prevState?.languages,
          interests: resumeInfo?.interests || prevState?.interests,
        }))
      }
    }
    catch (error) {
      console.error("Error fetching resume:", error)
      toast.error("Failed to load resume data")
    }
  }, [resumeId])

  //it will be help in choosing the preview as well as help in downloading th Resume and also saves the resume as an image
  const _uploadResumeImages = async () => {
    let thumbnailLink = resumeData?.thumbnailLink || ""
    try {
      setIsLoading(true)

      const thumbnailElement = thumbnailRef.current
      if (thumbnailElement) {
        try {
          const fixedThumbnail = fixTailwindColors(thumbnailElement)
          const fallbackWidth = thumbnailElement.scrollWidth || 800
          const fallbackHeight = thumbnailElement.scrollHeight || 1100

          const thumbnailCanvas = await html2canvas(fixedThumbnail, {
            scale: 0.5,
            backgroundColor: "#FFFFFF",
            logging: false,
            windowWidth: fallbackWidth,
            windowHeight: fallbackHeight,
          })

          document.body.removeChild(fixedThumbnail)

          let thumbnailBlob = await new Promise((resolve) => {
            thumbnailCanvas.toBlob((blob) => {
              resolve(blob || null)
            }, "image/png")
          })

          if (!thumbnailBlob) {
            const dataUrl = thumbnailCanvas.toDataURL("image/png")
            const response = await fetch(dataUrl)
            thumbnailBlob = await response.blob()
          }

          if (!thumbnailBlob || !thumbnailBlob.size) {
            throw new Error("Failed to create thumbnail blob")
          }

          const formData = new FormData()
          formData.append("thumbnail", thumbnailBlob, `thumbnail-${resumeId}.png`)

          const uploadResponse = await axiosInstance.put(
            API_PATHS.RESUME.UPLOAD_IMAGES(resumeId),
            formData
          )

          thumbnailLink = uploadResponse?.data?.thumbnailLink || thumbnailLink
        } catch (uploadError) {
          console.error("Thumbnail upload failed, continuing with data save:", uploadError)
          const backendError = uploadError?.response?.data?.error
          const backendMessage = uploadError?.response?.data?.message
          toast.error(backendError || backendMessage || "Thumbnail upload failed, saving data only")
        }
      }

      await updateResumeDetails(thumbnailLink)

      toast.success("Resume Updated Successfully")
      navigate("/dashboard")
    } catch (error) {
      console.error("Error saving resume:", error)
      const backendError = error?.response?.data?.error
      const backendMessage = error?.response?.data?.message
      toast.error(backendError || backendMessage || "Failed to save resume")
    } finally {
      setIsLoading(false)
    }
  }


  //this function is an update the resume o thumbnail link on backend
  const updateResumeDetails = async (thumbnailLink) => {
    try {
      setIsLoading(true)

      await axiosInstance.put(API_PATHS.RESUME.UPDATE(resumeId), {
        ...resumeData,
        thumbnailLink: thumbnailLink || "",
        completion: completionPercentage,
      })
    } catch (err) {
      console.error("Error updating resume:", err)
      toast.error("Failed to update resume details")
    } finally {
      setIsLoading(false)
    }
  }

  // DELETE FUNCTION TO DELETE ANY RESUME
  const handleDeleteResume = async () => {
    try {
      setIsLoading(true)
      await axiosInstance.delete(API_PATHS.RESUME.DELETE(resumeId))
      toast.success("Resume deleted successfully")
      navigate("/dashboard")
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast.error("Failed to delete resume")
    } finally {
      setIsLoading(false)
    }
  }

  // IT DOWNLOAD THE POST ANDD ALSO FIX THE POINT
  const _downloadPDF = async () => {
    const element = resumeDownloadRef.current;
    if (!element) {
      toast.error("Failed to generate PDF. Please try again.");
      return;
    }

    setIsDownloading(true);
    setDownloadSuccess(false);
    const toastId = toast.loading("Generating PDF...");

    const override = document.createElement("style");
    override.id = "__pdf_color_override__";
    override.textContent = `
      * {
        color: #000 !important;
        background-color: #fff !important;
        border-color: #000 !important;
      }


    `;
    document.head.appendChild(override);
    // HTML - TO -PDF IT WILL BE downloaded
    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `${resumeData.title.replace(/[^a-z0-9]/gi, "_")}.pdf`,
          image: { type: "png", quality: 1.0 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#FFFFFF",
            logging: false,
            windowWidth: element.scrollWidth,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
          }
        })
        .from(element)
        .save(); // SAVE THE RESUME

      toast.success("PDF downloaded successfully!", { id: toastId });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);

    } catch (err) {
      console.error("PDF error:", err);
      toast.error(`Failed to generate PDF: ${err.message}`, { id: toastId });

    } finally {
      document.getElementById("__pdf_color_override__")?.remove();
      setIsDownloading(false);
    }
  };

  const _updateTheme = (theme) => {
    setResumeData(prev => ({
      ...prev,
      template: {
        theme: theme,
        colorPalette: []
      }
    }));
  }

  useEffect(() => {
    if (resumeId) {
      fetchResumeDetailsById()
    }
  }, [resumeId, fetchResumeDetailsById])

  // ALL THE FUNCTION WILL BE USED FOR THE EDIT Resume
  // ALL THE code THAT I HAVE GIVEN IS ON GITHUB SO GET IT thought THE GIVEN LINK BELOW
  return (
    <DashboardLayout>
      <div className={containerStyles.main} >
        <div className={containerStyles.header} >
          <TitleInput title={resumeData.title}
            setTitle={(value) => setResumeData((prev) => ({
              ...prev,
              title: value
            }))
            }
          />

          <div className='flex flex-wrap item-center gap-3'>
            <button onClick={() => setOpenThemeSelector(true)} className={buttonStyles.theme}>
              <Palette size={16} />
              <span className='text-sm'> Theme</span>
            </button>
            <button onClick={handleDeleteResume} className={buttonStyles.delete} disabled={isLoading}>
              <Trash2 size={16} />
              <span className='text-sm'> Delete</span>
            </button>
            <button onClick={() => setOpenPreviewModal(true)} className={buttonStyles.download} >
              <Download size={16} />
              <span className='text-sm'> Preview </span>
            </button>
          </div>
        </div>

        {/* STEP progress */}
        <div className={containerStyles.grid}>
          <div className={containerStyles.formContainer}>
            <StepProgress progress={_progress} />
            {_renderForm()}
            <div className='p-4 sm:p-6'>
              {_errorMsg && (
                <div className={statusStyles.error}>
                  <AlertCircle size={16} />
                  {_errorMsg}
                </div>
              )}
              <div className='flex flex-wrap items-center justify-end gap-3'>
                <button className={buttonStyles.back} onClick={_goBack} disabled={isLoading}>
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button className={buttonStyles.save} onClick={_uploadResumeImages} disabled={isLoading}>
                  {isLoading ? <Loader2 size={16} className='animate-spin' />
                    : <Save size={16} />}
                  {isLoading ? "Saving" : "Save & Exit"}
                </button>

                <button className={buttonStyles.next} onClick={validateAndNext} disabled={isLoading}>
                  {currentPage === "additionalInfo" && <Download size={16} />}
                  {currentPage === "additionalInfo" ? "Preview & Download" : "Next"}
                  {currentPage === "additionalInfo" && <ArrowLeft size={16} className=" rotate-180" />}
                </button>
              </div>
            </div>
          </div>

          <div className='hidden lg:block'>
            <div className={containerStyles.previewContainer}>
              <div className=' text-center mb-4'>
                <div className={statusStyles.completionBadge}>
                  <div className={iconStyles.pulseDot}></div>
                  <span> Preview - {completionPercentage} % Complete</span>
                </div>
              </div>
              <div className=' preview-container relative' ref={_previewContainerRef} >
                <div className={containerStyles.previewInner}>
                  <RenderResume key={`preview-${resumeData?.template?.theme}`}
                    templateId={resumeData?.template?.theme || ""}
                    resumeData={resumeData}
                    containerWidth={_previewWidth}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Data  */}
      <Modal isOpen={_openThemeSelector} onClose={() => setOpenThemeSelector(false)} title="Change Title" >
        <div className={containerStyles.modalContent}>
          <ThemeSelector selectTheme={resumeData?.template?.theme}
            setSelectedTheme={_updateTheme} onClose={() => setOpenThemeSelector(false)} />
        </div>
      </Modal>

      <Modal isOpen={_openPreviewModal} onClose={() => setOpenPreviewModal(false)} title={resumeData.title}
        showActionBtn
        actionBtnText={_isDownloading ? "Generating ..."
          : _downloadSuccess ? "Downloaded!" : "Downloaded PDF"}

        actionBtnIcon={
          _isDownloading ? (
            <Loader2 size={16} className='animate-spin' />
          ) : _downloadSuccess ? (
            <Check size={16} className='text-white' />
          ) : (
            <Download size={16} />
          )
        }
        onActionClick={_downloadPDF}
      >
        <div className=' relative'>
          <div className=' text-center mb-4'>
            <div className={iconStyles.pulseDot}></div>
            <span>Completion: {completionPercentage}%</span>
          </div>
        </div>
        <div className={containerStyles.pdfPreview}>
          <div ref={resumeDownloadRef} className=' a4-wrapper'>
            <div className=' w-full h-full'>
              <RenderResume key={`pdf-${resumeData?.template?.theme}`}
                templateId={resumeData?.template?.theme || ""}
                resumeData={resumeData}
                containerWidth={null}
              />
            </div>
          </div>
        </div>
      </Modal>
      {/* Now Thumbnail Error Fix */}
      <div
        ref={thumbnailRef}
        style={{
          position: "fixed",
          top: "-10000px",
          left: "-10000px",
          width: "800px",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <div className={containerStyles.hiddenThumbnail}>
          <RenderResume key={`thumb-${resumeData?.template?.theme}`}
            templateId={resumeData?.template?.theme || ""}
            resumeData={resumeData}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EditResume

