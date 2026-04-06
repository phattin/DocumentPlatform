import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Upload,
  User,
  LogIn,
  LogOut,
  BookOpen,
  Home,
  ShieldCheck,
} from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";
import { signOut } from "firebase/auth";

import { auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

export const Navbar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);

  const { user, userProfile, isAdmin } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    setOpenMenu(false);
  };

  const navItems = [
    { name: "Trang chủ", path: "/", icon: Home },
    { name: "Tìm kiếm", path: "/search", icon: Search },
    { name: "Tải lên", path: "/upload", icon: Upload },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0B0C15]/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <span className="text-xl font-bold tracking-tight">EduShare</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={`rounded-full ${
                      isActive
                        ? "text-white bg-white/5"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 relative">
            {!user && (
              <Link to="/login">
                <Button className="rounded-full bg-primary text-white px-6">
                  <LogIn className="w-4 h-4 mr-2" />
                  Đăng nhập
                </Button>
              </Link>
            )}

            {user && (
              <div className="relative">
                <button
                  onClick={() => setOpenMenu((prev) => !prev)}
                  className="flex items-center gap-3 hover:bg-white/5 rounded-full px-3 py-1 transition"
                >
                  <img
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${
                        userProfile?.displayName || user.displayName || user.email
                      }`
                    }
                    alt="avatar"
                    className="w-9 h-9 rounded-full border border-white/10 object-cover"
                  />

                  <span className="text-sm text-slate-200 hidden sm:block">
                    {userProfile?.displayName || user.displayName || user.email}
                  </span>
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-[#12141F] border border-white/10 shadow-xl overflow-hidden">
                    <Link to="/profile" onClick={() => setOpenMenu(false)}>
                      <div className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-2 text-white">
                        <User size={16} />
                        Hồ sơ
                      </div>
                    </Link>

                    <Link to="/my-documents" onClick={() => setOpenMenu(false)}>
                      <div className="px-4 py-3 hover:bg-white/5 cursor-pointer text-white">
                        Tài liệu của tôi
                      </div>
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" onClick={() => setOpenMenu(false)}>
                        <div className="px-4 py-3 hover:bg-primary/10 cursor-pointer flex items-center gap-2 text-primary">
                          <ShieldCheck size={16} />
                          Quản lý tài liệu
                        </div>
                      </Link>
                    )}

                    <div
                      onClick={handleLogout}
                      className="px-4 py-3 hover:bg-red-500/20 text-red-400 cursor-pointer flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};