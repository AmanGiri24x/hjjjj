require('dotenv').config();

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
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
    // Test basic connection using fetch
    console.log('🔗 Testing REST API connection...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ Supabase REST API connection successful!');
      
      // Try to create a simple table
      console.log('\n🏗️  Testing table creation...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS test_connection (
          id SERIAL PRIMARY KEY,
          message TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;
      
      const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: createTableSQL })
      });
      
      if (sqlResponse.ok) {
        console.log('✅ Table creation successful!');
        
        // Test inserting data
        console.log('\n📝 Testing data insertion...');
        
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/test_connection`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            message: 'DhanAillytics database test successful!'
          })
        });
        
        if (insertResponse.ok) {
          const insertedData = await insertResponse.json();
          console.log('✅ Data insertion successful!');
          console.log('Inserted data:', insertedData);
          
          console.log('\n🎉 ALL TESTS PASSED! Your Supabase database is ready!');
        } else {
          console.log('⚠️  Data insertion failed:', await insertResponse.text());
        }
      } else {
        console.log('⚠️  Table creation failed:', await sqlResponse.text());
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Connection failed:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log('Error:', error.message);
  }
}

// Run the test
testSupabaseConnection();
