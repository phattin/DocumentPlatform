import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../../user/components/input';
import { Button } from '../../user/components/button';
import { Label } from '../../user/components/label';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <BookOpen className="w-12 h-12 text-primary relative" strokeWidth={1.5} />
            </div>
            <span className="text-3xl font-bold tracking-tight">EduShare</span>
          </div>
          <h1 className="text-4xl font-bold mb-4" data-testid="login-welcome-title">
            Chào mừng trở lại
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Đăng nhập để tiếp tục chia sẻ và khám phá hàng ngàn tài liệu học tập chất lượng từ cộng đồng sinh viên
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center">
                <span className="text-primary font-bold">1K+</span>
              </div>
              <div>
                <p className="font-medium">Tài liệu</p>
                <p className="text-sm text-slate-400">Đa dạng môn học</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center">
                <span className="text-primary font-bold">500+</span>
              </div>
              <div>
                <p className="font-medium">Sinh viên</p>
                <p className="text-sm text-slate-400">Cộng đồng sôi động</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-panel rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl font-bold mb-2" data-testid="login-form-title">Đăng nhập</h2>
            <p className="text-slate-400 mb-8">Nhập thông tin tài khoản của bạn</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white"
                    required
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white"
                    required
                    data-testid="login-password-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/10" />
                  <span className="text-slate-400">Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-medium h-12 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95"
                data-testid="login-submit-btn"
              >
                Đăng nhập
                <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium" data-testid="register-link">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;