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
        const { replyId } = await req.json();

        console.log('Delete voice reply request:', { replyId });

        if (!replyId) {
            console.error('Missing reply ID');
            throw new Error('Reply ID is required');
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

        // First, verify the user owns this reply
        const replyResponse = await fetch(`${supabaseUrl}/rest/v1/voice_note_replies?id=eq.${replyId}&user_id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!replyResponse.ok) {
            const errorText = await replyResponse.text();
            console.error('Failed to fetch reply:', errorText);
            throw new Error('Failed to verify ownership');
        }

        const replies = await replyResponse.json();
        
        if (!replies || replies.length === 0) {
            console.error('Reply not found or user does not own it');
            throw new Error('Reply not found or you do not have permission to delete it');
        }

        console.log('Reply ownership verified, proceeding with soft delete');

        // Perform soft delete by setting is_deleted = true
        const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/voice_note_replies?id=eq.${replyId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_deleted: true,
                deleted_at: new Date().toISOString()
            })
        });

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error('Failed to delete reply:', errorText);
            throw new Error('Failed to delete reply');
        }

        console.log('Reply soft deleted successfully');

        // Also soft delete all child replies to this reply (threaded replies)
        try {
            const deleteChildRepliesResponse = await fetch(`${supabaseUrl}/rest/v1/voice_note_replies?parent_id=eq.${replyId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_deleted: true,
                    deleted_at: new Date().toISOString()
                })
            });

            if (deleteChildRepliesResponse.ok) {
                console.log('Child replies also soft deleted');
            } else {
                console.warn('Could not delete child replies, but main reply deleted');
            }
        } catch (childError) {
            console.warn('Error deleting child replies:', childError.message);
            // Don't fail the main operation
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                replyId,
                message: 'Reply deleted successfully'
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete voice reply error:', error);

        const errorResponse = {
            error: {
                code: 'DELETE_VOICE_REPLY_FAILED',
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