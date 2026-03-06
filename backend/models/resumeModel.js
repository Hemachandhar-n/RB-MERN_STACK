import mongoose from 'mongoose'

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true
    },

    thumbnailLink: {
      type: String,
    },

    template: {                 // ❌ templete → ✅ template
      theme: String,
      colorPalette: [String]    // ❌ [string] → ✅ [String]
    },

    profileInfo: {
      profilePreviewUrl: String,
      previewUrl: String,
      fullName: String,
      fullname: String,
      designation: String,
      summary: String,
    },

    contactInfo: {
      email: String,
      phone: String,            // ❌ Number → ✅ String (phone numbers)
      location: String,
      linkedin: String,
      linkedIn: String,
      github: String,
      website: String,
    },

    workExperience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        description: String,
      }
    ],

    education: [
      {
        degree: String,
        institution: String,
        startDate: String,
        endDate: String,
      }
    ],

    skills: [                   // ❌ skill → ✅ skills (plural, consistency)
      {
        name: String,
        progress: Number,
      }
    ],

    projects: [
      {
        title: String,
        description: String,
        github: String,
        liveDemo: String,
      }
    ],

    certifications: [           // ❌ certification → ✅ certifications
      {
        title: String,
        issuer: String,
        year: String,
      }
    ],

    languages: [
      {
        name: String,
        progress: Number,
      }
    ],

    interests: [String],        // ❌ interest → ✅ interests

    completion: {
      type: Number,
      default: 0
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",   // ❌ createAt → ✅ createdAt
      updatedAt: "updatedAt"
    }
  }
)

export default mongoose.model("Resume", ResumeSchema)
