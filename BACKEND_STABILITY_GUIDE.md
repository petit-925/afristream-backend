# Backend Stability Guide

## Issues Fixed

### 1. ✅ Unhandled Promise Rejections
**Problem**: Unhandled promise rejections would crash the server silently.

**Fix**: Added global `unhandledRejection` handler that logs errors without crashing.

### 2. ✅ Uncaught Exceptions
**Problem**: Synchronous errors would crash the server immediately.

**Fix**: Added `uncaughtException` handler with graceful shutdown.

### 3. ✅ Database Connection Issues
**Problem**: Database connection errors could crash the server or exhaust the pool.

**Fix**: 
- Added connection pool event handlers
- Added connection timeout settings
- Added health check monitoring
- Pool errors no longer crash the server

### 4. ✅ No Graceful Shutdown
**Problem**: Server would terminate abruptly on signals.

**Fix**: Added graceful shutdown handler that:
- Closes HTTP server
- Closes database pool
- Waits for ongoing requests
- Forces shutdown after timeout

### 5. ✅ Server Error Events
**Problem**: HTTP server errors (port conflicts, etc.) weren't handled.

**Fix**: Added server error event handlers with proper logging.

### 6. ✅ Memory Leaks
**Problem**: No monitoring for memory usage.

**Fix**: Added memory monitoring in development mode.

## Deployment Options

### Option 1: PM2 (Recommended for Production)

PM2 is a process manager that keeps your Node.js app running, auto-restarts on crashes, and provides monitoring.

**Installation:**
```bash
npm install -g pm2
```

**Start with PM2:**
```bash
# Build first
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Or start directly
pm2 start dist/server.js --name afristream-backend
```

**PM2 Commands:**
```bash
pm2 list              # List all processes
pm2 monit             # Monitor processes
pm2 logs              # View logs
pm2 restart all       # Restart all
pm2 stop all          # Stop all
pm2 delete all        # Delete all
pm2 save              # Save current process list
pm2 startup           # Auto-start on system boot
```

### Option 2: Node.js with nohup (Simple)

```bash
# Build
npm run build

# Run in background
nohup node dist/server.js > server.log 2>&1 &

# Check if running
ps aux | grep node

# Stop
pkill -f "node dist/server.js"
```

### Option 3: Windows Service (Windows)

Use `node-windows` to run as a Windows service:

```bash
npm install -g node-windows
npm link node-windows

# Create service
node-windows install
```

### Option 4: Docker (Containerized)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

## Monitoring & Debugging

### Health Check Endpoint

The server includes a health check endpoint:
```
GET http://localhost:5000/health
```

Response:
```json
{
  "ok": true,
  "uptime": 12345.67
}
```

### Logs

Check logs for:
- Unhandled rejections
- Database connection issues
- Memory usage
- Server errors

### Common Issues

1. **Port Already in Use**
   - Check if another process is using port 5000
   - Change PORT in `.env` file

2. **Database Connection Lost**
   - Check MySQL is running
   - Verify database credentials
   - Check network connectivity

3. **Memory Issues**
   - Monitor memory usage
   - Restart if memory exceeds limits
   - Check for memory leaks in code

4. **Process Killed by OS**
   - Check system logs
   - Verify resource limits
   - Check for OOM (Out of Memory) kills

## Best Practices

1. **Always use PM2 in production** - Provides automatic restarts and monitoring
2. **Monitor logs regularly** - Set up log rotation
3. **Set up alerts** - Get notified when server crashes
4. **Use health checks** - Monitor server availability
5. **Database connection pooling** - Already configured
6. **Graceful shutdown** - Already implemented
7. **Error handling** - All errors are logged

## Environment Variables

Ensure these are set in production:

```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-strong-secret
```

## Next Steps

1. **Install PM2**: `npm install -g pm2`
2. **Build the project**: `npm run build`
3. **Start with PM2**: `pm2 start ecosystem.config.js`
4. **Set up auto-start**: `pm2 startup` then `pm2 save`
5. **Monitor**: `pm2 monit`

