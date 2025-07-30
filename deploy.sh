#!/bin/bash

# JOTAR Website Deployment Script
# Deploy to Hostinger via FTP

echo "🚀 Starting JOTAR Website Deployment..."

# FTP Configuration
FTP_HOST="151.106.117.45"
FTP_USER="u359923617"
FTP_PASS="mantol01M!!"
FTP_REMOTE_DIR="."
LOCAL_DIR="."

# Create exclude file for lftp
cat > .ftpexclude << EOF
.git/
.github/
node_modules/
.DS_Store
Thumbs.db
*.log
.env
.env.local
deploy.sh
.ftpexclude
README.md
DEPLOYMENT_GUIDE.md
NOTES.txt
*.tar.gz
*.zip
EOF

echo "📁 Files to be uploaded:"
find . -type f ! -path './.git/*' ! -path './.github/*' ! -name '*.log' ! -name 'deploy.sh' ! -name '.ftpexclude' ! -name 'README.md' ! -name 'DEPLOYMENT_GUIDE.md' ! -name 'NOTES.txt' ! -name '*.tar.gz' ! -name '*.zip'

echo ""
echo "🔄 Connecting to FTP server..."

# Test connection first
lftp -c "
set ftp:ssl-allow no
set ftp:passive-mode on
set net:timeout 30
set net:max-retries 3
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
ls
quit
"

if [ $? -eq 0 ]; then
    echo "✅ FTP connection successful!"
    echo "🔄 Starting file upload..."
    
    # Upload files
    lftp -c "
    set ftp:ssl-allow no
    set ftp:passive-mode on
    set net:timeout 60
    set net:max-retries 5
    set net:reconnect-interval-base 5
    set net:reconnect-interval-max 10
    open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
    mirror --reverse --verbose --exclude-glob-from=.ftpexclude $LOCAL_DIR $FTP_REMOTE_DIR
    quit
    "
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment completed successfully!"
        echo "🌐 Your website should now be live!"
        echo ""
        echo "You can view your website at your domain."
        echo "Admin panel: your-domain.com/admin/"
    else
        echo "❌ Deployment failed during upload!"
        exit 1
    fi
else
    echo "❌ FTP connection failed!"
    echo "Please check your FTP credentials and server settings."
    exit 1
fi

# Cleanup
rm -f .ftpexclude

echo "🎉 Deployment process completed!"
