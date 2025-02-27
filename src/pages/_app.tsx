import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Apply custom styles for authenticated pages
  useEffect(() => {
    document.body.classList.toggle('authenticated', router.pathname !== '/login' && router.pathname !== '/register');
  }, [router.pathname]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Pet Rescue</title>
        <meta name="description" content="Aplicación para ayudar a mascotas callejeras a encontrar un hogar" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <CustomThemeProvider>
          <Component {...pageProps} />
        </CustomThemeProvider>
      </AuthProvider>
    </>
  );
}
