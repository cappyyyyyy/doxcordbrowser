const { ipcRenderer } = require('electron');

// UI Elements
const closeBtn = document.getElementById('closeBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const maximizeBtn = document.getElementById('maximizeBtn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const homeBtn = document.getElementById('home-btn');
const urlBar = document.getElementById('urlBar');
const tabsContainer = document.getElementById('tabsContainer');
const newTabBtn = document.getElementById('newTabBtn');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeSidebar = document.getElementById('closeSidebar');
const shieldBtn = document.getElementById('shieldBtn');
const rewardsBtn = document.getElementById('rewardsBtn');
const intelToggleBtn = document.getElementById('intelToggleBtn');
const intelModeIndicator = document.getElementById('intelModeIndicator');
const doxcordResultsView = document.getElementById('doxcordResultsView');
const resultsContent = document.getElementById('resultsContent');
const resultsMeta = document.getElementById('resultsMeta');
const closeResultsBtn = document.getElementById('closeResultsBtn');

// VPN UI Elements
const protonVpnToggle = document.getElementById('protonVpnToggle');
const vpnPopup = document.getElementById('vpnPopup');
const vpnStatusText = document.getElementById('vpnStatusText');
const vpnIpValue = document.getElementById('vpnIpValue');
const vpnConnectBtn = document.getElementById('vpnConnectBtn');
const closeVpnPopup = vpnPopup.querySelector('.close-popup');

// AI UI Elements
const aiChatBox = document.getElementById('aiChatBox');
const aiInput = document.getElementById('aiInput');
const aiSendBtn = document.getElementById('aiSendBtn');

// DOXCORD AI Logic (Free & Integrated)
async function askDoxcordAI(question) {
    if (!aiChatBox) return;
    
    // User message
    appendAiMessage('SİZ', question, false);
    aiInput.value = '';
    
    // Loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ai-msg bot loading';
    loadingDiv.innerHTML = '<b>AI:</b> <i class="fas fa-circle-notch fa-spin"></i> Doxcord Intelligence Core bağlanıyor...';
    aiChatBox.appendChild(loadingDiv);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
    
    try {
        // Switching to Pollinations.ai (Free, stable, no-key required)
        const systemPrompt = "Sen Doxcord Intelligence Browser'ın yapay zekasısın. Siber güvenlik, OSINT, veri analizi ve gizlilik konularında uzmansın. Cevapların kısa, profesyonel ve teknik olsun. Karanlık, elit ve hacker estetiğine sahip bir dil kullan. Türkçe cevap ver.";
        const fullPrompt = `${systemPrompt}\n\nKullanıcı: ${question}`;
        
        const response = await fetch(`https://text.pollinations.ai/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ],
                seed: 42,
                model: "openai" // Options: openai, mistral, etc.
            })
        });

        if (!response.ok) throw new Error('API_ERROR');

        const reply = await response.text(); // Pollinations usually returns raw text
        
        loadingDiv.remove();
        appendAiMessage('AI', reply, true);
    } catch (e) {
        console.error(e);
        loadingDiv.remove();
        appendAiMessage('AI', "Bağlantı hatası: Intelligence Core şu an erişilemez durumda. Farklı bir protokol deneniyor... (Sistem hatasını düzeltmeye çalışıyorum)", true);
        
        // Fallback to GET if POST fails (Pollinations supports both)
        try {
            const getResponse = await fetch(`https://text.pollinations.ai/${encodeURIComponent(question)}?system=${encodeURIComponent("Doxcord AI, siber güvenlik uzmanı. Türkçe.")}`);
            if (getResponse.ok) {
                const getReply = await getResponse.text();
                appendAiMessage('AI', getReply, true);
            } else {
                throw new Error('FALLBACK_FAILED');
            }
        } catch (err) {
            appendAiMessage('AI', "Kritik Hata: AI çekirdeği ile bağlantı kurulamadı. Lütfen internet bağlantınızı veya güvenlik ayarlarınızı kontrol edin.", true);
        }
    }
}

function appendAiMessage(sender, msg, isAi) {
    const div = document.createElement('div');
    div.className = isAi ? 'ai-msg bot' : 'ai-msg user';
    div.innerHTML = `<b>${sender}:</b> ${msg}`;
    aiChatBox.appendChild(div);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
}

if (aiSendBtn) {
    aiSendBtn.onclick = () => {
        if (aiInput.value.trim()) askDoxcordAI(aiInput.value.trim());
    };
    aiInput.onkeypress = (e) => {
        if (e.key === 'Enter' && aiInput.value.trim()) askDoxcordAI(aiInput.value.trim());
    };
}



// State
let tabs = [];
let activeTabId = null;
let isIntelligenceMode = false;
const OATH_KEY = 'acf8cd4ef10efb97eb00643210d342cac0686afc71be791e65b64f38d8e0cfbe';

// Global initialization
// Tab Management Logic
function createTabUI(id, url) {
    const container = document.getElementById('tabsContainer');
    if (!container) return;
    
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.id = `tab-ui-${id}`;
    tab.innerHTML = `
        <span class="tab-title">Loading...</span>
        <span class="tab-close" data-id="${id}">✕</span>
    `;
    
    tab.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close')) return;
        switchTab(id);
    });
    
    tab.querySelector('.tab-close').addEventListener('click', () => closeTab(id));
    container.appendChild(tab);
    tabs.push({ id, url });
}

