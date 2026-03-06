import express from 'express'
import { protect } from '../middleware/authMiddleWare.js'
import {
  getUserProfile,
  loginUser,
  registerUser
} from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)

// Protected route (JWT required)
userRouter.get('/profile', protect, getUserProfile)

export default userRouter
