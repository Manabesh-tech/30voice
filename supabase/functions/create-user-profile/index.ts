Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Extract user data from request
    const { userId, fullName } = await req.json()
    
    if (!userId || !fullName) {
      throw new Error('Missing userId or fullName')
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase credentials')
    }

    // Create user profile using the user's JWT token (which allows authenticated inserts)
    const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // Use the user's JWT token
        'apikey': anonKey
      },
      body: JSON.stringify({
        id: userId,
        full_name: fullName,
        role: 'Community Member',
        verified: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Profile creation failed:', response.status, errorText)
      
      // Handle duplicate key error gracefully
      if (response.status === 409 || errorText.includes('duplicate key')) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Profile already exists'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      throw new Error(`Profile creation failed: ${response.status} ${errorText}`)
    }

    const profileData = await response.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: profileData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Profile creation error:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Failed to create user profile'
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})