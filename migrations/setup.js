const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase environment variables.');
  console.log('Make sure you have .env.local file with the following variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create a Supabase client with admin privileges
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Get all SQL files in the migrations folder
    const migrationsDir = path.join(__dirname);
    const sqlFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure files are processed in correct order (00_, 01_, etc.)
      
    console.log(`Found ${sqlFiles.length} migration file(s).`);
    console.log('-----------------------------------------------');
    console.log('IMPORTANT: The automated setup has limitations.');
    console.log('You will need to manually run these SQL files in');
    console.log('the Supabase SQL Editor in the following order:');
    
    for (const file of sqlFiles) {
      console.log(`- ${file}`);
    }
    
    console.log('-----------------------------------------------');
    console.log('Opening each file to show its content:');
    
    // Display the content of each file for easy copying
    for (const file of sqlFiles) {
      console.log(`\n========== FILE: ${file} ==========`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(sqlContent);
      console.log('==============================\n');
    }
    
    console.log('Please copy each file content and execute it in the');
    console.log('Supabase SQL Editor (https://app.supabase.com) in the order shown above.');
    
    console.log('\nOnce done, you can use the admin user with:');
    console.log('- Email: codemaxon@gmail.com');
    console.log('- Password: admin123');
    
  } catch (error) {
    console.error('Error reading migration files:', error);
    process.exit(1);
  }
}

runMigrations();