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
        const { audioData, fileName, title, description, tags } = await req.json();

        console.log('Voice note upload request:', { fileName, hasAudioData: !!audioData, title, description });

        if (!audioData || !fileName) {
            console.error('Missing required fields:', { audioData: !!audioData, fileName: !!fileName });
            throw new Error('Audio data and filename are required');
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

        // Extract base64 data from data URL
        const base64Data = audioData.split(',')[1];
        if (!base64Data) {
            throw new Error('Invalid audio data format');
        }

        const mimeType = audioData.split(';')[0].split(':')[1] || 'audio/webm';

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        console.log('Audio buffer size:', binaryData.length, 'mimeType:', mimeType);

        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFileName = `voice-note-${timestamp}-${fileName}`;

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/voice-notes/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload failed:', errorText);
            throw new Error(`Upload failed: ${errorText}`);
        }

        console.log('File uploaded successfully');

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/voice-notes/${uniqueFileName}`;

        // Estimate duration (basic estimation based on file size)
        const estimatedDuration = Math.max(5, Math.min(30, Math.floor(binaryData.length / 16000)));

        // Save voice note metadata to database
        const insertData = {
            user_id: userId,
            audio_url: publicUrl,
            duration: estimatedDuration,
            tldr_text: title || 'Quick Insight',
            action_text: description || 'New voice note shared',
            transcript: null,
            listen_count: 0,
            humourous_count: 0,
            informative_count: 0,
            game_changer_count: 0,
            useful_count: 0,
            thought_provoking_count: 0,
            debatable_count: 0,
            low_quality_count: 0,
            created_at: new Date().toISOString()
        };

        console.log('Inserting voice note data');

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/voice_notes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(insertData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            console.error('Database insert failed:', errorText);
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const voiceNoteData = await insertResponse.json();
        const voiceNote = voiceNoteData[0];
        console.log('Voice note created successfully:', voiceNote.id);

        // Add tags if provided
        if (tags && tags.length > 0) {
            console.log('Adding tags:', tags);
            for (const tag of tags) {
                try {
                    await fetch(`${supabaseUrl}/rest/v1/voice_note_tags`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            voice_note_id: voiceNote.id,
                            tag_name: tag.toLowerCase()
                        })
                    });
                } catch (tagError) {
                    console.warn('Failed to add tag:', tag, tagError);
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                voiceNote,
                publicUrl
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Voice note upload error:', error);

        const errorResponse = {
            error: {
                code: 'VOICE_NOTE_UPLOAD_FAILED',
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