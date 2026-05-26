// Shared Type Definitions for All Projects
// This file should be copied to both frontend projects for consistency

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'contributor' | 'client';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  phone?: string;
  avatar?: string;
  company?: string;
  location?: string;
  bio?: string;
  website?: string;
  experience?: string;
  specialties?: string;
  skills?: string;
  permissions?: Record<string, boolean>;
  productsUploaded?: number;
  totalSales?: number;
  joinDate?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  parentId?: number;
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'size' | 'style' | 'material' | 'custom';
  value: string;
  priceModifier?: number;
  stock?: number;
  sku?: string;
  image?: string;
  thumbnail?: string;
  isDefault?: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  thumbnail: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductSwatch {
  id: string;
  variantId: string;
  color?: string;
  image?: string;
  thumbnail?: string;
  name: string;
  isAvailable?: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stock: number;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  
  // Media
  imageUrl?: string;
  thumbnailUrl?: string;
  gallery?: ProductImage[];
  
  // Variants and Swatches
  variants?: ProductVariant[];
  swatches?: ProductSwatch[];
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  
  // Metadata
  categoryId?: number;
  category?: Category;
  tags?: string[];
  features?: string[];
  
  // Analytics
  viewCount?: number;
  downloadCount?: number;
  rating?: number;
  reviewCount?: number;
  
  // Relationships
  userId: number;
  user?: User;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  user?: User;
  product?: Product;
}

export interface PortfolioItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  overview?: string;
  category: string;
  tags?: string[];
  mediaType: 'image' | 'video' | 'mixed';
  mediaUrl: string;
  thumbnailUrl?: string;
  gallery?: ProductImage[];
  features?: string[];
  testimonial?: {
    quote: string;
    author: string;
    company: string;
  };
  client?: string;
  location?: string;
  projectDate?: string;
  status: 'active' | 'inactive' | 'draft';
  userId: number;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  user?: User;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  userId: number;
  categoryId?: number;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  viewCount?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  user?: User;
  category?: Category;
}

export interface Testimonial {
  id: number;
  name: string;
  email?: string;
  company?: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  userId?: number;
  productId?: number;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  user?: User;
  product?: Product;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  location?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  totalProjects: number;
  totalSpent: number;
  projectTypes?: string[];
  lastContact?: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  user?: User;
}

export interface Download {
  id: number;
  fileName: string;
  originalName: string;
  fileType?: string;
  fileSize?: number;
  filePath: string;
  thumbnailUrl?: string;
  category?: string;
  description?: string;
  downloadCount: number;
  downloadLimit?: number;
  status: 'active' | 'expired' | 'archived';
  expiryDate?: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  user?: User;
}

export interface Message {
  id: number;
  senderId?: number;
  recipientId?: number;
  subject: string;
  content: string;
  status: 'unread' | 'read' | 'archived' | 'deleted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isStarred: boolean;
  hasAttachment: boolean;
  attachmentUrl?: string;
  projectId?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  sender?: User;
  recipient?: User;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
    method?: string;
    statusCode: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  location?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// File Upload Types
export interface FileUploadResponse {
  success: boolean;
  file: {
    id: string;
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    thumbnailUrl?: string;
  };
}
