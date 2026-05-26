import { Router } from 'express';
import { authenticate, authenticateAdmin } from '../../common/middleware/auth';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUserStats, 
  getCurrentUserProfile, 
  updateCurrentUserProfile,
  getFullUserProfile,
  updateUserProfile,
  uploadAvatar,
  changePassword,
  deleteUserAccount
} from './users.controller';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export const router = Router();

// Public routes
router.get('/', getUsers);
router.get('/stats', getUserStats);

// Profile routes (require authentication)
router.get('/profile', authenticate, getCurrentUserProfile);
router.put('/profile', authenticate, updateCurrentUserProfile);

// New profile system routes
router.get('/me', authenticate, getFullUserProfile);
router.put('/update', authenticate, updateUserProfile);
router.post('/upload-avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.put('/change-password', authenticate, changePassword);
router.delete('/delete-account', authenticate, deleteUserAccount);

// Protected routes (require authentication)
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);

// Admin only routes
router.delete('/:id', authenticateAdmin, deleteUser);

export default router;
