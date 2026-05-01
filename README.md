# 🌌 Doxcord Browser - OSINT Intelligence Suite

Doxcord, siber güvenlik araştırmacıları ve OSINT uzmanları için özel olarak tasarlanmış, **Tokyo Night** estetiğine sahip, yüksek performanslı ve gizlilik odaklı bir Electron tarayıcısıdır.

![Doxcord Logo](logo.png)

## 🚀 Öne Çıkan Özellikler

- **🛡️ Akıllı Tor Entegrasyonu:** `.onion` uzantılı adresleri otomatik olarak algılar ve trafiği Tor (SOCKS5) üzerinden yönlendirir. Normal sitelerde ise hız kaybı yaşatmaz.
- **🔐 Esnek Kimlik Doğrulama:** PostgreSQL desteği ve internet bağlantısı olmadığında devreye giren **Offline-First (Önce Yerel)** sistemi. Şifreleriniz her zaman güvende ve erişilebilir.
- **📊 OSINT Dashboard:** Gelişmiş dorking araçları, PII tarayıcıları ve istihbarat arayüzü.
- **🌙 Premium Estetik:** Özel tasarlanmış **Doxcord Logosu**, akıcı animasyonlar ve cyberpunk arayüz.
- **🚀 Ultra Performans:** Dahili reklam ve takipçi engelleyici (AdBlocker) entegrasyonu.

---

## 🛠️ Kurulum Rehberi

### 🐧 Linux (Otomatik Kurulum)
Gereksinimleri (Tor, Node.js, vb.) ve uygulamayı tek komutla kurmak için şu komutu çalıştırın:
```bash
chmod +x install.sh && sudo ./install.sh
```
*Bu komut Tor servisini arkada otomatik başlatır ve tüm bağımlılıkları yükler.*

---

### 🪟 Windows (Manuel Kurulum)
1. **Node.js Yükleyin:** [nodejs.org](https://nodejs.org/) adresinden LTS sürümünü kurun.
2. **Tor Servisini Kurun:** [Tor Project](https://www.torproject.org/download/tor/) adresinden "Windows Expert Bundle" indirin ve `tor.exe`'nin arka planda çalıştığından emin olun (port 9050).
   - *Alternatif (Chocolatey):* `choco install nodejs tor -y`
3. **Bağımlılıkları Yükleyin:** Terminalde (CMD/PowerShell) proje klasöründe `npm install` komutunu çalıştırın.
4. **Başlatın:** `npm start`

---

### 🚀 Masaüstü Entegrasyonu (Sadece Linux)
Uygulamayı sisteme sabitlemek ve ikonu aktifleştirmek için:
```bash
./setup_app.sh
```

---

### 4. Yapılandırma (.env)
Proje kök dizininde bir `.env` dosyası oluşturun:
```env
DATABASE_URL=postgresql://kullanici:sifre@host:port/veritabani?sslmode=require
ADMIN_USER=admin
ADMIN_PASS=sifre123
```
*Not: Veritabanı olmasa bile uygulama otomatik olarak `local_db.json` üzerinden çalışır.*

### 5. Derleme (Paketleme)
- **Linux (.AppImage/.deb):** `npm run build`
- **Windows (.exe):** `npm run build-win`

---

## 👨‍💻 Kullanım İpuçları

- **Vault (Kasa):** Tüm site şifrelerinizi yerel olarak kaydedebilir ve internetiniz olmasa bile erişebilirsiniz.
- **Doxcord AI:** Sol menüden AI asistanına ulaşarak OSINT ve siber güvenlik sorularınızı sorabilirsiniz.
- **Tor:** `.onion` linkleri sistem tarafından otomatik olarak algılanır ve güvenli tünel üzerinden açılır.

---

## ⚡ Teknik Detaylar

- **Framework:** ElectronJS
- **Styling:** Vanilla CSS (Custom Tokyo Night Theme)
- **Database:** PostgreSQL (pg) & Solid Local JSON (Offline-first)
- **Security:** Bcrypt (Şifreleme), PAC Script (Proxy Routing)

## ⚖️ Lisans
Bu proje geliştirme ve eğitim amaçlıdır. Kullanım sorumluluğu son kullanıcıya aittir.

---
**Doxcord Team** | *Intelligence at your fingertips.*
