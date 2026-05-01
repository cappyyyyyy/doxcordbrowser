# 🌌 Doxcord Browser - OSINT Intelligence Suite

Doxcord, siber güvenlik araştırmacıları ve OSINT uzmanları için özel olarak tasarlanmış, **Tokyo Night** estetiğine sahip, yüksek performanslı ve gizlilik odaklı bir Electron tarayıcısıdır.

![Doxcord Logo](logo.png)

## 🚀 Öne Çıkan Özellikler

- **🛡️ Akıllı Tor Entegrasyonu:** `.onion` uzantılı adresleri otomatik olarak algılar ve trafiği Tor (SOCKS5) üzerinden yönlendirir.
- **🔐 Elite Güvenlik & Gizlilik:** 
  - **Anti-Fingerprinting:** Canvas ve WebGL imzalarını rastgeleleştirerek izlenmeyi imkansız hale getirir.
  - **Process Isolation:** Her tab bağımsız sandbox süreçlerinde çalışır.
  - **Permission Firewall:** Kamera, mikrofon ve dosya erişimi için sıkı izin yönetimi.
- **📊 OSINT Workspace:** Vaka dosyaları (Cases) oluşturarak araştırmalarınızı organize edin.
- **🌙 Premium Estetik:** Tokyo Night özel tasarım, yükleme animasyonları ve cyberpunk arayüz.

---

## 🛠️ Kurulum Rehberi

### 🐧 Linux (Otomatik Kurulum)
Gereksinimleri (Tor, Node.js, vb.) ve uygulamayı tek komutla kurmak için şu komutu çalıştırın:
```bash
chmod +x install.sh && sudo ./install.sh
```
*Bu komut Tor servisini arkada otomatik başlatır ve tüm bağımlılıkları yükler.*

---

### 🪟 Windows (Kurulum ve Masaüstü)
1. **Gereksinimler:** [nodejs.org](https://nodejs.org/) adresinden Node.js kurun ve Tor Expert Bundle'ın çalıştığından emin olun.
2. **Bağımlılıkları Yükleyin:** `npm install`
3. **Masaüstü Uygulaması Yapma:**
   - **Yöntem A (EXE Oluşturma):** `npm run build-win` komutunu çalıştırın. `dist/` klasöründe kurulum dosyanız oluşacaktır.
   - **Yöntem B (Hızlı Başlatıcı):** Proje dizininde sağ tıklayıp bir `.bat` dosyası oluşturun ve içine `npm start` yazın. Bu dosyayı masaüstüne kısayol olarak atayabilirsiniz.

---

### 🚀 Masaüstü Entegrasyonu (Sadece Linux)
Uygulamayı sisteme sabitlemek ve ikonu aktifleştirmek için:
```bash
chmod +x setup_app.sh
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
