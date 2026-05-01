#!/bin/bash

echo "🔨 Doxcord Build Script"
echo "======================="
echo ""

# Bağımlılık kontrolü
if [ ! -d "node_modules" ]; then
    echo "📦 Bağımlılıklar yükleniyor..."
    npm install
    echo ""
fi

# Build
echo "🔨 Linux paketleri oluşturuluyor..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build tamamlandı!"
    echo ""
    echo "Paketler 'dist/' klasöründe:"
    ls -lh dist/ 2>/dev/null || echo "dist/ klasörü bulunamadı"
    echo ""
    echo "AppImage'ı çalıştırmak için:"
    echo "  ./dist/Doxcord-*.AppImage"
    echo ""
    echo "DEB paketini kurmak için:"
    echo "  sudo dpkg -i dist/Doxcord-*.deb"
else
    echo "❌ Build başarısız!"
    exit 1
fi