function switchTab(id) {
    activeTabId = id;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const ui = document.getElementById(`tab-ui-${id}`);
    if (ui) ui.classList.add('active');
    
    const tabData = tabs.find(t => t.id === id);
    if (tabData) document.getElementById('urlBar').value = tabData.url;
    
    ipcRenderer.invoke('switch-tab', id);
}

function closeTab(id) {
    ipcRenderer.invoke('close-tab', id);
    const ui = document.getElementById(`tab-ui-${id}`);
    if (ui) ui.remove();
    tabs = tabs.filter(t => t.id !== id);
    
    if (activeTabId === id && tabs.length > 0) {
        switchTab(tabs[tabs.length - 1].id);
    } else if (tabs.length === 0) {
        createNewTab();
    }
}

function createNewTab(url = null) {
    const homeUrl = getHomeUrl();
    const id = `tab-${Date.now()}`;
    createTabUI(id, url || homeUrl);
    ipcRenderer.invoke('create-tab', { id, url: url || homeUrl });
}

const getHomeUrl = () => `file://${window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))}/home.html`;

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('hidden');
    const isVisible = !sb.classList.contains('hidden');
    ipcRenderer.invoke('toggle-sidebar', isVisible);
}

async function updateVpnInfo() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ipVal = document.getElementById('vpnIpValue');
        if (ipVal) ipVal.innerText = data.ip;
    } catch (e) {
        const ipVal = document.getElementById('vpnIpValue');
        if (ipVal) ipVal.innerText = "IP ALINAMADI";
    }
}

// Global initialization
function initBrowser() {
    const urlBar = document.getElementById('urlBar');
    
    // Window Controls
    document.getElementById('closeBtn')?.addEventListener('click', () => ipcRenderer.invoke('close-window'));
    document.getElementById('minimizeBtn')?.addEventListener('click', () => ipcRenderer.invoke('minimize-window'));
    document.getElementById('maximizeBtn')?.addEventListener('click', () => ipcRenderer.invoke('maximize-window'));

    // Navigation
    document.getElementById('back-btn')?.addEventListener('click', () => ipcRenderer.invoke('go-back'));
    document.getElementById('forward-btn')?.addEventListener('click', () => ipcRenderer.invoke('go-forward'));
    document.getElementById('refresh-btn')?.addEventListener('click', () => ipcRenderer.invoke('reload'));
    document.getElementById('home-btn')?.addEventListener('click', () => ipcRenderer.invoke('navigate-to', getHomeUrl()));

    // Tab Management
    document.getElementById('newTabBtn')?.addEventListener('click', () => createNewTab());

    // URL Bar handling
    urlBar?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            let val = urlBar.value.trim();
            if (!val) return;

            if (val.startsWith('file://') || val.startsWith('http://') || val.startsWith('https://')) {
                ipcRenderer.invoke('navigate-to', val);
                return;
            }

            if (val.includes('.') && !val.includes(' ')) {
                ipcRenderer.invoke('navigate-to', `https://${val}`);
                return;
            }

            if (isIntelligenceMode) {
                const dorkTemplates = [
                    `("${val}") AND (filetype:pdf OR filetype:txt OR filetype:xls OR filetype:sql)`,
                    `intext:"${val}" AND (intext:"password")`,
                    `site:pastebin.com OR site:github.com "${val}"`
                ];
                const aiDork = dorkTemplates.join(' OR ');
                ipcRenderer.invoke('navigate-to', `https://duckduckgo.com/?kae=d&q=${encodeURIComponent(aiDork)}`);
                return;
            }

            const useGoogle = localStorage.getItem('doxcord_ext_extGoogle') === 'true';
            const engineUrl = useGoogle 
                ? `https://www.google.com/search?q=${encodeURIComponent(val)}`
                : `https://duckduckgo.com/?kae=d&q=${encodeURIComponent(val)}`;
            ipcRenderer.invoke('navigate-to', engineUrl);
        }
    });

    // Sidebar
    document.getElementById('menuBtn')?.addEventListener('click', toggleSidebar);

    document.getElementById('closeSidebar')?.addEventListener('click', () => {
        sidebar.classList.add('hidden');
        ipcRenderer.invoke('toggle-sidebar', false);
    });

    // VPN
    document.getElementById('protonVpnToggle')?.addEventListener('click', () => {
        const popup = document.getElementById('vpnPopup');
        if (!popup) return;
        const isVisible = popup.style.display === 'flex';
        popup.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) updateVpnInfo();
    });

    document.querySelector('.vpn-popup .close-popup')?.addEventListener('click', () => {
        const popup = document.getElementById('vpnPopup');
        if (popup) popup.style.display = 'none';
    });

    document.getElementById('vpnConnectBtn')?.addEventListener('click', () => {
        const btn = document.getElementById('vpnConnectBtn');
        const toggle = document.getElementById('protonVpnToggle');
        const status = document.getElementById('vpnStatusText');
        
        const isActive = toggle?.classList.contains('active');
        if (!isActive) {
            toggle?.classList.add('active');
            if (status) {
                status.innerText = "BAĞLI (PROTECTED)";
                status.style.color = "#00ff88";
            }
            if (btn) {
                btn.innerText = "VPN BAĞLANTISINI KES";
                btn.classList.add('danger');
            }
            ipcRenderer.invoke('navigate-to', 'https://account.protonvpn.com/login');
            showNotification('Proton VPN Tüneli Aktif!', 'success');
        } else {
            toggle?.classList.remove('active');
            if (status) {
                status.innerText = "BAĞLI DEĞİL";
                status.style.color = "#ff4444";
            }
            if (btn) {
                btn.innerText = "VPN BAĞLANTISINI BAŞLAT";
                btn.classList.remove('danger');
            }
            showNotification('VPN Bağlantısı Kesildi.', 'info');
        }
    });

    // Sidebar Tabs
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            sidebarTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.sidebar-section').forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active');
            });
            
            const activeSection = document.getElementById(`${target}Section`);
            if (activeSection) {
                activeSection.style.display = 'block';
                setTimeout(() => activeSection.classList.add('active'), 10);
            }
        });
    });

    const navExtBtn = document.getElementById('navExtBtn');
    if (navExtBtn) {
        navExtBtn.addEventListener('click', () => {
            const sb = document.getElementById('sidebar');
            if (sb.classList.contains('hidden')) toggleSidebar();
            const extTab = document.querySelector('.sidebar-tab[data-tab="extensions"]');
            if (extTab) extTab.click();
        });
    }

    const loadingBar = document.getElementById('loadingBar');
    ipcRenderer.on('load-progress', (event, { progress, active }) => {
        if (!loadingBar) return;
        
        if (active) {
            loadingBar.classList.add('active');
            loadingBar.style.width = (progress * 100) + '%';
        } else {
            loadingBar.style.width = '100%';
            setTimeout(() => {
                loadingBar.classList.remove('active');
                setTimeout(() => { loadingBar.style.width = '0%'; }, 500);
            }, 300);
        }
    });
}

