/**
 * API Configuration for different environments
 *
 * --- DÙNG TUNNEL (khác máy, khác mạng đều chạy được) ---
 * 1. Backend: cd BE/FromFromptToFE && dotnet run
 * 2. Tunnel:  npx localtunnel --port 5274 --subdomain fptfe
 *    → URL cố định: https://fptfe.loca.lt (nếu bị trùng subdomain thì đổi --subdomain khác và sửa bên dưới)
 * 3. FE .env: VITE_API_BASE_URL=https://fptfe.loca.lt/
 * 4. MO: giữ API_URL_OVERRIDE như bên dưới (hoặc null để dùng IP cùng WiFi)
 *
 * --- DÙNG IP (cùng WiFi) ---
 * Set API_URL_OVERRIDE = null và đổi MACHINE_IP cho đúng máy bạn.
 */

const MACHINE_IP = "192.168.1.4";

/** npx expo start --web → dùng localhost:5274 giống FE */
const USE_LOCALHOST_FOR_WEB = false;

/** Tunnel: dùng URL cố định (chạy localtunnel với --subdomain fptfe). Set null để dùng IP (REAL_DEVICE). */
const API_URL_OVERRIDE = "https://fptfe5274.loca.lt";

export const API_CONFIG = {
    // For Android Emulator
    EMULATOR: "http://10.0.2.2:5274",
    
    // For Real Device (use your machine IP)
    REAL_DEVICE: `http://${MACHINE_IP}:5274`,
    
    // Request timeout in milliseconds
    TIMEOUT: 15000,
};

/**
 * Auto-detect which API URL to use
 * You can manually override by setting USE_EMULATOR = true or false
 */
export const USE_EMULATOR = false; // Set to true if using Android Emulator

export const getAPIUrl = () => {
    if (API_URL_OVERRIDE) return API_URL_OVERRIDE.replace(/\/$/, "");
    if (USE_LOCALHOST_FOR_WEB) return "http://localhost:5274";
    return USE_EMULATOR ? API_CONFIG.EMULATOR : API_CONFIG.REAL_DEVICE;
};

// Export the API URL based on configuration
export const API_URL = getAPIUrl();
