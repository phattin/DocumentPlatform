import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Upload, User, LogIn, LogOut, BookOpen, Home } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";

import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <span className="text-xl font-bold tracking-tight">EduShare</span>
          </Link>

          {/* MENU */}
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

          {/* USER AREA */}
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

                {/* AVATAR BUTTON */}
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="flex items-center gap-3 hover:bg-white/5 rounded-full px-3 py-1 transition"
                >
                  <img
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${user.displayName || user.email}`
                    }
                    alt="avatar"
                    className="w-9 h-9 rounded-full border border-white/10"
                  />

                  <span className="text-sm text-slate-200 hidden sm:block">
                    {user.displayName || user.email}
                  </span>
                </button>

                {/* DROPDOWN */}
                {openMenu && (
                  <div className="absolute right-0 mt-3 w-52 rounded-xl bg-[#12141F] border border-white/10 shadow-xl overflow-hidden">

                    <Link to="/profile">
                      <div className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-2">
                        <User size={16} />
                        Hồ sơ
                      </div>
                    </Link>

                    <Link to="/my-documents">
                      <div className="px-4 py-3 hover:bg-white/5 cursor-pointer">
                        Tài liệu của tôi
                      </div>
                    </Link>

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