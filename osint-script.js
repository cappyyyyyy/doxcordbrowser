// OSINT Panel JavaScript

// Close button
document.getElementById('closeOsint')?.addEventListener('click', () => {
    window.close();
});

// Dork Type Selector
document.querySelectorAll('.dork-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.dork-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const type = btn.dataset.type;
        document.getElementById('usernameDork').classList.toggle('hidden', type !== 'username');
        document.getElementById('webDork').classList.toggle('hidden', type !== 'web');
    });
});

// Username Dork
const usernameInput = document.getElementById('usernameInput');
const usernameDorkPreview = document.getElementById('usernameDorkPreview');

usernameInput?.addEventListener('input', () => {
    const username = usernameInput.value.trim();
    const dork = username ? `allintext:"${username}"` : 'allintext:"username"';
    usernameDorkPreview.textContent = dork;
});

document.getElementById('usernameSearch')?.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) {
        showNotification('Please enter a username', 'error');
        return;
    }
    
    const dork = `allintext:"${username}"`;
    const searchUrl = `https://duckduckgo.com/?kae=d&q=${encodeURIComponent(dork)}`;
    window.open(searchUrl, '_blank');
    showNotification('Opening Google search...', 'success');
});

// Web Dork
const webDorkType = document.getElementById('webDorkType');
const webDorkInput = document.getElementById('webDorkInput');
const webDorkPreview = document.getElementById('webDorkPreview');

function updateWebDorkPreview() {
    const type = webDorkType.value;
    const input = webDorkInput.value.trim() || 'example.com';
    
    const dorks = {
        'site': `site:${input}`,
        'filetype': `filetype:${input}`,
        'inurl': `inurl:${input}`,
        'intitle': `intitle:${input}`,
        'intext': `intext:${input}`,
        'cache': `cache:${input}`,
        'related': `related:${input}`
    };
    
    webDorkPreview.textContent = dorks[type] || `site:${input}`;
}

webDorkType?.addEventListener('change', updateWebDorkPreview);
webDorkInput?.addEventListener('input', updateWebDorkPreview);

document.getElementById('webDorkSearch')?.addEventListener('click', () => {
    const input = webDorkInput.value.trim();
    if (!input) {
        showNotification('Please enter a search term', 'error');
        return;
    }
    
    const dork = webDorkPreview.textContent;
    const searchUrl = `https://duckduckgo.com/?kae=d&q=${encodeURIComponent(dork)}`;
    window.open(searchUrl, '_blank');
    showNotification('Opening Google search...', 'success');
});

// API Tabs
document.querySelectorAll('.api-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.api-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.api-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        document.getElementById(`${tabName}Panel`).classList.remove('hidden');
    });
});

// Email Search
document.getElementById('emailSearch')?.addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value.trim();
    const apiType = document.getElementById('emailApiType').value;
    
    if (!email) {
        showNotification('Please enter an email address', 'error');
        return;
    }
    
    await performSearch(apiType, email, 'Email');
});

// Username API Search
document.getElementById('usernameApiSearch')?.addEventListener('click', async () => {
    const username = document.getElementById('usernameApiInput').value.trim();
    const apiType = document.getElementById('usernameApiType').value;
    
    if (!username) {
        showNotification('Please enter a username', 'error');
        return;
    }
    
    await performSearch(apiType, username, 'Username');
});

// IP/Domain Search
document.getElementById('ipSearch')?.addEventListener('click', async () => {
    const ip = document.getElementById('ipInput').value.trim();
    const apiType = document.getElementById('ipApiType').value;
    
    if (!ip) {
        showNotification('Please enter an IP or domain', 'error');
        return;
    }
    
    await performSearch(apiType, ip, 'IP/Domain');
});

// Leak Search
document.getElementById('leakSearch')?.addEventListener('click', async () => {
    const input = document.getElementById('leakInput').value.trim();
    const apiType = document.getElementById('leakApiType').value;
    
    if (!input) {
        showNotification('Please enter an email or password', 'error');
        return;
    }
    
    await performSearch(apiType, input, 'Data Breach');
});

// Social Search
document.getElementById('socialSearch')?.addEventListener('click', async () => {
    const input = document.getElementById('socialInput').value.trim();
    const apiType = document.getElementById('socialApiType').value;
    
    if (!input) {
        showNotification('Please enter an email or username', 'error');
        return;
    }
    
    await performSearch(apiType, input, 'Social Media');
});

// Perform API Search
async function performSearch(apiType, input, category) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Show loading
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <span>Searching ${category}...</span>
        </div>
    `;
    
    try {
        const result = await callOSINTAPI(apiType, input);
        displayResults(result, apiType, input, category);
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="result-item">
                <div class="result-header">
                    <span class="result-title">Error</span>
                    <span class="result-badge danger">FAILED</span>
                </div>
                <div class="result-content">
                    ${error.message || 'An error occurred during the search'}
                </div>
            </div>
        `;
    }
}

// Call OSINT API (simulated - replace with actual API calls)
async function callOSINTAPI(apiType, input) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulated responses based on API type
    const responses = {
        'leak_leakcheck': {
            found: true,
            sources: ['Collection #1', 'LinkedIn 2021', 'Facebook 2019'],
            count: 3
        },
        'email_hibp': {
            breached: true,
            breaches: ['Adobe', 'LinkedIn', 'Dropbox'],
            pastes: 2
        },
        'username_github': {
            login: input,
            name: 'John Doe',
            public_repos: 42,
            followers: 128,
            created_at: '2015-03-15'
        },
        'ip_info': {
            ip: input,
            country: 'United States',
            city: 'New York',
            isp: 'Example ISP',
            vpn: false
        },
        'pwned_pass': {
            pwned_count: Math.floor(Math.random() * 10000),
            status: Math.random() > 0.5 ? 'COMPROMISED' : 'SAFE'
        }
    };
    
    return responses[apiType] || { message: 'API response simulated', input: input };
}

// Display Results
function displayResults(data, apiType, input, category) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    let html = `
        <div class="result-item">
            <div class="result-header">
                <span class="result-title">${category} Search Results</span>
                <span class="result-badge">${apiType.toUpperCase()}</span>
            </div>
            <div class="result-content">
                <strong>Query:</strong> ${input}<br><br>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    showNotification('Search completed!', 'success');
}

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
        top: 20px;
        right: 20px;
        padding: 14px 20px;
        background: rgba(20, 20, 26, 0.95);
        border: 1px solid ${colors[type]};
        border-left: 4px solid ${colors[type]};
        color: #e0e0e0;
        font-family: 'Inter', sans-serif;
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

// Add animations
const style = document.createElement('style');
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
