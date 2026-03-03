import React from 'react';
import './app.css';   // đổi luôn dòng này, đừng dùng @
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import SearchPage from './pages/SearchPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import MyDocumentsPage from './pages/MyDocumentsPage';
import ProfilePage from './pages/ProfilePage';

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
    </div>
  );
}

export default App;