export const BASE_URL = "https://rb-mern-stack.onrender.com"

// Routes Used
export const API_PATHS = {

    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        GET_PROFILE: '/api/auth/profile'   // FIXED: missing '/'
    },

    RESUME: {
        CREATE: '/api/resume',
        GET_ALL: '/api/resume',
        GET_BY_ID: (id) => `/api/resume/${id}`,
        UPDATE: (id) => `/api/resume/${id}`,
        DELETE: (id) => `/api/resume/${id}`,
        UPLOAD_IMAGES: (id) => `/api/resume/${id}/upload-images`
    },

    IMAGE: {   // FIXED: consistent naming
        // eslint-disable-next-line no-unused-vars
        UPLOAD_IMAGES: `/api/auth/upload-images`
    }
}
