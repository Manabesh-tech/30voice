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
        const { voiceNoteId, voteType } = await req.json();

        if (!voiceNoteId || !voteType) {
            throw new Error('Voice note ID and vote type are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Authorization required');
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
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Check if user already voted
        const existingVoteResponse = await fetch(`${supabaseUrl}/rest/v1/voice_note_votes?user_id=eq.${userId}&voice_note_id=eq.${voiceNoteId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const existingVotes = await existingVoteResponse.json();
        const existingVote = existingVotes[0];

        let operation = 'add';
        let previousVoteType = null;

        if (existingVote) {
            if (existingVote.vote_type === voteType) {
                // Remove vote if same type
                operation = 'remove';
                previousVoteType = voteType;
            } else {
                // Update vote type
                operation = 'update';
                previousVoteType = existingVote.vote_type;
            }
        }

        // Handle vote operation
        if (operation === 'remove') {
            // Delete the vote
            await fetch(`${supabaseUrl}/rest/v1/voice_note_votes?id=eq.${existingVote.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
        } else if (operation === 'update') {
            // Update the vote type
            await fetch(`${supabaseUrl}/rest/v1/voice_note_votes?id=eq.${existingVote.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vote_type: voteType })
            });
        } else {
            // Add new vote
            await fetch(`${supabaseUrl}/rest/v1/voice_note_votes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    voice_note_id: voiceNoteId,
                    vote_type: voteType
                })
            });
        }

        // Update vote counts in voice_notes table
        const countField = `${voteType}_count`;
        
        // Get current counts
        const noteResponse = await fetch(`${supabaseUrl}/rest/v1/voice_notes?id=eq.${voiceNoteId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });
        
        const notes = await noteResponse.json();
        const note = notes[0];
        
        if (!note) {
            throw new Error('Voice note not found');
        }
        
        let updates = {};
        
        if (operation === 'remove') {
            updates[countField] = Math.max(0, (note[countField] || 0) - 1);
        } else if (operation === 'update') {
            const previousCountField = `${previousVoteType}_count`;
            updates[countField] = (note[countField] || 0) + 1;
            updates[previousCountField] = Math.max(0, (note[previousCountField] || 0) - 1);
        } else {
            updates[countField] = (note[countField] || 0) + 1;
        }
        
        // Update the voice note counts
        await fetch(`${supabaseUrl}/rest/v1/voice_notes?id=eq.${voiceNoteId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        return new Response(JSON.stringify({
            success: true,
            operation,
            voteType,
            previousVoteType
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Vote handling error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'VOTE_FAILED',
                message: error.message
            }
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});