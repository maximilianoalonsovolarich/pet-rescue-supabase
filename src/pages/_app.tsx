import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Poppins } from 'next/font/google';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/MainLayout';
import AdminLayout from '@/components/layouts/AdminLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import Head from 'next/head';

// Configure Poppins font
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <>
      <Head>
        <title>Pet Rescue - Ayuda a mascotas callejeras</title>
        <meta name="description" content="Aplicación para ayudar a mascotas callejeras o perdidas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <style jsx global>{`
        html {
          font-family: ${poppins.style.fontFamily};
        }
      `}</style>
      <CustomThemeProvider>
        <AuthProvider>
          {isAdminPage ? (
            <AdminLayout>
              <Component {...pageProps} />
            </AdminLayout>
          ) : (
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          )}
        </AuthProvider>
      </CustomThemeProvider>
    </>
  );
}
