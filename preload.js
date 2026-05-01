const { contextBridge, ipcRenderer } = require('electron');

// ==========================================
// ANTI-FINGERPRINTING ENGINE (STEALTH MODE)
// ==========================================

// 1. Canvas Spoofing (Noise Injection)
const injectNoise = (ctx) => {
    const imageData = ctx.getImageData(0, 0, 10, 10);
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = imageData.data[i] + (Math.random() > 0.5 ? 1 : -1);
    }
    ctx.putImageData(imageData, 0, 0);
};

// Override Canvas prototype
const wrap = (target) => {
    const original = HTMLCanvasElement.prototype[target];
    HTMLCanvasElement.prototype[target] = function() {
        const ctx = this.getContext('2d');
        if (ctx) injectNoise(ctx);
        return original.apply(this, arguments);
    };
};
wrap('toDataURL');
wrap('toBlob');

// 2. Hardware Signature Masking
Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
Object.defineProperty(navigator, 'platform', { get: () => 'Win32' }); // Decoy platform

// 3. WebGL Spoofing
const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
WebGLRenderingContext.prototype.getParameter = function(parameter) {
    // Unmask renderer info (common tracking point)
    if (parameter === 37445) return 'Intel Open Source Technology Center';
    if (parameter === 37446) return 'Mesa DRI Intel(R) Sandybridge Desktop';
    return originalGetParameter.apply(this, arguments);
};

// 4. Timezone & Locale Decoy
// Note: Some attributes are read-only, but we can override Intl
const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
Intl.DateTimeFormat.prototype.resolvedOptions = function() {
    const options = originalResolvedOptions.apply(this, arguments);
    options.timeZone = 'UTC';
    return options;
};

console.log('[DOXCORD STEALTH] Anti-Fingerprinting Active.');

// ==========================================
// CASE MANAGEMENT INTERFACE
// ==========================================
contextBridge.exposeInMainWorld('doxcord', {
    saveCaseData: (data) => ipcRenderer.invoke('save-case-data', data),
    getCaseData: () => ipcRenderer.invoke('get-case-data'),
    exportIntelligence: (type) => ipcRenderer.invoke('export-intelligence', type)
});
