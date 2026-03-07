import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Upload, User, LogIn, BookOpen, Home } from 'lucide-react';
import { Button } from './button';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navItems = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Tìm kiếm', path: '/search', icon: Search },
    { name: 'Tải lên', path: '/upload', icon: Upload },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0B0C15]/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <BookOpen className="w-8 h-8 text-primary relative" strokeWidth={1.5} />
            </div>
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
                    className={`rounded-full transition-colors ${
                      isActive ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link to="/profile">
                <Button
                  variant="ghost"
                  className="rounded-full text-slate-400 hover:text-white hover:bg-white/5"
                  data-testid="nav-profile-btn"
                >
                  <User className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button
                  className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95"
                  data-testid="nav-login-btn"
                >
                  <LogIn className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};