import React from 'react';
import './app.css';   // đổi luôn dòng này, đừng dùng @
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './user/components/Navbar';
import HomePage from './user/pages/HomePage';
import LoginPage from './user/pages/LoginPage';
import RegisterPage from './user/pages/RegisterPage';
import UploadPage from './user/pages/UploadPage';
import SearchPage from './user/pages/SearchPage';
import DocumentDetailPage from './user/pages/DocumentDetailPage';
import MyDocumentsPage from './user/pages/MyDocumentsPage';
import ProfilePage from './user/pages/ProfilePage';
import { Footer } from './user/components/footer';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/document/:id" element={<DocumentDetailPage />} />
        <Route path="/my-documents" element={<MyDocumentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;