// Enhanced Product Types with Thumbnails and Variants Support

export interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'size' | 'style' | 'material' | 'custom';
  value: string;
  priceModifier?: number; // Additional cost for this variant
  stock?: number;
  sku?: string;
  image?: string; // Variant-specific image
  thumbnail?: string; // Variant-specific thumbnail
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
  color?: string; // Hex color code
  image?: string; // Swatch image
  thumbnail?: string; // Swatch thumbnail
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
  category?: string;
  tags?: string[];
  features?: string[];
  
  // Frame sizes (for picture frames only)
  frameOptions?: Array<{
    size: string;
    price: number;
    stock?: number;
  }>;

  // Analytics
  viewCount?: number;
  downloadCount?: number;
  rating?: number;
  reviewCount?: number;
  
  // Relationships
  userId: number;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'created_desc' | 'rating_desc';
  featured?: boolean;
  category?: string;
  categoryId?: number;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

export interface PaginatedProducts {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductCreateInput {
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stock?: number;
  status?: 'active' | 'inactive' | 'draft';
  categoryId?: number;
  tags?: string[];
  features?: string[];
  seoTitle?: string;
  seoDescription?: string;
  variants?: Omit<ProductVariant, 'id'>[];
  swatches?: Omit<ProductSwatch, 'id'>[];
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {
  id: number;
}

export interface ProductFilterOptions {
  categories: Array<{ id: number; name: string; count: number }>;
  priceRanges: Array<{ min: number; max: number; count: number }>;
  tags: Array<{ name: string; count: number }>;
  features: Array<{ name: string; count: number }>;
}
