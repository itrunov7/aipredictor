#!/bin/bash

# SP500 Insights Platform Setup Script
# This script helps you set up the development environment

set -e

echo "🚀 SP500 Insights Platform Setup"
echo "=================================="

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if .env exists
if [ ! -f ".env" ]; then
    if [ -f "env.template" ]; then
        echo "📝 Creating .env file from template..."
        cp env.template .env
        echo "⚠️  Please edit .env file with your API keys before proceeding"
        echo "   Required: FMP_API_KEY, NEXTAUTH_SECRET, STRIPE keys"
        echo ""
        read -p "Press Enter when you've configured your .env file..."
    else
        echo "❌ env.template not found. Creating basic .env file..."
        cat > .env << EOF
# Add your API keys here
FMP_API_KEY=your_fmp_api_key_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
DATABASE_URL=file:./database.db
BACKEND_PORT=3001
NODE_ENV=development
EOF
        echo "⚠️  Please edit .env file with your actual API keys"
        exit 1
    fi
fi

echo "✅ Environment file configured"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "✅ Dependencies installed"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p backend/src/{controllers,middleware,routes,services,utils,database}
mkdir -p components/{ui,layout,features}
mkdir -p lib
mkdir -p utils
mkdir -p hooks
mkdir -p stores

echo "✅ Project structure created"

# Check if all required environment variables are set
echo "🔍 Checking environment configuration..."

if grep -q "your_fmp_api_key_here" .env; then
    echo "⚠️  FMP_API_KEY not configured in .env"
    MISSING_VARS=true
fi

if grep -q "your_random_secret_here" .env; then
    echo "⚠️  NEXTAUTH_SECRET not configured in .env"
    MISSING_VARS=true
fi

if [ "$MISSING_VARS" = true ]; then
    echo ""
    echo "🔧 Next Steps:"
    echo "1. Edit .env file with your actual API keys"
    echo "2. Get FMP API key: https://financialmodelingprep.com/developer/docs"
    echo "3. Generate NEXTAUTH_SECRET: openssl rand -base64 32"
    echo "4. Get Stripe test keys: https://dashboard.stripe.com/test/apikeys"
    echo "5. Run 'npm run dev' to start development servers"
else
    echo "✅ Environment configured correctly"
    echo ""
    echo "🎉 Setup complete! You can now run:"
    echo "   npm run dev    # Start development servers"
    echo "   npm run build  # Build for production"
    echo ""
    echo "📖 Documentation: README.md"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:3001"
fi

echo ""
echo "📋 Quick Commands:"
echo "   npm run dev:frontend   # Start Next.js frontend only"
echo "   npm run dev:backend    # Start Express backend only"
echo "   npm run migrate        # Run database migrations"
echo "   npm run lint           # Run linting"
echo ""
echo "Need help? Check the README.md file or create an issue on GitHub." 