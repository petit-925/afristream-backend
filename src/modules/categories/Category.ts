// Category model interface for TypeScript
export interface Category {
  id: number;
  name: string;
  description?: string | null;
  slug: string;
  parent_id?: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Category creation interface (for creating new categories)
export interface CategoryCreationAttributes {
  name: string;
  description?: string | null;
  slug: string;
  parent_id?: number | null;
  sort_order?: number;
  is_active?: boolean;
}

// Category update interface (for updating existing categories)
export interface CategoryUpdateAttributes {
  name?: string;
  description?: string | null;
  slug?: string;
  parent_id?: number | null;
  sort_order?: number;
  is_active?: boolean;
}

export default Category;
