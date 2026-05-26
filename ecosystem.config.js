// PM2 ecosystem configuration for process management
// Install PM2: npm install -g pm2
// Start: pm2 start ecosystem.config.js
// Monitor: pm2 monit
// Logs: pm2 logs
// Restart: pm2 restart all

module.exports = {
  apps: [{
    name: 'afristream-backend',
    script: './dist/server.js',
    instances: 1, // Use 1 for now, can scale later
    exec_mode: 'fork',
    watch: false, // Set to true for development auto-restart
    max_memory_restart: '500M', // Restart if memory exceeds 500MB
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Auto-restart on crash
    autorestart: true,
    // Restart delay
    restart_delay: 4000,
    // Max restarts in 10 seconds
    max_restarts: 10,
    min_uptime: '10s',
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Advanced settings
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    // Health monitoring
    health_check_grace_period: 3000
  }]
};

