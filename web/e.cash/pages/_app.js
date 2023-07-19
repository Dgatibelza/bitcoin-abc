// Copyright (c) 2023 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.
import Script from 'next/script';
import { ThemeProvider } from 'styled-components';
import { ecash } from '/styles/theme';
import GlobalCSS from '/styles/global';

export default function App({ Component, pageProps }) {
    return (
        <ThemeProvider theme={ecash}>
            <GlobalCSS />
            <Component {...pageProps} />
            <Script
                strategy="lazyOnload"
                id="google-analytics1"
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            />
            <Script id="google-analytics2" strategy="lazyOnload">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
                    page_path: window.location.pathname,
                    });
                `}
            </Script>
        </ThemeProvider>
    );
}
