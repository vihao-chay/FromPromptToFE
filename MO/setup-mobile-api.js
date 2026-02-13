#!/usr/bin/env node

/**
 * Mobile API Configuration Helper
 * Helps setup IP address for Expo Go on real devices
 * 
 * Run: node setup-mobile-api.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '192.168.1.1'; // Fallback
}

// Main setup function
function setupMobileAPI() {
    const localIP = getLocalIP();
    const configPath = path.join(__dirname, 'src', 'constants', 'config.js');
    
    console.log('\n🔧 Mobile API Configuration Helper\n');
    console.log(`✓ Detected Local IP: ${localIP}`);
    
    // Read current config
    try {
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // Replace IP in config
        configContent = configContent.replace(
            /const MACHINE_IP = "[^"]*"/,
            `const MACHINE_IP = "${localIP}"`
        );
        
        // Write back
        fs.writeFileSync(configPath, configContent);
        
        console.log('✓ Updated src/constants/config.js\n');
        console.log('📱 Configuration Complete!\n');
        console.log('Next steps:');
        console.log('1. Make sure backend server is running: dotnet run');
        console.log('2. Run Expo: npm start');
        console.log('3. Scan QR code with Expo Go app\n');
        console.log(`✅ API will connect to: http://${localIP}:5274\n`);
        
    } catch (error) {
        console.error('❌ Error updating config:', error.message);
        console.log('\nManual Setup:');
        console.log(`Open src/constants/config.js and set:`);
        console.log(`const MACHINE_IP = "${localIP}";\n`);
    }
}

setupMobileAPI();
