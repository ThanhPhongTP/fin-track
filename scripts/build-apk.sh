#!/bin/bash
set -e

echo "🚀 [FinTrack] Bắt đầu quá trình build ứng dụng Android APK..."

# 1. Build web assets
echo "📦 1/3. Biên dịch Web Assets (Vite + React)..."
npm run build

# 2. Sync to Capacitor Android
echo "🔄 2/3. Đồng bộ vào dự án Android (Capacitor Sync)..."
npx cap sync android

# 3. Compile APK using Android Studio JBR 21
echo "⚙️ 3/3. Biên dịch file APK bằng Gradle..."
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"

cd android
./gradlew assembleDebug
cd ..

# 4. Copy to root as FinTrack.apk
cp android/app/build/outputs/apk/debug/app-debug.apk ./FinTrack.apk

echo "✅ [FinTrack] HOÀN TẤT! File APK đã sẵn sàng tại: ./FinTrack.apk"
ls -lh ./FinTrack.apk
