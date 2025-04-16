import React from 'react';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';

const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Header />
      <main>
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardPage;