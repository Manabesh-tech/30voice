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
        const requestBody = await req.json();
        console.log('Listen count request body:', requestBody);
        
        // Support both formats: {voiceNoteId} and {voice_note_id}
        const voiceNoteId = requestBody.voiceNoteId || requestBody.voice_note_id;
        const sessionId = requestBody.sessionId || requestBody.session_id || crypto.randomUUID();

        if (!voiceNoteId) {
            console.error('Missing voice note ID:', requestBody);
            throw new Error('Voice note ID is required');
        }

        console.log('Processing listen count for voice note:', voiceNoteId);

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            console.error('Supabase configuration missing');
            throw new Error('Server configuration error');
        }

        // Get user ID if authenticated
        let userId = null;
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                    console.log('User identified:', userId);
                }
            } catch (e) {
                console.log('Could not get user ID:', e.message);
            }
        }

        // Get client IP
        const forwardedFor = req.headers.get('x-forwarded-for');
        const realIp = req.headers.get('x-real-ip');
        const clientIp = forwardedFor ? forwardedFor.split(',')[0] : realIp || 'unknown';

        console.log('Client info - IP:', clientIp, 'Session:', sessionId, 'User:', userId);

        // Simple approach: just increment the listen count without complex duplicate checking
        // This ensures the function always succeeds and provides user feedback
        
        try {
            // Get current voice note
            const noteResponse = await fetch(`${supabaseUrl}/rest/v1/voice_notes?id=eq.${voiceNoteId}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
            
            if (!noteResponse.ok) {
                const errorText = await noteResponse.text();
                throw new Error(`Failed to fetch voice note: ${errorText}`);
            }
            
            const notes = await noteResponse.json();
            const note = notes?.[0];
            
            if (!note) {
                throw new Error('Voice note not found');
            }

            console.log('Found voice note, current listen count:', note.listen_count);
            
            // Update listen count
            const newListenCount = (note.listen_count || 0) + 1;
            
            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/voice_notes?id=eq.${voiceNoteId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ listen_count: newListenCount })
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`Failed to update listen count: ${errorText}`);
            }

            console.log('Successfully incremented listen count to:', newListenCount);
            
            // Optional: Record the listen event for analytics (non-blocking)
            try {
                await fetch(`${supabaseUrl}/rest/v1/listen_counts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        voice_note_id: voiceNoteId,
                        user_id: userId,
                        ip_address: clientIp,
                        session_id: sessionId,
                        created_at: new Date().toISOString()
                    })
                });
                console.log('Listen event recorded');
            } catch (recordError) {
                console.warn('Could not record listen event:', recordError.message);
                // Don't fail the main operation
            }

            return new Response(JSON.stringify({
                success: true,
                data: {
                    newListenCount,
                    voiceNoteId
                }
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } catch (dbError) {
            console.error('Database operation error:', dbError);
            throw dbError;
        }

    } catch (error) {
        console.error('Listen count increment error:', error);

        const errorResponse = {
            error: {
                code: 'LISTEN_COUNT_FAILED',
                message: error.message || 'Unknown error occurred',
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});