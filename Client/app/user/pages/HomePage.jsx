import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Clock, Star, Download, User, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../../user/components/input';
import { Button } from '../../user/components/button';
import { Badge } from '../../user/components/badge';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const trendingTags = [
    'Toán cao cấp',
    'Lập trình C++',
    'Vật lý đại cương',
    'Tiếng Anh',
    'Cấu trúc dữ liệu',
    'Machine Learning',
  ];

  const featuredDocs = [
    {
      id: 1,
      title: 'Giáo trình Toán Cao Cấp A1',
      subject: 'Toán học',
      author: 'Nguyễn Văn A',
      downloads: 1234,
      rating: 4.8,
      tags: ['Toán', 'Đại số'],
      uploadDate: '2 ngày trước',
    },
    {
      id: 2,
      title: 'Lập trình hướng đối tượng với Java',
      subject: 'Lập trình',
      author: 'Trần Thị B',
      downloads: 987,
      rating: 4.9,
      tags: ['Java', 'OOP'],
      uploadDate: '1 tuần trước',
    },
    {
      id: 3,
      title: 'Cơ sở dữ liệu quan hệ',
      subject: 'Công nghệ thông tin',
      author: 'Lê Văn C',
      downloads: 756,
      rating: 4.7,
      tags: ['SQL', 'Database'],
      uploadDate: '3 ngày trước',
    },
  ];

  const subjects = [
    { name: 'Toán học', count: 234, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'Lập trình', count: 189, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Vật lý', count: 156, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { name: 'Hóa học', count: 143, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 hero-glow">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="hero-title">
              Chia sẻ tri thức,
              <br />
              <span className="text-primary">Kết nối tương lai</span>
            </h1>
            <p className="text-lg text-slate-300 mb-12 leading-relaxed">
              Nền tảng chia sẻ tài liệu học tập hàng đầu dành cho sinh viên
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="glass-panel rounded-2xl p-2">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-slate-400 ml-4" strokeWidth={1.5} />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm tài liệu theo tên, môn học, hoặc tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-slate-500 h-12"
                    data-testid="hero-search-input"
                  />
                  <Button
                    className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12"
                    data-testid="hero-search-btn"
                  >
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </div>

            {/* Trending Tags */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-slate-500 uppercase tracking-widest mr-2">Xu hướng:</span>
              {trendingTags.map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer transition-all hover:scale-105"
                    data-testid={`trending-tag-${index}`}
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subject Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2" data-testid="subjects-heading">Môn học</h2>
              <p className="text-slate-400">Khám phá tài liệu theo chuyên ngành</p>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {subjects.map((subject) => (
              <motion.div key={subject.name} variants={itemVariants}>
                <div
                  className={`group relative overflow-hidden rounded-2xl border p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${subject.color}`}
                  data-testid={`subject-${subject.name.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{subject.name}</h3>
                      <p className="text-sm opacity-70">{subject.count} tài liệu</p>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Documents */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2" data-testid="featured-heading">Tài liệu nổi bật</h2>
              <p className="text-slate-400">Tài liệu được đánh giá cao nhất</p>
            </div>
            <Link to="/search">
              <Button variant="ghost" className="rounded-full text-primary hover:bg-white/5" data-testid="view-all-btn">
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </Button>
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredDocs.map((doc, index) => (
              <motion.div key={doc.id} variants={itemVariants}>
                <Link to={`/document/${doc.id}`}>
                  <div
                    className="group relative overflow-hidden rounded-2xl bg-[#12141F] border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] h-full"
                    data-testid={`featured-doc-${index}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" strokeWidth={1.5} />
                          <Badge variant="secondary" className="rounded-full text-xs">
                            {doc.subject}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{doc.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <User className="w-4 h-4" strokeWidth={1.5} />
                        <span>{doc.author}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {doc.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="rounded-full text-xs border-white/10 text-slate-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Download className="w-4 h-4" strokeWidth={1.5} />
                          <span>{doc.downloads}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Clock className="w-4 h-4" strokeWidth={1.5} />
                          <span>{doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="glass-panel rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="cta-heading">
              Bạn có tài liệu hữu ích?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Chia sẻ kiến thức của bạn với cộng đồng sinh viên và giúp người khác học tập tốt hơn
            </p>
            <Link to="/upload">
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-10 py-6 text-lg shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all hover:scale-105 active:scale-95"
                data-testid="cta-upload-btn"
              >
                Tải tài liệu lên ngay
                <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;