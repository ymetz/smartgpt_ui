import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import {NextUIProvider} from '@nextui-org/react'

import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{}>) {
  const queryClient = new QueryClient();

  return (
    <div className={inter.className}>
      <Toaster />
        <QueryClientProvider client={queryClient}>
          <NextUIProvider>
            <Component {...pageProps} />
          </NextUIProvider>
        </QueryClientProvider>
    </div>
  );
}

export default appWithTranslation(App);
