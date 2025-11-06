#!/bin/bash

###############################################################################
# DevTrack Africa - PWA Deployment Script
# Prepares and deploys the Progressive Web App
###############################################################################

set -e  # Exit on error

echo "🚀 DevTrack Africa - PWA Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check Node.js
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
print_success "Node.js $(node --version) detected"

# Check npm
print_status "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm $(npm --version) detected"

# Check for required files
print_status "Checking required PWA files..."

REQUIRED_FILES=(
    "public/service-worker.js"
    "public/site.webmanifest"
    "index.html"
    "components/PWAInstallPrompt.tsx"
    "components/PWAUpdatePrompt.tsx"
    "components/OfflineIndicator.tsx"
)

ALL_PRESENT=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file"
    else
        print_error "$file missing!"
        ALL_PRESENT=false
    fi
done

if [ "$ALL_PRESENT" = false ]; then
    print_error "Some required PWA files are missing. Please check the setup."
    exit 1
fi

# Check for icons
print_status "Checking PWA icons..."
ICON_FILES=(
    "public/favicon-16x16.png"
    "public/favicon-32x32.png"
    "public/apple-touch-icon.png"
)

OPTIONAL_ICONS=(
    "public/icon-192x192.png"
    "public/icon-512x512.png"
)

for icon in "${ICON_FILES[@]}"; do
    if [ -f "$icon" ]; then
        print_success "$icon"
    else
        print_warning "$icon missing (recommended)"
    fi
done

for icon in "${OPTIONAL_ICONS[@]}"; do
    if [ -f "$icon" ]; then
        print_success "$icon"
    else
        print_warning "$icon missing (will use default)"
    fi
done

# Install dependencies
print_status "Installing dependencies..."
npm install --legacy-peer-deps
print_success "Dependencies installed"

# Run tests (if available)
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    print_status "Running tests..."
    npm test -- --run 2>/dev/null || print_warning "Tests skipped or failed"
fi

# Build the app
print_status "Building production PWA..."
npm run build
print_success "Build completed"

# Verify build output
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_success "Build output verified in /dist"

# Check service worker in build
if [ -f "dist/service-worker.js" ]; then
    print_success "Service worker found in build"
else
    # Copy service worker if not in build
    if [ -f "public/service-worker.js" ]; then
        print_status "Copying service worker to build..."
        cp public/service-worker.js dist/
        print_success "Service worker copied"
    else
        print_error "Service worker not found!"
        exit 1
    fi
fi

# Validate manifest
if [ -f "dist/site.webmanifest" ]; then
    print_success "Manifest found in build"
else
    print_warning "Manifest not found in build output"
fi

# Display build size
print_status "Build size analysis:"
du -sh dist/ | awk '{print "  Total: " $1}'
echo ""

# Display deployment options
echo ""
echo "=========================================="
echo "📦 Build Complete! Ready for Deployment"
echo "=========================================="
echo ""
echo "Choose your deployment platform:"
echo ""
echo "1️⃣  Vercel (Recommended)"
echo "   $ vercel --prod"
echo ""
echo "2️⃣  Netlify"
echo "   $ netlify deploy --prod --dir=dist"
echo ""
echo "3️⃣  GitHub Pages"
echo "   $ npm run deploy:github"
echo ""
echo "4️⃣  Custom Server"
echo "   Upload /dist folder to your server"
echo ""

# Optional: Auto-deploy to Vercel
read -p "Deploy to Vercel now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod
        print_success "Deployed to Vercel!"
    else
        print_warning "Vercel CLI not found. Install with: npm i -g vercel"
        print_status "Run 'vercel --prod' after installing"
    fi
else
    print_status "Build ready in /dist folder"
    print_status "Deploy manually using your preferred platform"
fi

echo ""
print_success "PWA deployment preparation complete! 🎉"
echo ""
