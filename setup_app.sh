#!/bin/bash

# Doxcord Desktop Shortcut Creator
APP_PATH=$(pwd)
ICON_PATH="$APP_PATH/logo.png"
DESKTOP_FILE="$HOME/.local/share/applications/doxcord.desktop"

echo "[SİSTEM] Masaüstü kısayolu oluşturuluyor..."

cat > "$DESKTOP_FILE" << EOL
[Desktop Entry]
Version=1.0
Type=Application
Name=Doxcord
Comment=Cyber-Intelligence & OSINT Browser
Exec=bash -c "cd $APP_PATH && npm start"
Icon=$ICON_PATH
Terminal=false
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;application/xml;
EOL

# Give execution permission
chmod +x "$DESKTOP_FILE"

# Copy to Desktop too
cp "$DESKTOP_FILE" "$HOME/Desktop/doxcord.desktop" 2>/dev/null || true
chmod +x "$HOME/Desktop/doxcord.desktop" 2>/dev/null || true

echo "[BAŞARILI] Doxcord artık Uygulamalar menüsünde ve Masaüstünde!"
echo "[İPUCU] Uygulamalar menüsünden aratıp görev çubuğuna sabitleyebilirsiniz."