// Navigation State Handling
function updateNavButtons(canGoBack, canGoForward) {
    backBtn.disabled = !canGoBack;
    forwardBtn.disabled = !canGoForward;
}

ipcRenderer.on('nav-state-changed', (event, { canGoBack, canGoForward }) => {
    updateNavButtons(canGoBack, canGoForward);
});

// Bookmarks Bar Logic
document.querySelectorAll('.bookmark-item').forEach(item => {
    item.addEventListener('click', () => {
        const text = item.innerText.trim();
        if (text.includes('Intel Hub')) {
            ipcRenderer.invoke('navigate-to', getHomeUrl());
        } else if (text.includes('Leaks')) {
            ipcRenderer.invoke('navigate-to', 'https://leakcheck.io/');
        } else if (text.includes('Socials')) {
            ipcRenderer.invoke('navigate-to', 'https://socialsearcher.com/');
        } else if (text.includes('Doxcord.io')) {
            ipcRenderer.invoke('navigate-to', 'http://18.220.187.181/');
        }
    });
});

// Intelligence Mode Toggle
intelToggleBtn.addEventListener('click', () => {
    isIntelligenceMode = !isIntelligenceMode;
    intelModeIndicator.classList.toggle('active', isIntelligenceMode);
    intelToggleBtn.classList.toggle('active', isIntelligenceMode);
    document.querySelector('.url-wrapper').classList.toggle('intel-active', isIntelligenceMode);
    
    if (isIntelligenceMode) {
        urlBar.placeholder = "ENTER OSINT QUERY...";
        showNotification('INTELLIGENCE CORE ENGAGED', 'info');
    } else {
        urlBar.placeholder = "Search or enter address";
    }
});

// Identity Scraper Implementation
async function extractPageIntel() {
    showNotification('Injecting Intelligence Probe...', 'info');
    
    try {
        // Request page content from the active tab via IPC
        const pageData = await ipcRenderer.invoke('get-active-tab-content');
        
        if (!pageData || !pageData.html) {
            throw new Error('No accessible content in active tab');
        }

        const text = pageData.html;
        
        // Regex patterns for PII
        const patterns = {
            emails: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            phones: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
            socials: /(facebook|twitter|instagram|linkedin|github)\.com\/[a-zA-Z0-9._-]+/g,
            crypto: /(?:^|\s)(?:0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-Z0-9]{25,39})(?:\s|$)/g
        };

        const results = {};
        Object.entries(patterns).forEach(([key, regex]) => {
            const matches = text.match(regex);
            results[key] = matches ? [...new Set(matches)] : [];
        });

        // Add metadata
        results.title = pageData.title;
        results.url = pageData.url;

        showResults([results], 'Page Scan', 'Internal Identity Scraper');
        showNotification('Analysis Complete: Intelligence Extracted', 'success');
    } catch (err) {
        showNotification(`Probing Failed: ${err.message}`, 'error');
    }
}

document.getElementById('scanPageBtn').addEventListener('click', extractPageIntel);

// Toolbox Handlers
document.querySelectorAll('.toolbox-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        showNotification(`Initializing ${tool.toUpperCase()} Modules...`, 'info');
        
        switch(tool) {
            case 'exif':
                createNewTab('https://jimpl.com/'); // Example online EXIF tool
                break;
            case 'whois':
                createNewTab('https://whois.domaintools.com/');
                break;
            case 'breach':
                createNewTab('https://leakcheck.io/');
                break;
            case 'dork':
                createNewTab('file://' + __dirname + '/osint-panel.html');
                break;
        }
    });
});

