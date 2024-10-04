// Components/Layout.js
import React from 'react';
import Sidebar from './sidebar';
import Footer from './footer';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
