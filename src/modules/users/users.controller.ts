import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../services/db';
import { AppError } from '../../common/errors/AppError';
import bcrypt from 'bcryptjs';

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, status, phone, company, location, avatar_url, created_at, last_login FROM users ORDER BY created_at DESC'
    );
    res.json(rows as RowDataPacket[]);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw AppError.internal('Failed to fetch users', error);
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, status, phone, company, location, bio, website, experience, specialties, skills, created_at, last_login FROM users WHERE id = ?',
      [id]
    );
    const users = rows as RowDataPacket[];
    if (users.length === 0) {
      throw AppError.notFound('User not found');
    }
    
    res.json(users[0]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching user:', error);
    throw AppError.internal('Failed to fetch user', error);
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, phone, company, location, bio, website, experience, specialties, skills } = req.body;

    // Check if user exists
    const [existingRows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      throw AppError.notFound('User not found');
    }

    // Check if email is already taken by another user
    if (email) {
      const [emailRows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailRows.length > 0) {
        throw AppError.conflict('Email already in use by another user');
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (company !== undefined) { updates.push('company = ?'); values.push(company); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (bio !== undefined) { updates.push('bio = ?'); values.push(bio); }
    if (website !== undefined) { updates.push('website = ?'); values.push(website); }
    if (experience !== undefined) { updates.push('experience = ?'); values.push(experience); }
    if (specialties !== undefined) { updates.push('specialties = ?'); values.push(specialties); }
    if (skills !== undefined) { updates.push('skills = ?'); values.push(skills); }

    if (updates.length === 0) {
      throw AppError.badRequest('No valid fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    // Fetch updated user
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, status, phone, company, location, bio, website, experience, specialties, skills, created_at, last_login FROM users WHERE id = ?',
      [id]
    );
    const updatedUser = (updatedRows as RowDataPacket[])[0] as any;
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error updating user:', error);
    throw AppError.internal('Failed to update user', error);
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingRows] = await pool.query<RowDataPacket[]>('SELECT id, role, is_protected FROM users WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      throw AppError.notFound('User not found');
    }
    const user = existingRows[0] as { id: number; role: string; is_protected?: number };

    // Prevent deletion of protected users (like default admin)
    if (user.is_protected) {
      throw AppError.forbidden('Cannot delete protected user account');
    }

    // Prevent deletion of the last admin
    if (user.role === 'admin') {
      const [adminRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
      const adminCount = (adminRows[0] as any).count as number;
      
      if (adminCount <= 1) {
        throw AppError.forbidden('Cannot delete the last admin user');
      }
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error deleting user:', error);
    throw AppError.internal('Failed to delete user', error);
  }
};

// Get current user profile (from JWT token)
export const getCurrentUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, status, account_type, phone, address, company, location, bio, website, experience, specialties, skills, avatar_url, two_factor_enabled, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );
    const users = rows as RowDataPacket[];
    if (users.length === 0) {
      throw AppError.notFound('User not found');
    }
    
    res.json(users[0]);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching user profile:', error);
    throw AppError.internal('Failed to fetch user profile', error);
  }
};

// Update current user profile (from JWT token)
export const updateCurrentUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { name, email, phone, address, company, location, bio, website, experience, specialties, skills, avatar_url } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const [emailRows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (emailRows.length > 0) {
        throw AppError.conflict('Email already in use by another user');
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (company !== undefined) { updates.push('company = ?'); values.push(company); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (bio !== undefined) { updates.push('bio = ?'); values.push(bio); }
    if (website !== undefined) { updates.push('website = ?'); values.push(website); }
    if (experience !== undefined) { updates.push('experience = ?'); values.push(experience); }
    if (specialties !== undefined) { updates.push('specialties = ?'); values.push(specialties); }
    if (skills !== undefined) { updates.push('skills = ?'); values.push(skills); }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); values.push(avatar_url); }

    if (updates.length === 0) {
      throw AppError.badRequest('No valid fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    // Fetch updated user
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, status, account_type, phone, address, company, location, bio, website, experience, specialties, skills, avatar_url, two_factor_enabled, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );
    const updatedUser = (updatedRows as RowDataPacket[])[0] as any;
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error updating user profile:', error);
    throw AppError.internal('Failed to update user profile', error);
  }
};

// Get user statistics
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const [totalRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM users');
    const [activeRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as active FROM users WHERE status = "active"');
    const [adminRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as admins FROM users WHERE role = "admin"');
    const [clientRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as clients FROM users WHERE role = "client"');

    const total = (totalRows[0] as any).total as number;
    const active = (activeRows[0] as any).active as number;
    const admins = (adminRows[0] as any).admins as number;
    const clients = (clientRows[0] as any).clients as number;

    res.json({
      total,
      active,
      inactive: total - active,
      admins,
      clients,
      editors: total - admins - clients
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw AppError.internal('Failed to fetch user statistics', error);
  }
};

// =============================================
// NEW PROFILE SYSTEM FUNCTIONS
// =============================================

// Get full user profile with completion percentage
export const getFullUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    // Get user basic info
    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, phone, address, avatar_url, two_factor_enabled, role, status, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      throw AppError.notFound('User not found');
    }

    const user = userRows[0] as any;
    
    // Calculate profile completion percentage
    let completed = 0;
    const total = 5;
    
    if (user.name) completed++;
    if (user.email) completed++;
    if (user.phone) completed++;
    if (user.address) completed++;
    if (user.avatar_url) completed++;
    
    const profileCompletion = Math.round((completed / total) * 100);

    // Get user addresses
    const [addressRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.json({
      ...user,
      profileCompletion,
      addresses: addressRows
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching full user profile:', error);
    throw AppError.internal('Failed to fetch user profile', error);
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { name, email, phone, address, avatar_url } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const [emailRows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (emailRows.length > 0) {
        throw AppError.conflict('Email already in use by another user');
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); values.push(avatar_url); }

    if (updates.length === 0) {
      throw AppError.badRequest('No valid fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    // Fetch updated user
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, phone, address, avatar_url, two_factor_enabled, role, status, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    const updatedUser = (updatedRows as RowDataPacket[])[0] as any;
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error updating user profile:', error);
    throw AppError.internal('Failed to update user profile', error);
  }
};

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const avatarUrl = req.file?.path || req.body.avatar_url;
    if (!avatarUrl) {
      throw AppError.badRequest('No avatar file provided');
    }

    await pool.query('UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?', [avatarUrl, userId]);

    res.json({ 
      message: 'Avatar uploaded successfully',
      avatar_url: avatarUrl 
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error uploading avatar:', error);
    throw AppError.internal('Failed to upload avatar', error);
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw AppError.badRequest('Current password and new password are required');
    }

    // Get current password hash
    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      throw AppError.notFound('User not found');
    }

    const user = userRows[0] as any;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error changing password:', error);
    throw AppError.internal('Failed to change password', error);
  }
};

// Delete user account
export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { password } = req.body;

    if (!password) {
      throw AppError.badRequest('Password confirmation is required');
    }

    // Get user password
    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT password, role FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      throw AppError.notFound('User not found');
    }

    const user = userRows[0] as any;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Password is incorrect');
    }

    // Prevent deletion of the last admin
    if (user.role === 'admin') {
      const [adminRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
      const adminCount = (adminRows[0] as any).count as number;
      
      if (adminCount <= 1) {
        throw AppError.forbidden('Cannot delete the last admin user');
      }
    }

    // Delete user (cascade will handle related records)
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error deleting user account:', error);
    throw AppError.internal('Failed to delete account', error);
  }
};