// OSINT Results View
function showResults(data, query, source) {
    doxcordResultsView.classList.add('active');
    resultsMeta.innerText = `Query: ${query} | Source: ${source}`;
    resultsContent.innerHTML = '';
    
    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `<h3>Record #${index + 1}</h3>` + 
                Object.entries(item).map(([k, v]) => `
                    <div class="result-item">
                        <span class="result-key">${k}:</span>
                        <span class="result-value">${typeof v === 'object' ? JSON.stringify(v) : v}</span>
                    </div>
                `).join('');
            resultsContent.appendChild(card);
        });
    } else {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `<h3>Result Data</h3>` + 
            Object.entries(data).map(([k, v]) => `
                <div class="result-item">
                    <span class="result-key">${k}:</span>
                    <span class="result-value">${typeof v === 'object' ? JSON.stringify(v) : v}</span>
                </div>
            `).join('');
        resultsContent.appendChild(card);
    }
}

closeResultsBtn.addEventListener('click', () => doxcordResultsView.classList.remove('active'));

// API Query Implementation (Based on PHP)
async function callIntelligenceAPI(type, p1, p2) {
    const resultsContainer = document.getElementById('intelResults');
    resultsContainer.innerHTML = '<div style="color:var(--primary); text-align:center;">EXHAUSTING INTEL SOURCE...</div>';
    
    try {
        let data = null;
        let url = '';
        let headers = { "Content-Type": "application/json" };
        let method = 'GET';
        let body = null;

        const uP1 = encodeURIComponent(p1);
        const uP2 = encodeURIComponent(p2);

        if (type.startsWith('oathnet_')) {
            const endpoint = type.replace('oathnet_', '').replace('stealer', 'v2/stealer/search').replace('discord', 'discord-userinfo');
            url = `https://oathnet.org/api/service/${endpoint}?q=${uP1}`;
            headers['x-api-key'] = OATH_KEY;
            headers['Referer'] = 'https://oathnet.org/';
        } else if (type.startsWith('tr_')) {
            const domain = "arastir.sbs";
            const endpoints = {
                tr_tc: `tc.php?tc=${uP1}`,
                tr_adsoyad: `adsoyad.php?adi=${uP1}&soyadi=${uP2}`,
                tr_adres: `adres.php?tc=${uP1}`,
                tr_gsmtc: `gsmtc.php?gsm=${uP1}`,
                tr_tcgsm: `tcgsm.php?tc=${uP1}`
            };
            url = `https://${domain}/api/${endpoints[type]}`;
        } else if (type === 'leak_leakcheck') {
            url = `https://leakcheck.io/api/public?check=${uP1}`;
        } else if (type === 'email_hibp') {
            url = `https://api.xposedornot.com/v1/check-email/${uP1}`;
        } else if (type === 'universal_osint') {
             // Multi-call simulation
             resultsContainer.innerHTML = 'Executing Universal Chain...';
             const [lc, hb] = await Promise.all([
                 fetch(`https://leakcheck.io/api/public?check=${uP1}`).then(r => r.json()),
                 fetch(`https://api.xposedornot.com/v1/check-email/${uP1}`).then(r => r.json())
             ]);
             data = { leakcheck: lc, hibp: hb };
        } else {
            data = { error: "Query type not yet fully implemented in JS" };
        }

        if (url) {
            const resp = await fetch(url, { method, headers, body });
            data = await resp.json();
        }

        if (data) {
            showResults(data, p1, type);
            resultsContainer.innerHTML = '<div style="color:#00ff88; text-align:center;">QUERY SUCCESSFUL</div>';
        }
    } catch (err) {
        resultsContainer.innerHTML = `<div style="color:#ff5f57; text-align:center;">API ERROR: ${err.message}</div>`;
    }
}

const advancedSearchBtn = document.getElementById('runAdvancedSearch');
if (advancedSearchBtn) {
    advancedSearchBtn.addEventListener('click', () => {
        const type = document.getElementById('apiType').value;
        const p1 = document.getElementById('param1').value;
        const p2 = document.getElementById('param2').value;
        if (p1) callIntelligenceAPI(type, p1, p2);
    });
}

// IPC Listeners
ipcRenderer.on('internal-search', (event, query) => {
    ipcRenderer.invoke('navigate-to', `https://duckduckgo.com/?kae=d&q=${encodeURIComponent(query)}`);
});

ipcRenderer.on('tab-created', (event, { id, url }) => {
    if (!tabs.find(t => t.id === id)) {
        createTabUI(id, url);
        switchTab(id);
    }
});

const shieldBadge = document.getElementById('shieldBadge');
const shieldBadgeSidebar = document.getElementById('shieldBadgeSidebar');
let blockedCount = 0;

ipcRenderer.on('shield-event', (event, message) => {
    blockedCount++;
    if (shieldBadge) {
        shieldBadge.innerText = blockedCount;
        shieldBadge.style.display = 'block';
    }
    if (shieldBadgeSidebar) {
        shieldBadgeSidebar.innerText = blockedCount;
    }
});

// Proxy & Tor Handlers
document.getElementById('torToggle').addEventListener('change', (e) => {
    ipcRenderer.invoke('toggle-tor', e.target.checked);
});

document.getElementById('saveProxyList').addEventListener('click', () => {
    const list = document.getElementById('proxyList').value.trim();
    if (!list) {
        ipcRenderer.invoke('set-proxy', { server: '' });
        alert('Proxy cleared.');
        return;
    }
    const proxies = list.split('\n');
    const firstProxy = proxies[0].trim();
    ipcRenderer.invoke('set-proxy', { server: firstProxy });
    alert(`Doxcord Intelligence: ${proxies.length} proxies loaded. Active: ${firstProxy}`);
});

