/**
 * Network Configuration Helper
 * Helps detect and configure API server connection
 */

import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

/**
 * Hook to detect local network configuration
 */
export const useNetworkConfig = () => {
    const [ipAddress, setIpAddress] = useState(null);
    const [networkType, setNetworkType] = useState(null);
    const [isLAN, setIsLAN] = useState(false);

    useEffect(() => {
        const getNetworkInfo = async () => {
            try {
                // Get IP Address
                const ip = await Network.getIpAddressAsync();
                setIpAddress(ip);

                // Check if on LAN (not localhost/127.0.0.1)
                setIsLAN(!ip.startsWith('127.') && !ip.startsWith('10.'));

                // Get network type
                const type = await Network.getNetworkStateAsync();
                setNetworkType(type.isConnected ? 'connected' : 'disconnected');
            } catch (error) {
                console.error('Network detection error:', error);
            }
        };

        getNetworkInfo();
    }, []);

    return { ipAddress, networkType, isLAN };
};

/**
 * Test API connection
 * @param {string} apiUrl - API base URL to test
 * @returns {Promise<boolean>} - true if server is reachable
 */
export const testAPIConnection = async (apiUrl) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${apiUrl}/health`, {
            method: 'GET',
            signal: controller.signal
        }).finally(() => clearTimeout(timeout));

        return response.ok || response.status === 404; // 404 is ok, means server responded
    } catch (error) {
        console.error('API connection test failed:', error.message);
        return false;
    }
};

/**
 * Suggest API URL based on network configuration
 * @param {string} deviceIP - Current device IP
 * @returns {string} - Suggested API base URL
 */
export const suggestAPIUrl = (deviceIP, port = 5274) => {
    if (!deviceIP) return null;

    // If on LAN, use first 3 octets of device IP
    const ipParts = deviceIP.split('.');
    if (ipParts.length === 4) {
        // Assume server is on same network as device
        return `http://${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.1:${port}`;
    }

    return null;
};
