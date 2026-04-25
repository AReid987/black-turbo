#!/bin/bash

# Shadowbroker Covert Deployment Setup Script

echo "🕵️ Shadowbroker Covert Deployment Setup"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env

    # Generate random keys
    SECRET_KEY=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 16)

    # Update .env with generated keys
    sed -i.bak "s/your-secret-key-here-change-this/$SECRET_KEY/" .env
    sed -i.bak "s/your-32-character-encryption-key-here/$ENCRYPTION_KEY/" .env
    rm .env.bak

    echo "✅ .env file created with secure random keys"
    echo "🔐 SECRET_KEY: $SECRET_KEY"
    echo "🔐 ENCRYPTION_KEY: $ENCRYPTION_KEY"
    echo ""
    echo "⚠️  IMPORTANT: Save these keys securely! You'll need the SECRET_KEY to create access keys for users."
else
    echo "ℹ️  .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create logs directory
mkdir -p logs

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update .env file if needed"
echo "2. Run 'npm run dev' to test locally"
echo "3. Deploy to Vercel using 'vercel deploy'"
echo ""
echo "🔐 To grant access to users, share the SECRET_KEY from your .env file"
echo "   Users will enter this key in the hidden authentication interface"