# ThirtyVoice Production Deployment Guide

## 🚀 Production Build Ready
Your ThirtyVoice application is ready for production deployment to **30voice.com**

## 📦 Production Files Location
```
/workspace/thirtyvoice-unified-auth/dist/
├── index.html
└── assets/
    ├── index-STcgSuws.css
    └── index-jYZvQKuY.js
```

## 🔧 GoDaddy Hosting Setup

### Option 1: GoDaddy Web Hosting (Recommended)
1. **Access your GoDaddy cPanel or File Manager**
2. **Navigate to public_html folder**
3. **Upload all files from the dist/ folder**:
   - Upload `index.html` to the root of public_html
   - Create an `assets` folder in public_html
   - Upload both CSS and JS files to the assets folder

### Option 2: GoDaddy Website Builder (Alternative)
If you're using GoDaddy's website builder, you'll need to:
1. Export your current hosting to traditional hosting
2. Follow Option 1 above

## 🌐 DNS Configuration

### Current Domain Setup
Your domain **30voice.com** should point to GoDaddy hosting by default.

### If using external hosting:
1. **Update DNS A Record**: Point to your hosting provider's IP
2. **Update CNAME**: Set www to point to your domain

## 📋 File Upload Instructions

### Step-by-Step Upload:
1. **Login to GoDaddy hosting control panel**
2. **Open File Manager**
3. **Navigate to public_html**
4. **Delete any existing index.html**
5. **Upload new files**:
   ```
   public_html/
   ├── index.html          ← Upload this
   └── assets/             ← Create this folder
       ├── index-STcgSuws.css  ← Upload this
       └── index-jYZvQKuY.js   ← Upload this
   ```

## ✅ Post-Deployment Checklist

After uploading files, test:
- [ ] Visit http://30voice.com (should load homepage)
- [ ] Visit https://30voice.com (should have SSL)
- [ ] Test voice recording functionality
- [ ] Test authentication (login/signup)
- [ ] Test audio playback
- [ ] Test mobile responsiveness

## 🔒 SSL Certificate
GoDaddy should provide free SSL. If not working:
1. **Enable SSL in GoDaddy panel**
2. **Force HTTPS redirects**
3. **Update security settings**

## 🐛 Common Issues & Solutions

### Issue: "Site Not Loading"
- **Check**: Files uploaded to correct directory (public_html)
- **Check**: index.html is in root, not in subfolder

### Issue: "Assets Not Loading"
- **Check**: assets folder structure is correct
- **Check**: CSS/JS files have correct names

### Issue: "Supabase Connection Error"
- **Check**: Domain is whitelisted in Supabase project settings
- **Add**: 30voice.com to allowed origins

## 📞 Need Help?
If you encounter issues:
1. **Check GoDaddy hosting status**
2. **Verify file permissions (755 for folders, 644 for files)**
3. **Clear browser cache**
4. **Check browser console for errors**

## 🎯 Production URL
Once deployed: **https://30voice.com**
