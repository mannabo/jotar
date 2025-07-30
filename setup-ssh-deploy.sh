#!/bin/bash

echo "🔐 Setting up SSH-based deployment for JOTAR website"
echo "=================================================="

# 1. Generate SSH key for Hostinger
echo "1. Generating SSH key for Hostinger..."
ssh-keygen -t ed25519 -C "jotar-deploy@hostinger.com" -f ~/.ssh/id_ed25519_hostinger -N ""

echo ""
echo "2. Your Hostinger SSH public key (copy this to Hostinger cPanel):"
echo "================================================================="
cat ~/.ssh/id_ed25519_hostinger.pub
echo ""

# 3. Private key for GitHub secrets
echo "3. Your private key for GitHub Secrets (copy this to GitHub):"
echo "=============================================================="
echo "Secret name: HOSTINGER_SSH_KEY"
echo "Secret value:"
cat ~/.ssh/id_ed25519_hostinger
echo ""

# 4. Update SSH config
echo "4. Updating SSH config..."
cat >> ~/.ssh/config << EOF

# Hostinger
Host hostinger
  HostName YOUR_HOSTINGER_IP_OR_DOMAIN
  User YOUR_HOSTINGER_USERNAME
  IdentityFile ~/.ssh/id_ed25519_hostinger
  IdentitiesOnly yes
EOF

echo ""
echo "5. Testing GitHub SSH connection..."
ssh -T git@github.com

echo ""
echo "📋 GitHub Secrets you need to add:"
echo "=================================="
echo "Repository: https://github.com/mannabo/jotar"
echo "Go to: Settings → Secrets and Variables → Actions"
echo ""
echo "Add these secrets:"
echo "HOSTINGER_SSH_KEY = [Private key shown above]"
echo "HOSTINGER_HOST = [Your Hostinger server IP/domain]"
echo "HOSTINGER_USER = [Your Hostinger username]"  
echo "DOMAIN_NAME = [Your domain name]"
echo ""
echo "📝 Next steps:"
echo "1. Copy public key to Hostinger cPanel → SSH Keys"
echo "2. Add GitHub secrets as shown above"
echo "3. Test deployment: git push origin main"

echo ""
echo "🔧 Optional: Change Git remote to use SSH:"
echo "git remote set-url origin git@github.com:mannabo/jotar.git"
