# 🚀 Doxcord Hızlı Başlangıç

## Kurulum (İlk Kez)

```bash
# 1. Bağımlılıkları yükle
./install.sh

# VEYA manuel:
npm install
```

## Çalıştırma

```bash
# Uygulamayı başlat
./start.sh

# VEYA manuel:
npm start
```

## Linux Paketi Oluşturma

```bash
# AppImage ve DEB paketi oluştur
./build.sh

# VEYA manuel:
npm run build
```

## Sistem Gereksinimleri

- **Node.js**: v16 veya üzeri
- **npm**: v7 veya üzeri
- **RAM**: Minimum 2GB
- **Disk**: ~500MB (node_modules dahil)

## Hızlı Komutlar

| Komut | Açıklama |
|-------|----------|
| `./install.sh` | İlk kurulum |
| `./start.sh` | Uygulamayı başlat |
| `./build.sh` | Linux paketi oluştur |
| `npm start` | Direkt başlat |
| `npm run build` | Direkt build |

## Sorun Giderme

### "electron: command not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Permission denied"
```bash
chmod +x install.sh start.sh build.sh
```

### Node.js yok
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Arch Linux
sudo pacman -S nodejs npm

# Fedora
sudo dnf install nodejs npm
```

## Kullanım İpuçları

1. **URL Girişi**: Üst bardaki URL kutusuna hedef site adresini girin
2. **OSINT Tarama**: Sağ paneldeki "DORK SEARCH" alanına sorgu yazın
3. **Hızlı Araçlar**: Sağdaki sidebar'dan araçlara hızlı erişin
4. **Case Kaydetme**: Araştırmalarınızı "CASE MANAGER" ile kaydedin

## Kısayollar

- `Ctrl+L` - URL barına odaklan
- `Ctrl+R` - Sayfayı yenile
- `Ctrl+Shift+I` - DevTools (geliştirme modu)
- `Ctrl+W` - Pencereyi kapat
- `Ctrl+Q` - Uygulamadan çık

## İlk Çalıştırma

```bash
# Tüm adımlar tek seferde:
./install.sh && ./start.sh
```

Uygulama açıldığında:
1. URL barına `example.com` yazın
2. DORK SEARCH'e `site:example.com` yazın
3. "INITIATE SCAN" butonuna tıklayın
4. Sonuçları izleyin!

---

**Not**: İlk çalıştırmada Electron indirileceği için biraz zaman alabilir (~100MB).
