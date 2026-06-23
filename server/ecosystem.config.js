/**
 * PM2 Ecosystem Config — 1ai-Affiliate
 * Usage: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: '1ai-affiliate',
      script: 'app.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Restart policy
      max_restarts: 10,
      restart_delay: 3000,
      min_uptime: '10s',
      max_memory_restart: '256M',

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '../logs/affiliate-error.log',
      out_file: '../logs/affiliate-out.log',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Watch (disabled in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'tests'],
    },
  ],
};
