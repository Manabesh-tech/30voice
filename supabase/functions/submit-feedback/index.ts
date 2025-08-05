Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        console.log('=== Feedback Submission Debug ===');
        
        const requestBody = await req.json();
        console.log('Request body received:', JSON.stringify(requestBody));
        
        const { name, email, feedbackType, message } = requestBody;

        // Validate required fields
        if (!name || !email || !feedbackType || !message) {
            const missingFields = [];
            if (!name) missingFields.push('name');
            if (!email) missingFields.push('email');
            if (!feedbackType) missingFields.push('feedbackType');
            if (!message) missingFields.push('message');
            
            const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
            console.error('Validation error:', errorMsg);
            throw new Error(errorMsg);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('Invalid email format:', email);
            throw new Error('Invalid email format');
        }

        // Validate feedback type
        const validTypes = ['general', 'bug', 'feature'];
        if (!validTypes.includes(feedbackType)) {
            console.error('Invalid feedback type:', feedbackType, 'Valid types:', validTypes);
            throw new Error(`Invalid feedback type: ${feedbackType}. Valid types: ${validTypes.join(', ')}`);
        }

        console.log('All validation passed');

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            console.error('Missing Supabase configuration');
            throw new Error('Supabase configuration missing');
        }

        console.log('Supabase config available');

        // Get user ID if authenticated (optional)
        let userId = null;
        const authHeader = req.headers.get('authorization');
        
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                console.log('Attempting to verify user token');
                
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                    console.log('User authenticated, ID:', userId);
                } else {
                    console.log('User token verification failed:', userResponse.status);
                }
            } catch (error) {
                console.log('User authentication error (non-blocking):', error.message);
            }
        } else {
            console.log('No auth header provided, submitting anonymous feedback');
        }

        // Insert feedback into database
        const feedbackData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            feedback_type: feedbackType,
            message: message.trim(),
            user_id: userId
        };

        console.log('Attempting to insert feedback data:', JSON.stringify(feedbackData));

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/feedback_submissions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(feedbackData)
        });

        console.log('Database insert response status:', insertResponse.status);

        if (!insertResponse.ok) {
            const insertError = await insertResponse.text();
            console.error('Database insert failed:', insertResponse.status, insertError);
            throw new Error(`Database insert failed (${insertResponse.status}): ${insertError}`);
        }

        const newFeedback = await insertResponse.json();
        console.log('Feedback inserted successfully:', newFeedback);

        // Log successful submission for monitoring
        console.log(`✅ Feedback submitted successfully: ${feedbackData.feedback_type} from ${feedbackData.email}`);

        return new Response(JSON.stringify({
            success: true,
            message: 'Feedback submitted successfully',
            feedback_id: newFeedback[0]?.id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Feedback submission error:', error.message);
        console.error('Error stack:', error.stack);

        return new Response(JSON.stringify({
            error: {
                code: 'SUBMISSION_FAILED',
                message: error.message
            }
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});