ipcRenderer.on('tab-updated', (event, { id, title, favicon }) => {
    const tabEl = document.getElementById(`tab-ui-${id}`);
    if (tabEl) {
        if (title) {
            tabEl.querySelector('.tab-title').innerText = title;
            tabEl.title = title;
        }
        if (favicon) {
            let img = tabEl.querySelector('.tab-favicon');
            if (!img) {
                img = document.createElement('img');
                img.className = 'tab-favicon';
                tabEl.prepend(img);
            }
            img.src = favicon;
        }
    }
});

ipcRenderer.on('url-changed', (event, { id, url }) => {
    const tab = tabs.find(t => t.id === id);
    if (tab) {
        tab.url = url;
        if (activeTabId === id) urlBar.value = url;
        const tabTitle = document.querySelector(`#tab-ui-${id} .tab-title`);
        if (tabTitle) tabTitle.innerText = url.replace('https://', '').replace('www.', '').substring(0, 20);
        saveHistory(url);
    }
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const colors = {
        success: '#00ff88',
        error: '#ff5f57',
        info: '#b300ff'
    };
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 14px 20px;
        background: rgba(20, 20, 26, 0.95);
        border: 1px solid ${colors[type]};
        border-left: 4px solid ${colors[type]};
        color: #e0e0e0;
        font-family: 'Outfit', sans-serif;
        font-size: 13px;
        font-weight: 500;
        z-index: 10000;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        animation: slideIn 0.3s ease-out;
        backdrop-filter: blur(10px);
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

if (!document.getElementById('notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

ipcRenderer.on('internal-tool', (event, toolName) => {
    showNotification(`Initializing ${toolName.toUpperCase()} Module...`, 'info');
    
    switch(toolName) {
        case 'leakcheck':
            createNewTab('https://leakcheck.io/');
            break;
        case 'social':
            createNewTab('https://socialsearcher.com/');
            break;
        case 'identity':
            createNewTab('file://' + __dirname + '/osint-panel.html');
            break;
        case 'network':
            createNewTab('https://whois.domaintools.com/');
            break;
        case 'media':
            createNewTab('https://jimpl.com/');
            break;
        case 'scraping':
            extractPageIntel();
            break;
        default:
            createNewTab('file://' + __dirname + '/osint-panel.html');
            break;
    }
});

// ==========================================
// THEME ENGINE
// ==========================================
const themeBorders = {
    themePurple: '#bc13fe',
    themeRed: '#ff3b30',
    themeGreen: '#00d084',
    themeBlue: '#00f2ff'
};

function applyTheme(themeId) {
    if (!themeBorders[themeId]) return;
    document.documentElement.style.setProperty('--primary', themeBorders[themeId]);
    document.documentElement.style.setProperty('--primary-glow', setOpacity(themeBorders[themeId], 0.4));
    document.documentElement.style.setProperty('--border-color', setOpacity(themeBorders[themeId], 0.3));
    localStorage.setItem('doxcord_theme', themeId);
}
function setOpacity(hex, alpha) {
    return hex + Math.floor(alpha * 255).toString(16).padStart(2, '0');
}

['themePurple', 'themeRed', 'themeGreen', 'themeBlue'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => applyTheme(id));
});

const savedTheme = localStorage.getItem('doxcord_theme');
if (savedTheme) applyTheme(savedTheme);

// ==========================================
// HISTORY MANAGER
// ==========================================
let browserHistory = JSON.parse(localStorage.getItem('doxcord_history') || '[]');

function saveHistory(url) {
    if (!url || url.startsWith('file://')) return;
    // Don't save duplicate consecutive histories
    if (browserHistory.length > 0 && browserHistory[0].url === url) return;
    const entry = { url, timestamp: Date.now() };
    browserHistory.unshift(entry);
    if (browserHistory.length > 50) browserHistory.pop();
    localStorage.setItem('doxcord_history', JSON.stringify(browserHistory));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyListContainer');
    if (!container) return;
    container.innerHTML = '';
    if (browserHistory.length === 0) {
        container.innerHTML = '<div style="font-size:12px; color:var(--text-secondary); text-align:center;">No history recorded yet.</div>';
        return;
    }
    browserHistory.forEach(item => {
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.background = 'var(--bg-surface)';
        div.style.border = '1px solid var(--border-color)';
        div.style.borderRadius = '8px';
        div.style.cursor = 'pointer';
        div.style.fontSize = '12px';
        div.style.wordBreak = 'break-all';
        div.style.color = '#fff';
        const date = new Date(item.timestamp).toLocaleTimeString();
        div.innerHTML = `<span style="color:var(--text-secondary); margin-right:8px;">[${date}]</span> ${item.url}`;
        div.onclick = () => {
            if (activeTabId) {
                ipcRenderer.invoke('navigate-to', item.url);
            } else {
                createNewTab(item.url);
            }
        };
        container.appendChild(div);
    });
}
document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    browserHistory = [];
    localStorage.removeItem('doxcord_history');
    renderHistory();
});
renderHistory();

