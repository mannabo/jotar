# JOTAR Website Deployment Guide - Hostinger

## Files Yang Perlu Di Upload

### Main Files (Root Directory):
✅ **index.html** - Main website file
✅ **styles.css** - All styling
✅ **script.js** - JavaScript functionality  
✅ **jotar-logo.png** - Logo file
✅ **logo.jpg** - Backup logo (optional)

### Images Folder:
✅ **hero-farming-new.jpg** - Hero section image
✅ **about-team.jpg** - About section image  
✅ **community.jpg** - Community section image

## Steps Untuk Deploy ke Hostinger:

### 1. Login ke Hostinger Control Panel
- Go to: https://www.hostinger.com
- Login ke account awak
- Pilih domain/website yang nak upload

### 2. Access File Manager
- Dalam control panel, cari "File Manager"
- Atau guna FTP client like FileZilla

### 3. Upload Files
- Navigate ke folder `public_html` (root directory website)
- Upload semua files:
  - index.html
  - styles.css  
  - script.js
  - jotar-logo.png
  
### 4. Create Images Folder
- Dalam `public_html`, create folder bernama `images`
- Upload images ke dalam folder ni:
  - hero-farming-new.jpg
  - about-team.jpg
  - community.jpg

### 5. Set File Permissions
- Ensure semua files ada read permissions (644)
- Folders perlu 755 permissions

### 6. Test Website
- Visit domain awak untuk test
- Check semua images load properly
- Test responsive design pada mobile/tablet
- Test navigation dan contact form

## Important Notes:

⚠️ **File Paths**: Pastikan image paths dalam HTML correct:
- Logo: `jotar-logo.png` (root directory)
- Hero image: `images/hero-farming-new.jpg`
- About image: `images/about-team.jpg`  
- Community image: `images/community.jpg`

⚠️ **File Names**: Case sensitive! Pastikan exact spelling

⚠️ **Font Awesome**: Uses CDN link, so internet required

## Contact Form Setup (Optional):
- Contact form currently frontend only
- Untuk functioning form, perlu setup PHP backend
- Or integrate dengan service like Formspree/Netlify Forms

## Performance Tips:
- Images dah optimized size
- CSS dan JS combined dalam single files
- Uses modern CSS features untuk best performance

## Domain Structure Selepas Upload:
```
public_html/
├── index.html
├── styles.css
├── script.js
├── jotar-logo.png
└── images/
    ├── hero-farming-new.jpg
    ├── about-team.jpg
    └── community.jpg
```

Website akan accessible di: https://yourdomain.com

🎯 **Ready untuk deployment!**
