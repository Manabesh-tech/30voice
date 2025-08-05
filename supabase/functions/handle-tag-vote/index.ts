Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase configuration missing');
    }

    // Verify the user token
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

    // Get request body
    const requestData = await req.json();
    const { tagName, voiceNoteId } = requestData;

    if (!tagName || !voiceNoteId) {
      throw new Error('Tag name and voice note ID are required');
    }

    // First, ensure the tag exists for this voice note
    const tagCheckResponse = await fetch(
      `${supabaseUrl}/rest/v1/voice_note_tags?voice_note_id=eq.${voiceNoteId}&tag_name=eq.${tagName}&select=id`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!tagCheckResponse.ok) {
      throw new Error('Failed to check tag existence');
    }

    const tagData = await tagCheckResponse.json();
    let tagId;

    if (tagData.length === 0) {
      // Create the tag if it doesn't exist
      const createTagResponse = await fetch(`${supabaseUrl}/rest/v1/voice_note_tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          voice_note_id: voiceNoteId,
          tag_name: tagName
        })
      });

      if (!createTagResponse.ok) {
        throw new Error('Failed to create tag');
      }

      const newTagData = await createTagResponse.json();
      tagId = newTagData[0].id;
    } else {
      tagId = tagData[0].id;
    }

    // Check if user has already voted for this tag
    const existingVoteResponse = await fetch(
      `${supabaseUrl}/rest/v1/tag_votes?user_id=eq.${userId}&tag_id=eq.${tagId}`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!existingVoteResponse.ok) {
      throw new Error('Failed to check existing vote');
    }

    const existingVotes = await existingVoteResponse.json();

    if (existingVotes.length > 0) {
      // User has already voted, remove the vote (toggle)
      const deleteResponse = await fetch(
        `${supabaseUrl}/rest/v1/tag_votes?user_id=eq.${userId}&tag_id=eq.${tagId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!deleteResponse.ok) {
        throw new Error('Failed to remove vote');
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'removed',
        message: 'Vote removed successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // User hasn't voted, add the vote
      const voteResponse = await fetch(`${supabaseUrl}/rest/v1/tag_votes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          tag_id: tagId
        })
      });

      if (!voteResponse.ok) {
        const errorText = await voteResponse.text();
        if (errorText.includes('duplicate') || errorText.includes('unique')) {
          return new Response(JSON.stringify({
            success: false,
            action: 'duplicate',
            message: 'You have already voted for this tag'
          }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw new Error('Failed to record vote');
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'added',
        message: 'Vote recorded successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Tag vote error:', error);

    const errorResponse = {
      error: {
        code: 'TAG_VOTE_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});