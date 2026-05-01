#!/bin/bash

# Doxcord - Universal Auto-Installer
echo "🌌 DOXCORD INTELLIGENCE SYSTEM - KURULUM SİHİRBAZI"
echo "================================================"

# OS Check
OS_TYPE=$(uname -s)

if [[ "$OS_TYPE" == "Linux" ]]; then
    echo "[1/3] Sistem paketleri güncelleniyor..."
    sudo apt-get update -y
    
    echo "[2/3] Tor Service ve Bağımlılıklar kuruluyor..."
    sudo apt-get install -y tor nodejs npm build-essential libvulkan1
    
    echo "[3/3] Tor servisi başlatılıyor..."
    sudo systemctl enable tor
    sudo systemctl start tor
    
    echo "✅ Tor Servisi Aktif: $(systemctl is-active tor)"
else
    echo "⚠️ Bu script Linux (Debian/Ubuntu) tabanlı sistemler içindir."
    echo "Windows kullanıcıları için README.md dosyasındaki Windows adımlarına bakın."
    exit 1
fi

echo ""
echo "📦 Proje bağımlılıkları yükleniyor (npm install)..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DOXCORD BAŞARIYLA KURULDU!"
    echo "--------------------------------"
    echo "Uygulamayı başlatmak için:  npm start"
    echo "Masaüstüne sabitlemek için: ./setup_app.sh"
    echo "--------------------------------"
else
    echo "❌ Bağımlılık yüklemesi başarısız oldu."
    exit 1
fi
