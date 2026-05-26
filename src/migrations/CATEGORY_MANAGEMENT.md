# Category Management Guide

This guide explains how to manage categories in the AFRISTREAM application using both the seeder and the API.

## 🌱 Seeding Default Categories

### Quick Start

```bash
# Navigate to the backend directory
cd Backend

# Seed default categories (only if none exist)
npm run seed:categories

# Reset and re-seed all categories
npm run seed:categories:reset
```

### Manual Execution

```bash
# Direct execution
tsx src/migrations/seed-categories.ts

# Reset mode
tsx src/migrations/seed-categories.ts reset
```

### Default Categories

The seeder creates these categories:

1. **Picture Frames** (`picture-frames`) - Custom picture frames and photo displays
2. **Apps** (`apps`) - Mobile and web applications  
3. **Phones** (`phones`) - Phone accessories and cases
4. **Web Designs** (`web-designs`) - Website design and development services
5. **Logos** (`logos`) - Logo design and branding services
6. **Graphics Design** (`graphics-design`) - Graphic design and visual content creation
7. **Branding** (`branding`) - Complete branding and identity design
8. **Art & Paints** (`art-paint`) - Artwork and painting services
9. **Videos & Pictures** (`videos-pictures`) - Video production and photography services

## 🔧 API Management

### Base URL
```
http://localhost:5000/api/v1/categories
```

### Endpoints

#### 1. Get All Categories
```http
GET /api/v1/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Picture Frames",
    "slug": "picture-frames",
    "description": "Custom picture frames and photo displays",
    "parent_id": null,
    "sort_order": 1,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 2. Get Category by Slug
```http
GET /api/v1/categories/picture-frames
```

**Response:**
```json
{
  "id": 1,
  "name": "Picture Frames",
  "slug": "picture-frames",
  "description": "Custom picture frames and photo displays",
  "parent_id": null,
  "sort_order": 1,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### 3. Create Category (Admin Only)
```http
POST /api/v1/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "parent_id": null,
  "sort_order": 10,
  "is_active": true
}
```

#### 4. Delete Category (Admin Only)
```http
DELETE /api/v1/categories/1
Authorization: Bearer <admin_token>
```

## 🚀 Frontend Integration

### Fetching Categories in React

```typescript
// In your React component
const [categories, setCategories] = useState([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  fetchCategories();
}, []);
```

### Using Categories in Dropdowns

```typescript
// Example for a category dropdown
<select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
  <option value="">Select a category</option>
  {categories.map((category) => (
    <option key={category.id} value={category.slug}>
      {category.name}
    </option>
  ))}
</select>
```

## 📝 Managing Categories

### Adding New Categories

1. **Via API (Recommended):**
   ```bash
   curl -X POST http://localhost:5000/api/v1/categories \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "New Category",
       "slug": "new-category",
       "description": "Description here",
       "sort_order": 10
     }'
   ```

2. **Via Database (Direct):**
   ```sql
   INSERT INTO categories (name, slug, description, sort_order, is_active, created_at, updated_at)
   VALUES ('New Category', 'new-category', 'Description', 10, true, NOW(), NOW());
   ```

### Updating Categories

```bash
# Update via API (you'll need to implement PUT endpoint)
curl -X PUT http://localhost:5000/api/v1/categories/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Category Name",
    "description": "Updated description"
  }'
```

### Deleting Categories

```bash
# Delete via API
curl -X DELETE http://localhost:5000/api/v1/categories/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔄 Best Practices

### 1. **Use Slugs for URLs**
- Always use category slugs in URLs, not IDs
- Slugs are SEO-friendly and human-readable

### 2. **Sort Order Management**
- Use `sort_order` to control display order
- Lower numbers appear first
- Leave gaps (10, 20, 30) for easy reordering

### 3. **Parent-Child Relationships**
- Use `parent_id` for category hierarchies
- Example: "Electronics" → "Phones" → "iPhone Cases"

### 4. **Soft Deletes**
- Set `is_active = false` instead of deleting
- This preserves product relationships

### 5. **Frontend Caching**
- Cache categories in your frontend state
- Refresh periodically or on user action

## 🛠️ Development Commands

```bash
# Start the backend server
npm run dev

# Run migrations
npm run migrate

# Seed categories
npm run seed:categories

# Reset categories
npm run seed:categories:reset

# Run tests
npm test
```

## 🐛 Troubleshooting

### Categories Not Loading
1. Check if backend is running on port 5000
2. Verify database connection
3. Check CORS settings
4. Ensure categories table exists

### Seeder Not Working
1. Check database connection
2. Verify table structure
3. Check for duplicate slugs
4. Review error logs

### API Errors
1. Check authentication tokens
2. Verify request format
3. Check database constraints
4. Review server logs

## 📊 Database Schema

```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id INT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_categories_slug (slug),
  INDEX idx_categories_parent_id (parent_id),
  INDEX idx_categories_is_active_sort (is_active, sort_order)
);
```

This guide provides everything you need to manage categories effectively in your AFRISTREAM application!
