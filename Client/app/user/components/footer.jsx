import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Github, Mail, Facebook } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-24 border-t border-white/5 bg-[#0B0C15]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Logo + description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <span className="text-lg font-semibold">EduShare</span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              Nền tảng chia sẻ tài liệu học tập dành cho sinh viên.
              Tìm kiếm, tải lên và khám phá các tài liệu hữu ích từ cộng đồng.
            </p>
          </div>
          
          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              Điều hướng
            </h3>

            <div className="flex flex-col gap-2 text-sm">
              <Link to="/" className="text-slate-400 hover:text-white transition">
                Trang chủ
              </Link>

              <Link to="/search" className="text-slate-400 hover:text-white transition">
                Tìm kiếm tài liệu
              </Link>

              <Link to="/upload" className="text-slate-400 hover:text-white transition">
                Tải lên tài liệu
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              Liên hệ
            </h3>

            <div className="flex items-center gap-4 text-slate-400">

              <a
                href="#"
                className="hover:text-white transition"
              >
                <Mail className="w-5 h-5" />
              </a>

              <a
                href="#"
                className="hover:text-white transition"
              >
                <Github className="w-5 h-5" />
              </a>

              <a
                href="#"
                className="hover:text-white transition"
              >
                <Facebook className="w-5 h-5" />
              </a>

            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} EduShare. All rights reserved.
        </div>
      </div>
    </footer>
  );
};