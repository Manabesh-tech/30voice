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
        const { voiceNoteId } = await req.json();

        console.log('Delete voice note request:', { voiceNoteId });

        if (!voiceNoteId) {
            console.error('Missing voice note ID');
            throw new Error('Voice note ID is required');
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

        // First, verify the user owns this voice note
        const noteResponse = await fetch(`${supabaseUrl}/rest/v1/voice_notes?id=eq.${voiceNoteId}&user_id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!noteResponse.ok) {
            const errorText = await noteResponse.text();
            console.error('Failed to fetch voice note:', errorText);
            throw new Error('Failed to verify ownership');
        }

        const notes = await noteResponse.json();
        
        if (!notes || notes.length === 0) {
            console.error('Voice note not found or user does not own it');
            throw new Error('Voice note not found or you do not have permission to delete it');
        }

        console.log('Voice note ownership verified, proceeding with soft delete');

        // Perform soft delete by setting is_deleted = true
        const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/voice_notes?id=eq.${voiceNoteId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                is_deleted: true,
                deleted_at: new Date().toISOString()
            })
        });

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error('Failed to delete voice note:', deleteResponse.status, errorText);
            
            // More specific error messages based on status code
            if (deleteResponse.status === 403) {
                throw new Error('You do not have permission to delete this voice note');
            } else if (deleteResponse.status === 404) {
                throw new Error('Voice note not found');
            } else {
                throw new Error(`Failed to delete voice note: ${deleteResponse.status} ${errorText}`);
            }
        }

        console.log('Voice note soft deleted successfully');

        // Also soft delete all replies to this voice note
        try {
            const deleteRepliesResponse = await fetch(`${supabaseUrl}/rest/v1/voice_note_replies?voice_note_id=eq.${voiceNoteId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    is_deleted: true,
                    deleted_at: new Date().toISOString()
                })
            });

            if (deleteRepliesResponse.ok) {
                console.log('Associated replies also soft deleted');
            } else {
                const replyErrorText = await deleteRepliesResponse.text();
                console.warn('Could not delete associated replies:', deleteRepliesResponse.status, replyErrorText);
            }
        } catch (replyError) {
            console.warn('Error deleting replies:', replyError.message);
            // Don't fail the main operation
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                voiceNoteId,
                message: 'Voice note deleted successfully'
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete voice note error:', error);

        const errorResponse = {
            error: {
                code: 'DELETE_VOICE_NOTE_FAILED',
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