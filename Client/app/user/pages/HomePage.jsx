import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Clock, Star, Download, User, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../../user/components/input';
import { Button } from '../../user/components/button';
import { Badge } from '../../user/components/badge';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDocs, setFeaturedDocs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Lấy dữ liệu thật từ Firestore
  useEffect(() => {
    const fetchFeaturedDocs = async () => {
      try {
        setLoading(true);
        // Lấy 6 docs mới nhất, sắp xếp theo createdAt
        const q = query(
          collection(db, "documents"),
          orderBy("createdAt", "desc"),
          limit(6)
        );
        const querySnapshot = await getDocs(q);
        
        const docs = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            subject: data.subject || 'Khác',
            author: data.authorName || 'Anonymous',
            downloads: data.downloads || 0,
            rating: data.rating || 4.5,
            tags: data.tags || [],
            uploadDate: data.createdAt 
              ? formatTimeAgo(data.createdAt.toDate()) 
              : 'Vừa xong',
            downloadURL: data.downloadURL,
            fileSize: data.fileSize || 0,
          };
        });

        setFeaturedDocs(docs);

        // 🔥 Tính toán subjects từ data thật
        const subjectCount = {};
        docs.forEach(doc => {
          const subject = doc.subject;
          subjectCount[subject] = (subjectCount[subject] || 0) + 1;
        });

        const topSubjects = Object.entries(subjectCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 4)
          .map(([name, count]) => ({
            name,
            count,
            color: getSubjectColor(name),
          }));

        setSubjects(topSubjects);

        // 🔥 Trending tags từ data thật (top 6)
        const allTags = [];
        docs.forEach(doc => doc.tags.forEach(tag => allTags.push(tag)));
        const tagCounts = {};
        allTags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        const topTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 6)
          .map(([tag]) => tag);

        setTrendingTags(topTags);

      } catch (error) {
        console.error("❌ Lỗi load docs:", error);
        // Fallback data nếu lỗi
        setFeaturedDocs([
          {
            id: 'fallback',
            title: 'Chưa có tài liệu nào',
            subject: 'Tất cả',
            author: 'Hệ thống',
            downloads: 0,
            rating: 5.0,
            tags: [],
            uploadDate: 'Tải lên tài liệu đầu tiên!',
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDocs();

    // Refresh data mỗi 30s
    const interval = setInterval(fetchFeaturedDocs, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Format thời gian
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays/7)} tuần trước`;
    return `${Math.floor(diffDays/30)} tháng trước`;
  };

  // 🔥 Màu cho từng subject
  const getSubjectColor = (subject) => {
    const colors = {
      'Toán học': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Lập trình': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Vật lý': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Hóa học': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'default': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return colors[subject] || colors.default;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải tài liệu...</p>
        </div>
      </div>
    );
  }

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

            {/* Trending Tags từ data thật */}
            {trendingTags.length > 0 && (
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
            )}
          </motion.div>
        </div>
      </section>

      {/* Subject Categories từ data thật */}
      {subjects.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2" data-testid="subjects-heading">Môn học phổ biến</h2>
                <p className="text-slate-400">Dựa trên tài liệu mới nhất</p>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {subjects.map((subject, index) => (
                <motion.div key={index} variants={itemVariants}>
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
      )}

      {/* Featured Documents từ Firestore */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2" data-testid="featured-heading">Tài liệu mới nhất</h2>
              <p className="text-slate-400">
                {featuredDocs.length} tài liệu • Cập nhật realtime
              </p>
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
            {featuredDocs.map((doc) => (
              <motion.div key={doc.id} variants={itemVariants}>
                <Link to={`/document/${doc.id}`}>
                  <div
                    className="group relative overflow-hidden rounded-2xl bg-[#12141F] border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] h-full"
                    data-testid={`featured-doc-${doc.id}`}
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
                          <span className="text-sm font-medium">{doc.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {doc.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <User className="w-4 h-4" strokeWidth={1.5} />
                        <span>{doc.author}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {doc.tags.slice(0, 2).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="rounded-full text-xs border-white/10 text-slate-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs border-white/10 text-slate-400">
                            +{doc.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Download className="w-4 h-4" strokeWidth={1.5} />
                          <span>{doc.downloads.toLocaleString()}</span>
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
