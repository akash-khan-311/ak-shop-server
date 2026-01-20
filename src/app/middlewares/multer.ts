import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // temporary upload folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

export const uploadCategoryImage = multer({ storage })
