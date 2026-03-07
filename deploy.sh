#!/bin/bash
# ==============================================================================
# TubeX Automated Production Deployment Script (Ubuntu/Debian VPS)
# Run this on your VPS as root: chmod +x deploy.sh && ./deploy.sh
# ==============================================================================

# SET YOUR DOMAIN HERE BEFORE RUNNING:
DOMAIN_NAME="yourdomain.com"
APP_DIR="/var/www/tube-site"

echo "===================================================="
echo "🚀 Starting Full Stack TubeX Deployment for $DOMAIN_NAME"
echo "===================================================="

# 1. System Updates & Essential Packages
echo "📦 Updating system and installing Nginx, Git, and generic tools..."
apt update -y && apt upgrade -y
apt install -y nginx git curl unzip ufw certbot python3-certbot-nginx

# 2. Install Node.js (v20) & PM2
echo "🟢 Installing Node.js & Process Manager (PM2)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
npm install -g pm2

# 3. Setup UFW Firewall
echo "🛡️ Configuring UFW Firewall for HTTP/HTTPS/SSH..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
# ufw enable (Skipping auto-enable to avoid locking user out if SSH fails)

# 4. Prepare Nginx Reverse Proxy Configuration
echo "🌐 Configuring Nginx for $DOMAIN_NAME -> Port 3000..."
cat <<EOF > /etc/nginx/sites-available/tubex
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Cloudflare Forwarding Headers
        proxy_set_header X-Real-IP \$http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the Nginx site and disable the default one
ln -sf /etc/nginx/sites-available/tubex /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

# 5. Build and Launch the Application
echo "⚙️ Installing dependencies and building Next.js Production App..."
cd $APP_DIR || { echo "Directory $APP_DIR not found. Exiting."; exit 1; }

# Install packages
npm install

# Generate Prisma Client (Assumes .env is already manually created)
if [ ! -f ".env" ]; then
    echo "⚠️ Warning: .env file not found. Make sure to create it with your PostgreSQL DATABASE_URL before starting."
fi
npx prisma generate

# Build the app
npm run build

# 6. Start / Restart PM2
echo "🔄 Starting Next.js app on PM2 cluster..."
pm2 delete tubex 2>/dev/null || true
pm2 start npm --name "tubex" -- start

# Save PM2 state to resurrect on VPS reboot
pm2 startup systemd -u root --hp /root | tail -n 1 | bash
pm2 save

echo "===================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "Next Steps:"
echo "1. Go to Cloudflare and point your Domain A-Record to $(curl -sS ifconfig.me)"
echo "2. Once Cloudflare is connected, run this command to get your FREE SSL Certificate:"
echo "   certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
echo "===================================================="
