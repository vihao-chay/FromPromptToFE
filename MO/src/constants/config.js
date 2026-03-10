/**
 * API Configuration for different environments
 * 
 * For Android Emulator: 10.0.2.2 (localhost alias)
 * For Real Device: Use your machine IP address
 * 
 * Windows: ipconfig (find IPv4 Address)
 * Mac/Linux: ifconfig or hostname -I
 */

// ⚠️ CHANGE THIS TO YOUR MACHINE IP ADDRESS
// Example: http://192.168.1.100:5274
const MACHINE_IP = "192.168.1.4"; // 👈 Your IP address

/** When running "npx expo start --web" – use same backend as FE (localhost:5274). */
const USE_LOCALHOST_FOR_WEB = false;

/** Tunnel URL (localtunnel / ngrok). Backend must be running and tunnel open (npx localtunnel --port 5274). */
const API_URL_OVERRIDE = "https://khaki-ads-boil.loca.lt";

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
