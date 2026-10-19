import Script from "next/script";

const GA_ID = 'G-1HKSM7RXGL'

// Google's snippet: the queue and the global `gtag` exist before the loader runs, which reads them.
export default function GoogleTag() {
    return <>
        <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
    </>
}
