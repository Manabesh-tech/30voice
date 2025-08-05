# Supabase Production Configuration for 30voice.com

## 🔧 Required Supabase Updates

### 1. Update Site URL
1. **Login to Supabase Dashboard**
2. **Go to Project Settings → Authentication**
3. **Update Site URL**:
   - Current: `https://yjlviizzs90x.space.minimax.io`
   - **Change to**: `https://30voice.com`

### 2. Add Redirect URLs
In Authentication → URL Configuration, add:
- `https://30voice.com`
- `https://www.30voice.com` 
- `http://30voice.com` (for fallback)

### 3. Update CORS Origins
In Project Settings → API:
- **Add to allowed origins**: `https://30voice.com`
- **Add**: `https://www.30voice.com`

## 🔑 Current Database Connection
Your app is configured to use:
- **Database**: `bjtjobxqqnngvponbuek.supabase.co`
- **All data preserved**: ✅
- **Authentication working**: ✅

## ⚡ No Code Changes Needed
The production build already has the correct Supabase configuration embedded.

## 📋 Post-Deployment Checklist
After uploading to GoDaddy:
1. [ ] Update Supabase Site URL to 30voice.com
2. [ ] Add CORS origins in Supabase
3. [ ] Test authentication flows
4. [ ] Test voice recording
5. [ ] Test audio playback
6. [ ] Verify all existing content loads

## 🚨 Important Notes
- **Don't change the Supabase project** - all your data is there
- **Only update the allowed URLs** in Supabase settings
- **Keep the same API keys** - they're already in the code
