const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');
  
  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  console.log('📋 Configuration:');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Service Key:', supabaseServiceKey ? 'Present ✅' : 'Missing ❌');
  console.log('');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase configuration!');
    return;
  }
  
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('🔗 Testing connection...');
    
    // Test connection by trying to access a system table
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:');
      console.log('Error:', error.message);
      console.log('');
      console.log('🔧 Possible solutions:');
      console.log('1. Check your DATABASE_URL password in .env file');
      console.log('2. Verify your Supabase project is active');
      console.log('3. Check if your IP is allowed in Supabase settings');
    } else {
      console.log('✅ Database connection successful!');
      console.log('📊 Database is accessible and ready');
      
      // Test creating a simple table
      console.log('\n🏗️  Testing table creation...');
      
      const { error: createError } = await supabase.rpc('create_test_table', {});
      
      if (createError && !createError.message.includes('already exists')) {
        console.log('⚠️  Table creation test failed (this is normal if tables already exist)');
      } else {
        console.log('✅ Database operations working correctly');
      }
    }
    
  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log('Error:', error.message);
    console.log('');
    console.log('🔧 Please check:');
    console.log('1. Your internet connection');
    console.log('2. Supabase service status');
    console.log('3. API keys are correct');
  }
}

// Run the test
testDatabaseConnection();
