import React, { useState } from 'react';
import { Search, Filter, SortDesc, FileText, Star, Download, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../../user/components/input';
import { Button } from '../../user/components/button';
import { Badge } from '../../user/components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../user/components/select';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  const subjects = [
    'Tất cả',
    'Toán học',
    'Vật lý',
    'Hóa học',
    'Lập trình',
    'Tiếng Anh',
  ];

  const sortOptions = [
    { value: 'recent', label: 'Mới nhất' },
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'rating', label: 'Đánh giá cao' },
    { value: 'downloads', label: 'Lượt tải' },
  ];

  const documents = [
    {
      id: 1,
      title: 'Giáo trình Toán Cao Cấp A1',
      subject: 'Toán học',
      author: 'Nguyễn Văn A',
      downloads: 1234,
      rating: 4.8,
      tags: ['Toán', 'Đại số', 'Cao cấp'],
      uploadDate: '2 ngày trước',
      description: 'Tài liệu tổng hợp về giải tích và đại số tuyến tính',
    },
    {
      id: 2,
      title: 'Lập trình hướng đối tượng với Java',
      subject: 'Lập trình',
      author: 'Trần Thị B',
      downloads: 987,
      rating: 4.9,
      tags: ['Java', 'OOP', 'Lập trình'],
      uploadDate: '1 tuần trước',
      description: 'Hướng dẫn chi tiết về lập trình OOP với Java',
    },
    {
      id: 3,
      title: 'Cơ sở dữ liệu quan hệ',
      subject: 'Công nghệ thông tin',
      author: 'Lê Văn C',
      downloads: 756,
      rating: 4.7,
      tags: ['SQL', 'Database', 'RDBMS'],
      uploadDate: '3 ngày trước',
      description: 'Nguyên lý và thiết kế cơ sở dữ liệu quan hệ',
    },
    {
      id: 4,
      title: 'Cấu trúc dữ liệu và giải thuật',
      subject: 'Lập trình',
      author: 'Phạm Văn D',
      downloads: 892,
      rating: 4.6,
      tags: ['DSA', 'Algorithm', 'C++'],
      uploadDate: '5 ngày trước',
      description: 'Tài liệu về cấu trúc dữ liệu và giải thuật cơ bản',
    },
    {
      id: 5,
      title: 'Vật lý đại cương 1',
      subject: 'Vật lý',
      author: 'Hoàng Thị E',
      downloads: 654,
      rating: 4.5,
      tags: ['Vật lý', 'Cơ học'],
      uploadDate: '1 tuần trước',
      description: 'Giáo trình vật lý đại cương phần cơ học',
    },
    {
      id: 6,
      title: 'Ngôn ngữ lập trình Python',
      subject: 'Lập trình',
      author: 'Vũ Văn F',
      downloads: 1100,
      rating: 4.8,
      tags: ['Python', 'Programming', 'Beginner'],
      uploadDate: '4 ngày trước',
      description: 'Hướng dẫn Python từ cơ bản đến nâng cao',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-6" data-testid="search-page-title">Tìm kiếm tài liệu</h1>

          {/* Search Bar */}
          <div className="glass-panel rounded-2xl p-2 mb-6">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400 ml-4" strokeWidth={1.5} />
              <Input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-slate-500 h-12"
                data-testid="search-input"
              />
              <Button
                className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12"
                data-testid="search-btn"
              >
                Tìm
              </Button>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              data-testid="filter-toggle-btn"
            >
              <Filter className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Bộ lọc
            </Button>

            <div className="flex items-center gap-2">
              <SortDesc className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sắp xếp" />
                </SelectTrigger>

                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />
            <p className="text-slate-400 text-sm" data-testid="results-count">
              Tìm thấy <span className="font-semibold text-white">{documents.length}</span> tài liệu
            </p>
          </div>

          {/* Subject Filter Pills */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 flex flex-wrap gap-2"
            >
              {subjects.map((subject, index) => (
                <Badge
                  key={subject}
                  variant={selectedSubject === subject ? 'default' : 'secondary'}
                  className={`rounded-full cursor-pointer transition-all ${selectedSubject === subject
                    ? 'bg-primary text-white'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
                    }`}
                  onClick={() => setSelectedSubject(subject)}
                  data-testid={`filter-subject-${index}`}
                >
                  {subject}
                </Badge>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Results Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {documents.map((doc, index) => (
            <motion.div key={doc.id} variants={itemVariants}>
              <Link to={`/document/${doc.id}`}>
                <div
                  className="group relative overflow-hidden rounded-2xl bg-[#12141F] border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] h-full"
                  data-testid={`search-result-${index}`}
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

                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {doc.title}
                    </h3>

                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{doc.description}</p>

                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                      <User className="w-4 h-4" strokeWidth={1.5} />
                      <span>{doc.author}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {doc.tags.slice(0, 3).map((tag) => (
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
    </div>
  );
};

export default SearchPage;