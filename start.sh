#!/bin/bash

echo "🕵️  Starting Doxcord..."
echo ""

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı! Önce 'npm install' çalıştırın."
    exit 1
fi

# node_modules kontrolü
if [ ! -d "node_modules" ]; then
    echo "📦 Bağımlılıklar bulunamadı. Yükleniyor..."
    npm install
    echo ""
fi

# Electron'u başlat
echo "🚀 Doxcord başlatılıyor..."
npm start
