import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-alt))]">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Đã xảy ra lỗi</h1>
            <p className="text-[rgb(var(--color-text-muted))] mb-6">
              Xin lỗi, có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[rgb(var(--color-error))] text-[rgb(var(--color-bg))] px-6 py-3 rounded-lg hover:bg-[rgb(var(--color-error))]/80 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
