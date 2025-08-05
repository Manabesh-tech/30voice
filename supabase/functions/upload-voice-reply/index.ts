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
        const { voiceNoteId, audioData, fileName, parentId = null } = await req.json();

        console.log('Voice reply upload request:', { voiceNoteId, fileName, hasParentId: !!parentId });

        if (!voiceNoteId || !audioData || !fileName) {
            console.error('Missing required fields:', { voiceNoteId: !!voiceNoteId, audioData: !!audioData, fileName: !!fileName });
            throw new Error('Voice note ID, audio data, and file name are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            console.error('Supabase configuration missing');
            throw new Error('Server configuration error');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            console.error('No authorization header');
            throw new Error('Authentication required');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            console.error('Invalid token, status:', userResponse.status);
            const errorText = await userResponse.text();
            console.error('Auth error:', errorText);
            throw new Error('Invalid authentication token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        console.log('User authenticated:', userId);

        // Convert base64 audio data to blob
        const base64Data = audioData.split(',')[1];
        if (!base64Data) {
            throw new Error('Invalid audio data format');
        }

        const audioBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        console.log('Audio buffer size:', audioBuffer.length);
        
        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFileName = `reply-${timestamp}-${fileName}`;
        
        // Upload audio file to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/voice-notes/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'audio/webm',
                'x-upsert': 'true'
            },
            body: audioBuffer
        });

        if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.text();
            console.error('File upload failed:', uploadError);
            throw new Error(`File upload failed: ${uploadError}`);
        }

        console.log('File uploaded successfully');

        // Generate public URL for the uploaded file
        const audioUrl = `${supabaseUrl}/storage/v1/object/public/voice-notes/${uniqueFileName}`;

        // Estimate duration (rough approximation for WebM)
        const estimatedDuration = Math.max(1, Math.min(30, Math.floor(audioBuffer.length / 16000)));

        // Create reply record in database with threading support
        const replyData = {
            voice_note_id: voiceNoteId,
            user_id: userId,
            parent_id: parentId, // Support for threaded replies
            content_type: 'voice',
            audio_url: audioUrl,
            duration: estimatedDuration,
            created_at: new Date().toISOString()
        };

        console.log('Inserting reply data:', replyData);

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/voice_note_replies`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(replyData)
        });

        if (!insertResponse.ok) {
            const insertError = await insertResponse.text();
            console.error('Database insert failed:', insertError);
            throw new Error(`Database insert failed: ${insertError}`);
        }

        const newReply = await insertResponse.json();
        console.log('Reply created successfully:', newReply[0]?.id);

        return new Response(JSON.stringify({
            success: true,
            data: {
                reply: newReply[0],
                audioUrl
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Voice reply upload error:', error);

        const errorResponse = {
            error: {
                code: 'VOICE_REPLY_UPLOAD_FAILED',
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