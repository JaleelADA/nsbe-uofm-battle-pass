#!/bin/bash

echo "🧪 NSBE Battle Pass Mobile - Structure Validation"
echo "================================================"

echo ""
echo "📁 Checking directory structure..."
if [ -d "src/components" ] && [ -d "src/services" ] && [ -d "src/styles" ] && [ -d "src/utils" ]; then
    echo "✅ All required directories exist"
else
    echo "❌ Missing required directories"
    exit 1
fi

echo ""
echo "📄 Checking core files..."
required_files=(
    "package.json"
    "index.js" 
    "app.json"
    "babel.config.js"
    "metro.config.js"
    "src/App.js"
    "src/components/UserStats.js"
    "src/components/Leaderboard.js"
    "src/components/Events.js"
    "src/components/Announcements.js"
    "src/components/Badges.js"
    "src/services/googleSheetsService.js"
    "src/styles/theme.js"
    "src/utils/staticData.js"
    "README.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done

echo ""
echo "⚙️ Checking JavaScript syntax..."
js_files=(
    "src/App.js"
    "src/components/UserStats.js"
    "src/components/Leaderboard.js"
    "src/components/Events.js"
    "src/components/Announcements.js"
    "src/components/Badges.js"
    "src/services/googleSheetsService.js"
    "src/styles/theme.js"
    "src/utils/staticData.js"
)

for file in "${js_files[@]}"; do
    if node -c "$file" 2>/dev/null; then
        echo "✅ $file syntax OK"
    else
        echo "❌ Syntax error in: $file"
        exit 1
    fi
done

echo ""
echo "📱 Checking React Native configuration..."
if grep -q "react-native" package.json; then
    echo "✅ React Native dependency configured"
else
    echo "❌ React Native dependency missing"
    exit 1
fi

if [ -f "metro.config.js" ] && [ -f "babel.config.js" ]; then
    echo "✅ Metro and Babel configured"
else
    echo "❌ Missing Metro or Babel configuration"
    exit 1
fi

echo ""
echo "🎯 Checking key features..."

# Check if leaderboard has search functionality
if grep -q "searchUser" src/components/Leaderboard.js; then
    echo "✅ Leaderboard search functionality implemented"
else
    echo "❌ Leaderboard search missing"
    exit 1
fi

# Check if Google Sheets integration exists
if grep -q "fetchFullLeaderboard" src/services/googleSheetsService.js; then
    echo "✅ Google Sheets integration implemented"
else
    echo "❌ Google Sheets integration missing"
    exit 1
fi

# Check mobile-specific components
if grep -q "ScrollView" src/App.js && grep -q "TouchableOpacity" src/components/Announcements.js; then
    echo "✅ Mobile-optimized components used"
else
    echo "❌ Missing mobile-optimized components"
    exit 1
fi

echo ""
echo "🏆 All checks passed! React Native mobile app is ready."
echo ""
echo "📋 Next steps:"
echo "   1. npm install (already completed)"
echo "   2. Setup iOS/Android development environment"
echo "   3. npm run ios / npm run android"
echo ""