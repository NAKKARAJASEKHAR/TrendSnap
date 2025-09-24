/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';

// Extend the Window interface to include the adsbygoogle property
declare global {
    interface Window {
        adsbygoogle?: { [key: string]: unknown }[];
    }
}

const GoogleAd: React.FC = () => {
    useEffect(() => {
        // The parent component is keyed to remount on major layout changes.
        // We also wait for any CSS transitions (e.g., sidebar animation) to finish
        // before pushing the ad. The longest transition in the app is 300ms,
        // so a 350ms delay provides a safe buffer to prevent size calculation errors.
        const adTimeout = setTimeout(() => {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("Adsense error:", e);
            }
        }, 350);

        // Cleanup the timeout if the component unmounts
        return () => clearTimeout(adTimeout);
    }, []);

    return (
        <div className="w-full max-w-4xl text-center min-h-[90px]">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 // IMPORTANT: Replace with your own Ad Client ID
                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" 
                 // IMPORTANT: Replace with your own Ad Slot ID
                 data-ad-slot="YYYYYYYYYY" 
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        </div>
    );
};

export default GoogleAd;