# JOTAR Website

Official website for JOHOR TANGKAK AGROPRENEUR ROOTS ORGANIZATION (JOTAR) - an NGO dedicated to empowering agricultural communities through innovation and sustainable practices.

## 🌱 About JOTAR

JOTAR is a non-governmental organization focused on transforming agricultural communities through:
- Modern farming training with IoT and AI technologies
- Young agropreneurs mentorship programs
- Digital agricultural marketing
- Green community initiatives
- Agricultural innovation hub

## 🚀 Auto Deployment

This website is configured with **automatic deployment to Hostinger** using GitHub Actions.

### How it works:
1. Push changes to `main` branch
2. GitHub Actions automatically deploys to Hostinger via FTP
3. Website updates live within minutes

### Deployment Setup:
- **Workflow**: `.github/workflows/deploy.yml`
- **Trigger**: Push to `main` branch
- **Method**: FTP deployment using SamKirkland/FTP-Deploy-Action
- **Target**: `/public_html/` directory on Hostinger

### Required GitHub Secrets:
```
FTP_SERVER: your-hostinger-ftp-server
FTP_USERNAME: your-ftp-username
FTP_PASSWORD: your-ftp-password
```

## 💻 Development

### Local Development:
1. Clone the repository
2. Open `index.html` in browser
3. Make changes to HTML/CSS/JS files
4. Commit and push to trigger auto deployment

### File Structure:
```
├── index.html          # Main website
├── styles.css          # Stylesheet
├── script.js           # JavaScript
├── images/             # Website images
├── landingpages-kursus/# Course landing pages
└── .github/workflows/  # Auto deployment config
```

## 📱 Features

- **Responsive Design**: Mobile-friendly layout
- **Modern UI**: Clean, professional design
- **Programs Showcase**: Detailed program information
- **Contact Form**: Get in touch functionality
- **Community Section**: Join our community
- **Auto Deploy**: Instant updates on push

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Icons**: Font Awesome 6.0
- **Deployment**: GitHub Actions + FTP
- **Hosting**: Hostinger

## 📞 Contact

**Organization**: JOHOR TANGKAK AGROPRENEUR ROOTS ORGANIZATION  
**Registration**: PPM014-01-02012022  
**Address**: No. 23, Jalan Gambir 1, Bandar Baru Bukit Gambir, 84800 Tangkak, Johor  
**Email**: jotar.johor@gmail.com  
**Phone**: +6019-701 0010, +6014-616 8216, +6018-262 8007

## 📄 License

© 2025 JOTAR. All rights reserved.

---

### Quick Deploy Commands:
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Website will auto-update on Hostinger! 🚀
# Test deployment to jotarjohor.com
# Final deployment - all features complete Thu Jul 31 05:45:24 +08 2025
