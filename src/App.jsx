import { Toaster } from 'react-hot-toast';
import QueryProvider from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import AppRouter from './routes/router';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
