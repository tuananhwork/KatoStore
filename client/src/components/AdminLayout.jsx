import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({
  children,
  title,
  description,
  showHeader = true,
  showSidebar = true,
  customSidebar = null,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] print:bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:max-w-none print:px-0 print:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 print:block">
          {/* Sidebar */}
          {showSidebar && <div className="lg:col-span-1 print:hidden">{customSidebar || <AdminSidebar />}</div>}

          {/* Main Content */}
          <div className={`${showSidebar ? 'lg:col-span-3' : 'lg:col-span-4'} ${className}`}>
            {/* Page Header */}
            {showHeader && title && (
              <div className="mb-6 print:hidden">
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">{title}</h1>
                {description && <p className="text-[rgb(var(--color-text)/0.7)]">{description}</p>}
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
