const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bjtjobxqqnngvponbuek.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdGpvYnhxcW5uZ3Zwb25idWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTU3NzgsImV4cCI6MjA2OTA5MTc3OH0.YNv7FmzZ2S02_fy8t7VggUEz6vR7jcgpzSDb45i1Um4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  try {
    // Get all voice notes
    const { data: voiceNotes, error } = await supabase
      .from('voice_notes')
      .select('id, audio_url, transcript, tldr_text, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log('Error:', error)
      return
    }
    
    console.log('Voice Notes found:', voiceNotes?.length || 0)
    if (voiceNotes && voiceNotes.length > 0) {
      voiceNotes.forEach((note, index) => {
        console.log(`${index + 1}. ${note.tldr_text || note.transcript?.substring(0, 50) + '...'}`)
        console.log(`   Audio URL: ${note.audio_url}`)
        console.log(`   Created: ${note.created_at}`)
        console.log('')
      })
    }
  } catch (err) {
    console.log('Connection error:', err.message)
  }
}

checkData()
