'use client'

import Script from "next/script";

export default function GoogleTag() {
    return <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-1HKSM7RXGL"
        async
        onLoad={() => {
            (window as any).dataLayer = (window as any).dataLayer || [];
            function gtag() { (window as any).dataLayer.push(arguments); }
            (gtag as any)('js', new Date());
            (gtag as any)('config', 'G-1HKSM7RXGL');
        }}
    />
}