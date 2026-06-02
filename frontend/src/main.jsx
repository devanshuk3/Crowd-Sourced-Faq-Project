import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#f5f5f0',
            color: '#0a0a0a',
            borderRadius: 0,
            border: '1.5px solid #0a0a0a',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.88rem',
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
