#!/bin/bash

# Audio File Acquisition Script
# This script helps you download and set up notification sounds for the Pomodoro timer

echo "=================================="
echo "Pomodoro Timer - Audio File Setup"
echo "=================================="
echo ""

PROJECT_ROOT="/Users/vitaliibekshnev/Source/Personal/pomodoro"
SOUNDS_DIR="$PROJECT_ROOT/public/sounds"

echo "This script will guide you through acquiring audio files."
echo ""
echo "OPTION 1: Download from Pixabay (Recommended)"
echo "----------------------------------------------"
echo "1. Open your browser and visit:"
echo "   https://pixabay.com/sound-effects/search/notification/"
echo ""
echo "2. For FOCUS COMPLETE sound, search for: 'success notification'"
echo "   - Look for upbeat, celebratory sounds (1-3 seconds)"
echo "   - Download as MP3"
echo "   - Save to your Downloads folder"
echo ""
echo "3. For BREAK COMPLETE sound, search for: 'gentle bell'"
echo "   - Look for calm, soothing sounds (1-3 seconds)"
echo "   - Download as MP3"
echo "   - Save to your Downloads folder"
echo ""
echo "4. After downloading, run:"
echo "   cp ~/Downloads/[focus-sound].mp3 $SOUNDS_DIR/focus-complete.mp3"
echo "   cp ~/Downloads/[break-sound].mp3 $SOUNDS_DIR/break-complete.mp3"
echo ""
echo "=================================="
echo ""
echo "OPTION 2: Use Freesound.org"
echo "----------------------------"
echo "1. Visit: https://freesound.org"
echo "2. Filter by License: CC0 (Public Domain)"
echo "3. Search and download suitable notification sounds"
echo ""
echo "=================================="
echo ""
echo "Current status:"
echo "---------------"

if [ -f "$SOUNDS_DIR/focus-complete.mp3" ]; then
    SIZE=$(ls -lh "$SOUNDS_DIR/focus-complete.mp3" | awk '{print $5}')
    echo "✅ focus-complete.mp3 exists ($SIZE)"
else
    echo "❌ focus-complete.mp3 missing"
fi

if [ -f "$SOUNDS_DIR/break-complete.mp3" ]; then
    SIZE=$(ls -lh "$SOUNDS_DIR/break-complete.mp3" | awk '{print $5}')
    echo "✅ break-complete.mp3 exists ($SIZE)"
else
    echo "❌ break-complete.mp3 missing"
fi

echo ""
echo "=================================="
echo ""

if [ -f "$SOUNDS_DIR/focus-complete.mp3" ] && [ -f "$SOUNDS_DIR/break-complete.mp3" ]; then
    echo "✅ All audio files are in place!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run dev"
    echo "2. Test audio playback in browser"
    echo "3. Complete implementation verification"
else
    echo "⚠️  Please acquire audio files following Option 1 or Option 2 above."
    echo ""
    echo "After acquiring files, run this script again to verify."
fi

echo ""
echo "=================================="

