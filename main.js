const { app, BrowserWindow, ipcMain, BrowserView, session } = require('electron');
const path = require('path');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { pool, initDB, checkConnection } = require('./db');
const fs = require('fs');
const localDbPath = path.join(__dirname, 'local_db.json');

// Local DB Helper
function getLocalDB() {
  if (!fs.existsSync(localDbPath)) {
    return { users: [], logins: [], cases: [] };
  }
  try {
    const raw = fs.readFileSync(localDbPath, 'utf8');
    const data = JSON.parse(raw);
    
    // Migration from old array-only format
    if (Array.isArray(data)) {
      return { users: data, logins: [], cases: [] };
    }
    
    return {
      users: Array.isArray(data.users) ? data.users : [],
      logins: Array.isArray(data.logins) ? data.logins : [],
      cases: Array.isArray(data.cases) ? data.cases : []
    };
  } catch (e) {
    return { users: [], logins: [], cases: [] };
  }
}

function saveLocalDB(db) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
  } catch (e) {}
}

let mainWindow;
let tabs = new Map();
let activeTabId = null;
let isSidebarVisible = true;
let vpnView = null;
let currentUser = null; // Track current user globally in main process
let enabledExtensions = new Set(['extUblock', 'extJson']);

const adBlockList = [
  '*://*.doubleclick.net/*', '*://*.google-analytics.com/*', '*://*.googletagservices.com/*',
  '*://*.googlesyndication.com/*', '*://*.moatads.com/*', '*://*.adnxs.com/*',
  '*://*.adsrvr.org/*', '*://*.advertising.com/*', '*://*.adform.net/*', '*://*.casalemedia.com/*'
];

