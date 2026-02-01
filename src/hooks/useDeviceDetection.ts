'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    userAgent: string;
}

export function useDeviceDetection(): DeviceInfo {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isIOS: false,
        isAndroid: false,
        userAgent: ''
    });

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';

        // Check for mobile devices
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const tabletRegex = /iPad|Android(?!.*Mobile)/i;
        const iOSRegex = /iPhone|iPad|iPod/i;
        const androidRegex = /Android/i;

        const isMobile = mobileRegex.test(userAgent);
        const isTablet = tabletRegex.test(userAgent);
        const isIOS = iOSRegex.test(userAgent);
        const isAndroid = androidRegex.test(userAgent);

        setDeviceInfo({
            isMobile,
            isTablet,
            isDesktop: !isMobile && !isTablet,
            isIOS,
            isAndroid,
            userAgent
        });
    }, []);

    return deviceInfo;
}

export default useDeviceDetection;