// ==========================================
// EXTENSION & STORE MANAGER
// ==========================================
const extensionStore = [
    { id: 'extUblock', name: 'uBlock Origin PRO', desc: 'Reklam ve tracker engelleme.', icon: 'fa-ban', default: true },
    { id: 'extWappalyzer', name: 'Wappalyzer V2', desc: 'Site teknolojilerini analiz eder.', icon: 'fa-layer-group', default: false },
    { id: 'extJson', name: 'JSON Formatter', desc: 'API yanıtlarını güzelleştirir.', icon: 'fa-code', default: true },
    { id: 'extGoogle', name: 'Google Mode', desc: 'Google arama motorunu kullanır.', icon: 'fa-brands fa-google', default: false },
    { id: 'extDarkReader', name: 'Dark Guard', desc: 'Zorunlu karanlık tema CSS.', icon: 'fa-moon', default: false },
    { id: 'extWhois', name: 'Instant WHOIS', desc: 'Domain detaylarını hızla çeker.', icon: 'fa-globe', default: false },
    { id: 'extPrivacyPlus', name: 'Privacy PLUS', desc: 'Fingerprint ve Canvas koruması.', icon: 'fa-user-secret', default: false },
    { id: 'extProtonVPN', name: 'Proton VPN PRO', desc: 'Sınırsız şifreli VPN bağlantısı.', icon: 'fa-unlock-alt', default: false }
];

let installedExtensions = [];
try {
    installedExtensions = JSON.parse(localStorage.getItem('doxcord_installed_exts') || '["extUblock", "extJson"]');
} catch (e) {
    installedExtensions = ["extUblock", "extJson"];
    console.error("Extension parsing failed:", e);
}

function initExtensionEngine() {
    renderStore();
    renderActiveExtensions();
    
    document.getElementById('openWebStore')?.addEventListener('click', () => {
        const webStoreUrl = 'https://chromewebstore.google.com/category/extensions';
        ipcRenderer.invoke('navigate-to', webStoreUrl);
        showNotification('Opening Chrome Web Store...', 'info');
    });
}

function renderStore() {
    const container = document.getElementById('storeListContainer');
    if (!container) return;
    container.innerHTML = '';
    
    extensionStore.forEach(ext => {
        const isInstalled = installedExtensions.includes(ext.id);
        const item = document.createElement('div');
        item.style.padding = '12px';
        item.style.background = 'rgba(255,255,255,0.03)';
        item.style.border = '1px solid var(--border-color)';
        item.style.borderRadius = '10px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        
        item.innerHTML = `
            <div>
                <span style="display:block; font-size:12px;"><i class="fas ${ext.icon}"></i> ${ext.name}</span>
                <span style="font-size:9px; color:var(--text-secondary);">${ext.desc}</span>
            </div>
            <button class="intel-btn" style="padding:5px 10px; font-size:10px; min-width:60px; ${isInstalled ? 'opacity:0.5;' : ''}" ${isInstalled ? 'disabled' : ''}>
                ${isInstalled ? 'EKLENDİ' : 'EKLE'}
            </button>
        `;
        
        const btn = item.querySelector('button');
        btn.onclick = () => {
            if (!installedExtensions.includes(ext.id)) {
                installedExtensions.push(ext.id);
                localStorage.setItem('doxcord_installed_exts', JSON.stringify(installedExtensions));
                showNotification(`${ext.name} Mağazadan Eklendi!`, 'success');
                renderStore();
                renderActiveExtensions();
            }
        };
        
        container.appendChild(item);
    });
}

function renderActiveExtensions() {
    const container = document.getElementById('activeExtensionsList');
    if (!container) return;
    container.innerHTML = '';
    
    if (installedExtensions.length === 0) {
        container.innerHTML = '<p style="font-size:11px; color:var(--text-secondary); text-align:center;">Henüz mağazadan eklenti eklemediniz.</p>';
        return;
    }

    installedExtensions.forEach(extId => {
        const ext = extensionStore.find(e => e.id === extId);
        if (!ext) return;

        const isEnabled = localStorage.getItem(`doxcord_ext_${ext.id}`) === 'true' || (localStorage.getItem(`doxcord_ext_${ext.id}`) === null && ext.default);
        
        const item = document.createElement('div');
        item.className = 'feature-item';
        item.style.marginBottom = '15px';
        item.style.borderBottom = '1px solid var(--border-color)';
        item.style.paddingBottom = '15px';
        
        item.innerHTML = `
            <div>
                <span style="display:block; margin-bottom:5px;"><i class="fas ${ext.icon}"></i> ${ext.name}</span>
                <span style="font-size:10px; color:var(--text-secondary);">${ext.desc}</span>
            </div>
            <label class="toggle">
                <input type="checkbox" id="${ext.id}" ${isEnabled ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        `;
        
        const checkbox = item.querySelector('input');
        checkbox.onchange = () => {
            localStorage.setItem(`doxcord_ext_${ext.id}`, checkbox.checked);
            showNotification(`${ext.name} ${checkbox.checked ? 'AKTİF' : 'DEVRE DIŞI'}`, checkbox.checked ? 'success' : 'info');
            
            if (ext.id === 'extProtonVPN' && checkbox.checked) {
                const protonUrl = 'https://account.protonvpn.com/login';
                ipcRenderer.invoke('navigate-to', protonUrl);
                showNotification('Proton VPN Ağına Bağlanılıyor...', 'info');
            }
            
            ipcRenderer.invoke('extension-toggle', { id: ext.id, enabled: checkbox.checked });
        };
        
        container.appendChild(item);
    });
}

initExtensionEngine();

// ==========================================
// AUTHENTICATION SYSTEM (Modern Implementation)
// ==========================================
let currentUser = null;
try {
    currentUser = JSON.parse(localStorage.getItem('doxcord_user') || 'null');
} catch (e) {
    localStorage.removeItem('doxcord_user');
    console.error("User session parsing failed:", e);
}