async function seedAdmin() {
  try {
    const adminUser = process.env.ADMIN_USER || 'cappyruhh';
    const adminPass = process.env.ADMIN_PASS || 'You9090.root';
    const adminEmail = 'admin@doxcord.io';
    const hashedPassword = await bcrypt.hash(adminPass, 10);
    
    // Local Seed
    const db = getLocalDB();
    if (!db.users.find(u => u.username === adminUser)) {
      db.users.push({ id: 0, username: adminUser, email: adminEmail, password: hashedPassword, role: 'admin' });
      saveLocalDB(db);
    }

    // Remote Seed
    await pool.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, 'admin')
      ON CONFLICT (username) DO UPDATE SET password = $3, role = 'admin';
    `, [adminUser, adminEmail, hashedPassword]);
    console.log('[SYSTEM] Admin core synchronized.');
  } catch (err) {
    console.warn('[CRITICAL] Identity seeding failed (Sync only):', err.message);
  }
}

// Initialize DB
initDB().then(async () => {
  try {
    await seedAdmin();
    console.log('[SYSTEM] Admin check completed.');
  } catch (err) {
    console.error('[SYSTEM] Seed error:', err.message);
  }
}).catch(err => {
  console.error('[SYSTEM] Database initialization failed:', err.message);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    backgroundColor: '#0a0a0f',
    frame: false,
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('resize', () => { if (activeTabId && tabs.has(activeTabId)) updateTabBounds(tabs.get(activeTabId)); });
  setTimeout(() => createTab('tab-1'), 500);
}

ipcMain.handle('open-tor-window', () => {
  const torWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Doxcord - Private Tor Mode',
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      partition: 'persist:tor-session' // Isolated session
    }
  });

  // Set Proxy for Tor (Requires local Tor service on 9050)
  torWindow.webContents.session.setProxy({
    proxyRules: 'socks5://127.0.0.1:9050',
    proxyBypassRules: '<local>'
  });

  torWindow.loadFile('index.html');
  torWindow.maximize();
  
  // Custom styling for Tor window via CSS injection
  torWindow.webContents.on('did-finish-load', () => {
    torWindow.webContents.insertCSS(`
      :root { --primary: #bc13fe !important; --secondary: #00f2ff !important; }
      .navbar { border-bottom: 2px solid #bc13fe !important; }
      .brand-title { color: #bc13fe !important; }
      .brand-title::after { content: " (TOR)"; font-size: 10px; margin-left: 5px; color: var(--secondary); }
    `);
  });
});

const updateTabBounds = (view) => {
  if (!view) return;
  const { width, height } = mainWindow.getContentBounds();
  const sidebarWidth = isSidebarVisible ? 340 : 0;
  const headerHeight = 178;
  view.setBounds({
    x: sidebarWidth,
    y: headerHeight,
    width: width - sidebarWidth,
    height: height - headerHeight
  });
};

const createTab = (id, url = `file://${path.join(__dirname, 'home.html')}`) => {
  const view = new BrowserView({
    webPreferences: { 
      nodeIntegration: false, 
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  tabs.set(id, view);

  view.webContents.on('page-title-updated', (event, title) => {
    mainWindow.webContents.send('tab-updated', { id, title });
  });

  view.webContents.on('did-finish-load', async () => {
    // Autofill Logic
    if (currentUser) {
      const url = view.webContents.getURL();
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        const res = await getCredentialsInternal(currentUser.id);
        const match = res.logins.find(l => (l.site_url || l.url || '').includes(domain));
        
        if (match) {
          const siteUser = match.site_username || match.username;
          const sitePass = match.site_password || match.password;
          
          view.webContents.executeJavaScript(`
            (function() {
              setTimeout(() => {
                const passField = document.querySelector('input[type="password"]');
                const userField = document.querySelector('input[type="text"]:not([style*="display:none"]), input[type="email"], input[name*="user"], input[name*="login"]');
                if (passField && !passField.value) {
                  passField.value = "${sitePass}";
                  if (userField && !userField.value) userField.value = "${siteUser}";
                  console.log('Autofill completed');
                }
              }, 1000);
            })();
          `).catch(e => {});
        }
      } catch (e) {}
    }
  });

  view.webContents.on('estimated-progress', (event, progress) => {
    if (id === activeTabId) {
      mainWindow.webContents.send('load-progress', { progress, active: true });
    }
  });

  view.webContents.on('did-stop-loading', () => {
    if (id === activeTabId) {
      mainWindow.webContents.send('load-progress', { progress: 1, active: false });
    }
  });

  view.webContents.loadURL(url);
  switchTab(id);
};

const switchTab = (id) => {
  if (activeTabId && tabs.has(activeTabId)) mainWindow.removeBrowserView(tabs.get(activeTabId));
  const view = tabs.get(id);
  if (view) {
    mainWindow.setBrowserView(view);
    updateTabBounds(view);
    activeTabId = id;
  }
};

// HANDLERS (Registered ONCE)
ipcMain.handle('toggle-sidebar', (event, visible) => {
  isSidebarVisible = visible;
  if (activeTabId && tabs.has(activeTabId)) updateTabBounds(tabs.get(activeTabId));
  return isSidebarVisible;
});

ipcMain.handle('create-tab', (event, { id, url }) => createTab(id, url));
ipcMain.handle('switch-tab', (event, id) => switchTab(id));
ipcMain.handle('close-tab', (event, id) => {
  const view = tabs.get(id);
  if (view) {
    if (activeTabId === id) mainWindow.removeBrowserView(view);
    view.webContents.destroy();
    tabs.delete(id);
  }
});

ipcMain.handle('navigate-to', (event, url) => {
  if (activeTabId && tabs.has(activeTabId)) tabs.get(activeTabId).webContents.loadURL(url);
});

ipcMain.handle('go-forward', () => {
  if (activeTabId && tabs.has(activeTabId)) {
    const v = tabs.get(activeTabId).webContents;
    if (v.canGoForward()) v.goForward();
  }
});

ipcMain.handle('go-back', () => {
  if (activeTabId && tabs.has(activeTabId)) {
    const v = tabs.get(activeTabId).webContents;
    if (v.canGoBack()) v.goBack();
  }
});

ipcMain.handle('reload', () => {
  if (activeTabId && tabs.has(activeTabId)) tabs.get(activeTabId).webContents.reload();
});

ipcMain.handle('toggle-vpn-ui', (event, visible) => {
  if (visible) {
    if (!vpnView) {
      vpnView = new BrowserView({ webPreferences: { nodeIntegration: true, contextIsolation: false } });
      vpnView.webContents.loadFile('vpn_popup.html');
    }
    mainWindow.addBrowserView(vpnView);
    vpnView.setBounds({ x: 20, y: 185, width: 300, height: 400 });
    mainWindow.setTopBrowserView(vpnView);
  } else if (vpnView) {
    mainWindow.removeBrowserView(vpnView);
  }
});

ipcMain.handle('auth-register', async (event, { username, email, password, ip }) => {
  try {
    const hp = await bcrypt.hash(password, 10);
    const db = getLocalDB();

    // Offline-first: Check if user exists locally
    if (db.users.find(u => u.username === username || u.email === email)) {
      return { success: false, error: 'Bu kullanıcı veya email zaten kayıtlı.' };
    }

    // Always Save Locally
    const newUser = { id: Date.now(), username, email, password: hp, role: 'user', ip_address: ip, created_at: new Date().toISOString() };
    db.users.push(newUser);
    saveLocalDB(db);

    // Try Remote DB Sync
    try {
      const res = await pool.query(
        'INSERT INTO users (username, email, password, ip_address) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
        [username, email, hp, ip]
      );
      return { success: true, user: res.rows[0] };
    } catch (dbErr) {
      console.warn('[AUTH] Remote DB failed, using local profile.');
      return { success: true, user: { id: newUser.id, username: newUser.username, role: newUser.role }, local: true };
    }
  } catch (err) {
    return { success: false, error: 'Sistem hatası.' };
  }
});

ipcMain.handle('auth-login', async (event, { identifier, password }) => {
  try {
    // Check Local first (Fast and works offline)
    const db = getLocalDB();
    const uLocal = db.users.find(u => u.username === identifier || u.email === identifier);
    if (uLocal) {
      const match = await bcrypt.compare(password, uLocal.password);
      if (match) {
        currentUser = { id: uLocal.id, username: uLocal.username, role: uLocal.role };
        return { success: true, user: currentUser, local: true };
      }
    }

    // Try Remote DB
    try {
      const res = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $1', [identifier]);
      if (res.rows.length > 0) {
        const u = res.rows[0];
        const match = await bcrypt.compare(password, u.password);
        if (match) {
          currentUser = { id: u.id, username: u.username, role: u.role };
          return { success: true, user: currentUser };
        }
      }
    } catch (dbErr) {}
    
    return { success: false, error: 'Hesap bulunamadı veya şifre hatalı.' };
  } catch (err) {
    return { success: false, error: 'Sistem hatası.' };
  }
});

ipcMain.handle('get-db-status', async () => {
  return await checkConnection();
});

ipcMain.handle('get-all-users', async (event, adminUserId) => {
  try {
    // Check role from local first
    const db = getLocalDB();
    const admin = db.users.find(u => u.id === adminUserId || u.id === Number(adminUserId));
    if (!admin || admin.role !== 'admin') {
      const check = await pool.query('SELECT role FROM users WHERE id = $1', [adminUserId]);
      if (check.rows[0].role !== 'admin') return { success: false, error: 'Yetkisiz erişim.' };
    }
    
    // Merge users from local and remote if possible
    let users = [...db.users];
    try {
      const res = await pool.query('SELECT id, username, email, role, ip_address, created_at FROM users ORDER BY created_at DESC');
      // Simple merge: remote users take precedence if IDs match, otherwise add unique ones
      res.rows.forEach(ru => {
        if (!users.find(lu => lu.username === ru.username)) users.push(ru);
      });
    } catch (e) {}

    return { success: true, users };
  } catch (err) {
    return { success: false, error: 'Liste alınamadı.' };
  }
});

ipcMain.handle('save-credential', async (event, { userId, url, username, password }) => {
  try {
    // ALWAYS Save Locally (User's specific request)
    const db = getLocalDB();
    db.logins.push({ id: Date.now(), userId, url, username, password, created_at: new Date().toISOString() });
    saveLocalDB(db);

    // Sync to Remote
    try {
      await pool.query('INSERT INTO saved_logins (user_id, site_url, site_username, site_password) VALUES ($1, $2, $3, $4)', [userId, url, username, password]);
    } catch (e) {
      console.warn('[SYNC] Remote credential sync failed, saved locally.');
    }
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
});

// CASE MANAGEMENT HANDLERS
ipcMain.handle('save-case-data', async (event, caseData) => {
    try {
        const db = getLocalDB();
        const existingIndex = db.cases.findIndex(c => c.id === caseData.id);
        if (existingIndex > -1) db.cases[existingIndex] = { ...db.cases[existingIndex], ...caseData, updated_at: new Date().toISOString() };
        else db.cases.push({ ...caseData, id: Date.now(), created_at: new Date().toISOString() });
        saveLocalDB(db);
        return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('get-cases', async () => {
    const db = getLocalDB();
    return { success: true, cases: db.cases };
});

ipcMain.handle('get-credentials', async (event, userId) => {
  return await getCredentialsInternal(userId);
});

async function getCredentialsInternal(userId) {
  try {
    const db = getLocalDB();
    // Support both userId and user_id for compatibility
    const localLogins = db.logins.filter(l => l.userId === userId || l.userId === Number(userId) || l.user_id === userId || l.user_id === Number(userId));
    
    try {
      const res = await pool.query('SELECT * FROM saved_logins WHERE user_id = $1', [userId]);
      if (res.rows.length > 0) {
        // Merge or replace
        return { success: true, logins: res.rows };
      }
    } catch (e) {}

    return { success: true, logins: localLogins, local: true };
  } catch (err) { return { success: false, logins: [] }; }
}

ipcMain.on('get-credentials-internal', async (userId) => {
    const res = await getCredentialsInternal(userId);
    return res.logins;
});

app.on('ready', async () => {
    // Integrated Tor Routing (PAC Script)
    const pacScript = 'data:text/plain,function FindProxyForURL(url, host) { ' +
                      'if (shExpMatch(host, "*.onion")) return "SOCKS5 127.0.0.1:9050"; ' +
                      'return "DIRECT"; }';
    
    session.defaultSession.setProxy({ pacScript })
      .then(() => console.log('[TOR] Intelligence routing active for .onion domains.'))
      .catch(err => console.error('[TOR] Routing initialization failed:', err));

    // PERMISSION FIREWALL (Hardened Security)
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const url = webContents.getURL();
        console.log(`[SECURITY] Permission requested: ${permission} for ${url}`);
        
        // Anti-Phishing: Check for punycode domains during sensitive requests
        if (url.includes('xn--')) {
            console.warn(`[ANTI-PHISHING] Blocked permission request from suspicious domain: ${url}`);
            return callback(false); 
        }

        const allowed = ['notifications', 'fullscreen'];
        if (allowed.includes(permission)) return callback(true);
        
        // Block critical ones by default for now (can be made interactive later)
        if (['media', 'geolocation', 'clipboard-read', 'pointerLock'].includes(permission)) {
            console.log(`[PROTECTION] Blocked ${permission} request to prevent fingerprinting/tracking.`);
            return callback(false);
        }
        
        callback(true);
    });

    const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
    blocker.enableBlockingInSession(session.defaultSession);
    createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('minimize-window', () => mainWindow?.minimize());
ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle('close-window', () => mainWindow?.close());
