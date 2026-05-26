"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_1 = require("../../common/middleware/auth");
const users_controller_1 = require("./users.controller");
const multer_1 = __importDefault(require("multer"));
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
exports.router = (0, express_1.Router)();
// Public routes
exports.router.get('/', users_controller_1.getUsers);
exports.router.get('/stats', users_controller_1.getUserStats);
// Profile routes (require authentication)
exports.router.get('/profile', auth_1.authenticate, users_controller_1.getCurrentUserProfile);
exports.router.put('/profile', auth_1.authenticate, users_controller_1.updateCurrentUserProfile);
// New profile system routes
exports.router.get('/me', auth_1.authenticate, users_controller_1.getFullUserProfile);
exports.router.put('/update', auth_1.authenticate, users_controller_1.updateUserProfile);
exports.router.post('/upload-avatar', auth_1.authenticate, upload.single('avatar'), users_controller_1.uploadAvatar);
exports.router.put('/change-password', auth_1.authenticate, users_controller_1.changePassword);
exports.router.delete('/delete-account', auth_1.authenticate, users_controller_1.deleteUserAccount);
// Protected routes (require authentication)
exports.router.get('/:id', auth_1.authenticate, users_controller_1.getUserById);
exports.router.put('/:id', auth_1.authenticate, users_controller_1.updateUser);
// Admin only routes
exports.router.delete('/:id', auth_1.authenticateAdmin, users_controller_1.deleteUser);
exports.default = exports.router;
