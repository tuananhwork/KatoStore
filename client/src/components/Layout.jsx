import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--color-bg-alt))]">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-50">
          <Header />
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
