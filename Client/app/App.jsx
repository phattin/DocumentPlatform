import React from "react";
import "./app.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "./admin/components/theme-provider";
import { Toaster } from "./admin/components/sonner";

/* USER */
import UserLayout from "./user/layouts/UserLayout";

import HomePage from "./user/pages/HomePage";
import LoginPage from "./user/pages/LoginPage";
import RegisterPage from "./user/pages/RegisterPage";
import UploadPage from "./user/pages/UploadPage";
import SearchPage from "./user/pages/SearchPage";
import DocumentDetailPage from "./user/pages/DocumentDetailPage";
import MyDocumentsPage from "./user/pages/MyDocumentsPage";
import ProfilePage from "./user/pages/ProfilePage";

/* ADMIN */
import AdminLayout from "./admin/layouts/AdminLayout";
import DashboardPage from "./admin/pages/DashboardPage";
import PostsPage from "./admin/pages/PostsPage";
import ModerationPage from "./admin/pages/ModerationPage";
import AccountsPage from "./admin/pages/AccountsPage";

/* OTHER */
import NotFoundPage from "./admin/pages/NotFoundPage";

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
    >
        <Routes>

          {/* USER SITE */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="document/:id" element={<DocumentDetailPage />} />
            <Route path="my-documents" element={<MyDocumentsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:id" element={<ProfilePage />} /> 
          </Route>

          {/* ADMIN SITE */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="accounts" element={<AccountsPage />} />
          </Route>

          {/* NOT FOUND */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      <Toaster
        richColors
        position="top-right"
        data-testid="global-toast-container"
      />
    </ThemeProvider>
  );
}

export default App;