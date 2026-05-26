// Simple test script to check if the server can start
const { config } = require('dotenv');

// Load environment variables
config();

console.log('🔍 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');

// Test if we can import the main modules
try {
  console.log('\n🔄 Testing imports...');
  
  // Test database connection
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'afristream_db',
    connectionLimit: 1,
  });
  
  console.log('✅ MySQL2 imported successfully');
  
  // Test connection
  pool.getConnection()
    .then(connection => {
      console.log('✅ Database connection successful');
      connection.release();
      pool.end();
    })
    .catch(error => {
      console.log('❌ Database connection failed:', error.message);
      process.exit(1);
    });
    
} catch (error) {
  console.log('❌ Import failed:', error.message);
  process.exit(1);
}