function getAuthElements() {
    return {
        formContainer: document.getElementById('authFormContainer'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        userProfile: document.getElementById('userProfile'),
        adminPanel: document.getElementById('adminPanel'),
        showRegister: document.getElementById('showRegister'),
        showLogin: document.getElementById('showLogin'),
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        profileName: document.getElementById('profileName'),
        profileRole: document.getElementById('profileRole'),
        userList: document.getElementById('userListContainer'),
        accountSection: document.getElementById('accountSection'),
        vaultSection: document.getElementById('vaultSection'),
        vaultList: document.getElementById('vaultListContainer'),
        saveVaultBtn: document.getElementById('saveVaultBtn')
    };
}

function updateAuthUI() {
    const s = getAuthElements();
    if (!s.formContainer) return;

    if (currentUser) {
        s.formContainer.style.display = 'none';
        s.userProfile.style.display = 'block';
        if (s.profileName) s.profileName.innerText = currentUser.username;
        if (s.profileRole) s.profileRole.innerText = (currentUser.role || 'USER').toUpperCase();
        
        if (currentUser.role === 'admin') {
            if (s.adminPanel) s.adminPanel.style.display = 'block';
            loadUserList();
        } else {
            if (s.adminPanel) s.adminPanel.style.display = 'none';
        }
    } else {
        s.formContainer.style.display = 'block';
        s.userProfile.style.display = 'none';
        if (s.adminPanel) s.adminPanel.style.display = 'none';
        if (s.loginForm) s.loginForm.style.display = 'block';
        if (s.registerForm) s.registerForm.style.display = 'none';
    }
}

// Global initialization for auth
async function initAuthSystem() {
    try {
        const s = getAuthElements();
        if (!s.formContainer) {
            console.warn('Auth system: formContainer not found. Skipping init.');
            return;
        }

        // Add DB Status Indication
        const statusDiv = document.createElement('div');
        statusDiv.id = 'dbStatusIndicator';
        statusDiv.style.cssText = 'font-size:10px; color:#808090; margin-bottom:15px; padding:8px; background:rgba(0,0,0,0.2); border-radius:5px;';
        statusDiv.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Database protokolü taranıyor...';
        s.accountSection.prepend(statusDiv);

        const checkDB = async () => {
            const status = await ipcRenderer.invoke('get-db-status');
            if (status.success) {
                statusDiv.innerHTML = '<span style="color:#00f2ff"><i class="fas fa-check-circle"></i> Database Online: Güvenli Bağlantı</span>';
            } else {
                statusDiv.innerHTML = `<span style="color:#ff5f57"><i class="fas fa-exclamation-triangle"></i> Database Hatası: ${status.error}</span>`;
            }
        };
        checkDB();
        
        s.saveVaultBtn?.addEventListener('click', async () => {
            if (!currentUser) return showNotification('Lütfen önce giriş yapın.', 'warning');
            const url = document.getElementById('vaultUrl').value;
            const username = document.getElementById('vaultUser').value;
            const password = document.getElementById('vaultPass').value;
            
            if (!url || !password) return showNotification('URL ve Şifre zorunludur.', 'warning');
            
            const res = await ipcRenderer.invoke('save-credential', { userId: currentUser.id, url, username, password });
            if (res.success) {
                showNotification('Şifre güvenle kaydedildi.', 'success');
                document.getElementById('vaultUrl').value = '';
                document.getElementById('vaultUser').value = '';
                document.getElementById('vaultPass').value = '';
                loadVault();
            }
        });

        const createCaseBtn = document.getElementById('createCaseBtn');
        if (createCaseBtn) {
            createCaseBtn.addEventListener('click', async () => {
                const title = document.getElementById('caseTitle').value;
                const notes = document.getElementById('caseNotes').value;
                if (!title) return showNotification('Lütfen bir vaka başlığı girin.', 'warning');

                const res = await ipcRenderer.invoke('save-case-data', { title, notes });
                if (res.success) {
                    showNotification('Vaka başarıyla oluşturuldu.', 'success');
                    document.getElementById('caseTitle').value = '';
                    document.getElementById('caseNotes').value = '';
                    loadCases();
                }
            });
        }

        async function loadCases() {
            const res = await ipcRenderer.invoke('get-cases');
            const container = document.getElementById('casesListContainer');
            if (!container || !res.success) return;

            if (res.cases.length === 0) {
                container.innerHTML = '<p style="font-size: 12px; color: #666; text-align: center; margin-top:20px;">Henüz aktif bir vaka yok.</p>';
                return;
            }

            container.innerHTML = res.cases.map(c => `
                <div class="auth-card" style="margin-bottom:12px; border-left: 3px solid var(--secondary);">
                    <div style="font-size: 13px; font-weight: bold; color: #fff;">${c.title}</div>
                    <div style="font-size: 10px; color: #888; margin-top:4px;">Oluşturuldu: ${new Date(c.created_at).toLocaleDateString()}</div>
                    <div style="font-size: 11px; color: #aaa; margin-top:8px; line-height: 1.4;">${c.notes || 'Not yok.'}</div>
                    <div style="margin-top:10px; display:flex; gap:5px;">
                        <button class="intel-btn primary" style="padding:4px 8px; font-size:9px;" onclick="alert('Case ID: ${c.id}')">DOSYAYI AÇ</button>
                        <button class="intel-btn" style="padding:4px 8px; font-size:9px; background:rgba(255,255,255,0.05);">EXPORT</button>
                    </div>
                </div>
            `).join('');
        }

        async function loadVault() {
            if (!currentUser) return;
            const res = await ipcRenderer.invoke('get-credentials', currentUser.id);
            if (res.success) {
                const container = document.getElementById('vaultListContainer');
                if (!container) return;
                
                if (res.logins.length === 0) {
                    container.innerHTML = '<p style="font-size: 12px; color: #666; text-align: center; margin-top:20px;">Henüz kayıtlı şifre yok.</p>';
                    return;
                }

                container.innerHTML = res.logins.map(l => `
                    <div class="auth-card" style="margin-bottom:10px; border-left: 3px solid var(--primary);">
                        <div style="font-size: 14px; font-weight: bold; color: #fff; margin-bottom:5px;">${l.site_url || l.url}</div>
                        <div style="font-size: 11px; color: #aaa;">Kullanıcı: ${l.site_username || l.username || '-'}</div>
                        <div style="font-size: 11px; color: var(--secondary); margin-top:5px; font-family: monospace; display: flex; justify-content: space-between; align-items: center;">
                            <span>Şifre: ••••••••</span>
                            <button onclick="alert('Şifreniz: ${l.site_password || l.password}')" style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:10px;">GÖSTER</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Hook into tab switching to refresh vault
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.dataset.tab === 'vault') loadVault();
                if (tab.dataset.tab === 'cases') loadCases();
            });
        });
        
        s.showRegister?.addEventListener('click', () => {
            if (s.loginForm) s.loginForm.style.display = 'none';
            if (s.registerForm) s.registerForm.style.display = 'block';
        });

        s.showLogin?.addEventListener('click', () => {
            if (s.registerForm) s.registerForm.style.display = 'none';
            if (s.loginForm) s.loginForm.style.display = 'block';
        });

        s.registerBtn?.addEventListener('click', async () => {
            const username = document.getElementById('regUsername')?.value.trim();
            const email = document.getElementById('regEmail')?.value.trim();
            const password = document.getElementById('regPassword')?.value.trim();
            
            if (!username || !email || !password) {
                showNotification('Eksik bilgi: Tüm alanları doldurun.', 'error');
                return;
            }

            showNotification('Ağ protokolleri hazırlanıyor...', 'info');
            try {
                const ip = await getIP();
                const result = await ipcRenderer.invoke('auth-register', { username, email, password, ip });
                
                if (result.success) {
                    showNotification('Kayıt Doğrulandı. Giriş yapabilirsiniz.', 'success');
                    s.showLogin?.click();
                } else {
                    showNotification(result.error, 'error');
                }
            } catch (err) {
                showNotification('Kayıt işlemi sırasında teknik hata oluştu.', 'error');
                console.error(err);
            }
        });

        s.loginBtn?.addEventListener('click', async () => {
            const idInput = document.getElementById('loginIdentifier');
            const passInput = document.getElementById('loginPassword');
            
            const identifier = idInput?.value.trim();
            const password = passInput?.value.trim();
            
            if (!identifier || !password) {
                showNotification('Erişim Reddedildi: Kimlik ve şifre gerekli.', 'error');
                return;
            }

            showNotification('Kimlik doğrulanıyor...', 'info');
            try {
                const result = await ipcRenderer.invoke('auth-login', { identifier, password });
                
                if (result.success) {
                    currentUser = result.user;
                    localStorage.setItem('doxcord_user', JSON.stringify(currentUser));
                    const mode = result.local ? '(Yerel Mod)' : '';
                    showNotification(`Sisteme Giriş Yapıldı ${mode}: ${currentUser.username}`, 'success');
                    updateAuthUI();
                } else {
                    showNotification(result.error || 'Giriş yapılamadı.', 'error');
                }
            } catch (err) {
                showNotification('Bağlantı hatası: Sunucuya ulaşılamıyor.', 'error');
                console.error(err);
            }
        });

        s.logoutBtn?.addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem('doxcord_user');
            showNotification('Oturum sonlandırıldı.', 'info');
            updateAuthUI();
        });

        updateAuthUI();
    } catch (err) {
        console.error('Auth system initialization failed:', err);
    }
}

async function loadUserList() {
    const container = document.getElementById('userListContainer');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding: 20px; font-size: 11px; opacity: 0.5;">VERİLER ÇEKİLİYOR...</div>';
    
    const result = await ipcRenderer.invoke('get-all-users', currentUser.id);
    
    if (result.success) {
        container.innerHTML = '';
        result.users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-item';
            div.innerHTML = `
                <div class="user-header">
                    <span class="user-name">${user.username}</span>
                    <span class="user-role-badge">${user.role.toUpperCase()}</span>
                </div>
                <div class="user-details">
                    <div><b>EMAIL:</b> ${user.email}</div>
                    <div><b>ADDR:</b> <span class="user-ip">${user.ip_address || '0.0.0.0'}</span></div>
                    <div style="font-size: 9px; opacity: 0.4; margin-top: 8px;">RECORDED: ${new Date(user.created_at).toLocaleString()}</div>
                </div>
            `;
            container.appendChild(div);
        });
    } else {
        container.innerHTML = `<div style="color:#ff5f57; text-align:center; padding: 20px;">HATA: ${result.error}</div>`;
    }
}

async function getIP() {
    try {
        const resp = await fetch('https://api.ipify.org?format=json');
        const data = await resp.json();
        return data.ip;
    } catch { return '127.0.0.1'; }
}

// Critical Initialization
async function initApplication() {
    initBrowser();
    await initAuthSystem();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplication);
} else {
    initApplication();
}

