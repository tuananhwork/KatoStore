import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Routes
import AppRoutes from './routes/AppRoutes.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './hooks/useAuth.jsx';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App">
          <AppRoutes />

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
