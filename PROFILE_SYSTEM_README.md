# Profile System Backend Implementation

## Overview
This document outlines the comprehensive backend implementation for the new profile system, including database schema updates, API endpoints, and security measures.

## Database Schema Changes

### 1. Updated Users Table
```sql
-- Added new columns to users table
ALTER TABLE `users` 
ADD COLUMN `address` TEXT DEFAULT NULL AFTER `phone`,
ADD COLUMN `avatar_url` VARCHAR(255) DEFAULT NULL AFTER `avatar`,
ADD COLUMN `two_factor_enabled` BOOLEAN DEFAULT FALSE AFTER `avatar_url`;
```

### 2. New Tables Created

#### Addresses Table
```sql
CREATE TABLE `addresses` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `street` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `region` VARCHAR(100) NOT NULL,
  `zip_code` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);
```

#### Orders Table (Updated)
```sql
CREATE TABLE `orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `shipping_address` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);
```

#### Order Items Table
```sql
CREATE TABLE `order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL,
  `product_id` INT(11) NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
);
```

#### Wishlist Table
```sql
CREATE TABLE `wishlist` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `product_id` INT(11) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
);
```

#### Sessions Table
```sql
CREATE TABLE `sessions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `device` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `last_active` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);
```

#### Support Tickets Table
```sql
CREATE TABLE `support_tickets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('Open', 'In Progress', 'Closed') DEFAULT 'Open',
  `priority` ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);
```

## API Endpoints

### User Profile Endpoints
```
GET    /api/users/me                    - Get full user profile with completion percentage
PUT    /api/users/update                - Update user profile
POST   /api/users/upload-avatar         - Upload profile picture
PUT    /api/users/change-password       - Change password
DELETE /api/users/delete-account        - Delete user account
```

### Address Management Endpoints
```
GET    /api/addresses                   - Get all user addresses
POST   /api/addresses                   - Add new address
PUT    /api/addresses/:id               - Update address
DELETE /api/addresses/:id               - Delete address
PATCH  /api/addresses/:id/default       - Set default address
```

### Order Management Endpoints
```
GET    /api/orders/my-orders            - Get user's orders
GET    /api/orders/my-orders/:id        - Get single order details
GET    /api/orders/invoice/:id           - Generate invoice PDF
```

### Wishlist Endpoints
```
GET    /api/wishlist                    - Get user wishlist
POST   /api/wishlist                    - Add item to wishlist
DELETE /api/wishlist/:id                - Remove item from wishlist
DELETE /api/wishlist                    - Clear entire wishlist
```

### Session Management Endpoints
```
GET    /api/sessions                    - Get user sessions
DELETE /api/sessions/:id                - Log out from specific session
DELETE /api/sessions                    - Log out from all other sessions
POST   /api/sessions/2fa/toggle         - Toggle Two-Factor Authentication
```

### Support Ticket Endpoints
```
GET    /api/support/tickets             - Get user support tickets
GET    /api/support/tickets/:id          - Get single ticket details
POST   /api/support/tickets              - Create new support ticket
PUT    /api/support/tickets/:id          - Update support ticket
```

## Security Implementation

### JWT Authentication
All profile-related endpoints are protected with JWT middleware:
```typescript
router.use(authenticateToken);
```

### Role-Based Access Control
- **User Role**: Can access their own data only
- **Admin Role**: Can access all user data
- **Protected Operations**: Account deletion, admin management

### Password Security
- Bcrypt hashing with salt rounds: 12
- Current password verification for changes
- Password confirmation for account deletion

### File Upload Security
- File type validation (images only)
- File size limits (5MB max)
- Secure file storage in uploads directory

## Data Validation

### Input Validation
- Required field validation
- Email format validation
- Phone number format validation
- File type and size validation

### Business Logic Validation
- Unique email addresses
- Default address management
- Order ownership verification
- Session ownership verification

## Error Handling

### Standardized Error Responses
```typescript
{
  "error": "Error type",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

### Error Types
- `AppError.unauthorized()` - Authentication required
- `AppError.notFound()` - Resource not found
- `AppError.conflict()` - Resource conflict
- `AppError.badRequest()` - Invalid input
- `AppError.forbidden()` - Access denied
- `AppError.internal()` - Server error

## Database Migration

### Running the Migration
```bash
# Execute the migration script
mysql -u username -p database_name < src/migrations/20250120_profile_system_update.sql
```

### Migration Features
- Non-destructive updates
- Data preservation
- Index optimization
- Foreign key constraints
- Sample data insertion

## Testing

### Unit Tests
- Controller function testing
- Database query testing
- Validation testing
- Error handling testing

### Integration Tests
- API endpoint testing
- Authentication flow testing
- Database transaction testing
- File upload testing

## Performance Optimizations

### Database Indexes
- User email index
- Order user_id index
- Session user_id index
- Support ticket user_id index

### Query Optimization
- Efficient JOIN operations
- Pagination support
- Caching strategies
- Connection pooling

## Deployment Considerations

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
DB_NAME=afristream_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=5242880
```

### Production Setup
1. Run database migration
2. Set up file upload directory
3. Configure JWT secrets
4. Set up error monitoring
5. Configure rate limiting

## Monitoring and Logging

### Logging Strategy
- Request/response logging
- Error logging
- Performance monitoring
- Security event logging

### Health Checks
- Database connectivity
- File system access
- JWT token validation
- API endpoint availability

## Future Enhancements

### Planned Features
- Email notifications
- Push notifications
- Advanced analytics
- API rate limiting
- Caching layer
- Microservices architecture

### Scalability Considerations
- Database sharding
- Load balancing
- CDN integration
- Caching strategies
- Queue systems

## Support and Maintenance

### Documentation
- API documentation
- Database schema documentation
- Deployment guides
- Troubleshooting guides

### Maintenance Tasks
- Regular database backups
- Log rotation
- Performance monitoring
- Security updates
- Dependency updates
