import fs from 'fs'
import path from 'path'
import multer from 'multer'

const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, uploadsDir)
    },
    filename:(req,file,cb) =>{
        const safeName = file.originalname.replace(/\s+/g, '-')
        cb(null, `${Date.now()}-${safeName}`)
    },
});

// FIle filter

const fileFilter = (req,file,cb)=>{
    const allowedTypes = ['image/jpeg','image/png','image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null,true)
    }
    else {
        cb(new Error("only .jpeg, .png, .jpg formats are allowed"),false)
    }
}

const upload = multer ({ storage, fileFilter})

export default upload;
