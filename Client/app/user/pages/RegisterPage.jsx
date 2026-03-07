import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../../user/components/input';
import { Button } from '../../user/components/button';
import { Label } from '../../user/components/label';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => { //input, button, label, badge, textarea, avatar, tabs, select
    e.preventDefault();
    console.log('Register:', formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-6 py-12">
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
          <h1 className="text-4xl font-bold mb-4" data-testid="register-welcome-title">
            Tham gia cộng đồng
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Tạo tài khoản để bắt đầu chia sẻ và khám phá kiến thức cùng hàng ngàn sinh viên trên khắp cả nước
          </p>

          <div className="mt-12 space-y-6">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-semibold mb-2">📚 Chia sẻ tài liệu</h3>
              <p className="text-sm text-slate-400">Tải lên và chia sẻ tài liệu học tập của bạn</p>
            </div>
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-semibold mb-2">🔍 Tìm kiếm nhanh chóng</h3>
              <p className="text-sm text-slate-400">Truy cập hàng ngàn tài liệu chất lượng</p>
            </div>
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-semibold mb-2">🌟 Kết nối cộng đồng</h3>
              <p className="text-sm text-slate-400">Trao đổi, học hỏi từ cộng đồng</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Register Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-panel rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl font-bold mb-2" data-testid="register-form-title">Đăng ký tài khoản</h2>
            <p className="text-slate-400 mb-8">Tạo tài khoản mới để bắt đầu</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">
                  Họ và tên
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-12 h-12 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white"
                    required
                    data-testid="register-name-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-12 h-12 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white"
                    required
                    data-testid="register-email-input"
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
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12 h-12 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white"
                    required
                    data-testid="register-password-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-12 h-12 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white"
                    required
                    data-testid="register-confirm-password-input"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1 rounded border-white/10" required />
                <span className="text-sm text-slate-400">
                  Tôi đồng ý với{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-medium h-12 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95"
                data-testid="register-submit-btn"
              >
                Đăng ký
                <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium" data-testid="login-link">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;