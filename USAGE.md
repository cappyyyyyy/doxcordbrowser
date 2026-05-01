# 🚀 Doxcord Kullanım Kılavuzu

## Başlatma

```bash
npm start
```

## Özellikler

### 🎨 Arayüz

#### macOS Traffic Lights (Sol Üst)
- 🔴 **Kırmızı**: Pencereyi kapat
- 🟡 **Sarı**: Pencereyi küçült
- 🟢 **Yeşil**: Pencereyi büyüt/küçült

#### Logo
- Sol üstte mor kalkan logosu
- Gizlilik ve güvenlik sembolü

### 🔍 Arama Motoru Seçimi

Sağ üstteki arama motoru butonuna tıklayarak seçim yapın:

1. **🦆 DuckDuckGo** (Varsayılan)
   - Gizlilik odaklı
   - İzleme yok
   - Önerilen

2. **🔍 Google**
   - En popüler
   - Geniş sonuçlar

3. **🦁 Brave Search**
   - Bağımsız indeks
   - Gizlilik korumalı

4. **🔐 Startpage**
   - Google sonuçları
   - Anonim

5. **🧅 Tor Search (Ahmia)**
   - Onion siteleri
   - Derin web

### 🛡️ Gizlilik Özellikleri

#### Shield Butonu
- Kalkan ikonuna tıklayın
- Privacy Stats panelini açar/kapatır
- Gerçek zamanlı istatistikler

#### Privacy Stats
- **Trackers Blocked**: Engellenen izleyiciler
- **Ads Blocked**: Engellenen reklamlar
- **Time Saved**: Kazanılan süre
- **HTTPS Upgrades**: Güvenli bağlantılar

#### Privacy Controls (Toggle)
- ✅ **Shields Up**: Ana koruma
- ✅ **Block Trackers**: İzleyici engelleme
- ✅ **Block Ads**: Reklam engelleme
- ✅ **HTTPS Everywhere**: Otomatik HTTPS
- ⬜ **Block Scripts**: JavaScript engelleme
- ⬜ **Block Cookies**: Çerez engelleme
- ✅ **Fingerprinting Protection**: Parmak izi koruma

### 🌐 Navigasyon

#### URL Bar
- Adres girin veya arama yapın
- Enter'a basın
- Otomatik olarak seçili arama motorunu kullanır

#### Butonlar
- **◀️ Geri**: Önceki sayfa
- **▶️ İleri**: Sonraki sayfa
- **🔄 Yenile**: Sayfayı yenile
- **🏠 Ana Sayfa**: DuckDuckGo'ya dön

#### Diğer
- **⭐ Yer İmi**: Sayfayı kaydet
- **🎁 Rewards**: Yakında
- **☰ Menü**: Yakında

## Kısayollar

- `Enter` (URL bar): Sayfaya git / Ara
- Traffic lights: Pencere kontrolleri

## İpuçları

1. **Maksimum Gizlilik**:
   - DuckDuckGo veya Tor Search kullanın
   - Tüm shield'leri açın
   - Script ve Cookie blocking'i etkinleştirin

2. **Hızlı Tarama**:
   - Brave Search kullanın
   - Sadece temel shield'leri açın

3. **Genel Kullanım**:
   - Google kullanın
   - İhtiyaca göre shield ayarlayın

## Sorun Giderme

### Sayfa Yüklenmiyor
- HTTPS Everywhere'i kapatın
- Script blocking'i devre dışı bırakın

### Site Bozuk Görünüyor
- Cookie blocking'i kapatın
- Fingerprinting protection'ı devre dışı bırakın

### Arama Çalışmıyor
- Arama motorunu değiştirin
- URL bar'a tam adres girin

## Güvenlik Notları

⚠️ **Önemli**:
- Bu simüle edilmiş gizlilik özellikleridir
- Gerçek koruma için ek araçlar kullanın
- Tor Search için Tor Browser önerilir
- Hassas işlemler için VPN kullanın

## Geliştirme

```bash
# DevTools açmak için main.js'te uncomment yapın:
mainWindow.webContents.openDevTools();
```

---

**Made with 💜 for Privacy**
