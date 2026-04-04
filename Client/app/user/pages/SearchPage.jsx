import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  SortDesc,
  FileText,
  Star,
  Download,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../../user/components/input';
import { Button } from '../../user/components/button';
import { Badge } from '../../user/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../user/components/select';
import { db } from '../../lib/firebase';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';

const ITEMS_PER_PAGE = 6;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialKeyword = searchParams.get('q') || '';
  const initialSubject = searchParams.get('subject') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialKeyword);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const sortOptions = [
    { value: 'recent', label: 'Mới nhất' },
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'rating', label: 'Đánh giá cao' },
    { value: 'downloads', label: 'Lượt tải' },
  ];

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedSubject(searchParams.get('subject') || 'all');
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);

        const q = query(
          collection(db, 'documents'),
          where('status', '==', 'approved'),
          limit(100)
        );

        const snapshot = await getDocs(q);

        const docs = snapshot.docs.map((doc) => {
          const data = doc.data();
          const ratingCount = data.ratingCount || 0;
          const ratingTotal = data.ratingTotal || 0;

          return {
            id: doc.id,
            title: data.title || 'Untitled',
            subject: data.subject || 'Khác',
            author: data.authorName || 'Anonymous',
            authorId: data.authorId || '',
            downloads: data.downloads || 0,
            ratingTotal,
            ratingCount,
            rating: ratingCount > 0 ? Number((ratingTotal / ratingCount).toFixed(1)) : 0,
            tags: data.tags || [],
            description: data.description || '',
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(0),
            uploadDate: data.createdAt ? formatTimeAgo(data.createdAt.toDate()) : 'Không rõ ngày',
          };
        });

        setDocuments(docs);
      } catch (error) {
        console.error('❌ Lỗi load search docs:', error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  const normalizeText = (text) => (text || '').toString().toLowerCase().trim();

  const handleSearch = () => {
    const params = {};

    if (searchQuery.trim()) {
      params.q = searchQuery.trim();
    }

    if (selectedSubject !== 'all') {
      params.subject = selectedSubject;
    }

    setSearchParams(params);
    setCurrentPage(1);
  };

  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(
      new Set(documents.map((doc) => doc.subject).filter(Boolean))
    );

    return ['all', ...uniqueSubjects];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const keyword = normalizeText(searchParams.get('q') || '');
    const subjectFromUrl = searchParams.get('subject') || 'all';

    let result = [...documents];

    if (keyword) {
      result = result.filter((doc) => {
        const title = normalizeText(doc.title);
        const subject = normalizeText(doc.subject);
        const description = normalizeText(doc.description);
        const author = normalizeText(doc.author);
        const tags = (doc.tags || []).map(normalizeText).join(' ');

        return (
          title.includes(keyword) ||
          subject.includes(keyword) ||
          description.includes(keyword) ||
          author.includes(keyword) ||
          tags.includes(keyword)
        );
      });
    }

    if (subjectFromUrl !== 'all') {
      result = result.filter((doc) => doc.subject === subjectFromUrl);
    }

    switch (sortBy) {
      case 'popular':
      case 'downloads':
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return result;
  }, [documents, searchParams, sortBy]);

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);

  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredDocuments.slice(startIndex, endIndex);
  }, [filteredDocuments, currentPage]);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      start = 1;
      end = 5;
    }

    if (currentPage >= totalPages - 2) {
      start = totalPages - 4;
      end = totalPages;
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tìm tài liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-6" data-testid="search-page-title">
            Tìm kiếm tài liệu
          </h1>

          <div className="glass-panel rounded-2xl p-2 mb-6">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400 ml-4" strokeWidth={1.5} />
              <Input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-slate-500 h-12"
                data-testid="search-input"
              />
              <Button
                onClick={handleSearch}
                className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12"
                data-testid="search-btn"
              >
                Tìm
              </Button>
            </div>
          </div>

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
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />
            <p className="text-slate-400 text-sm" data-testid="results-count">
              Tìm thấy <span className="font-semibold text-white">{filteredDocuments.length}</span> tài liệu
            </p>
          </div>

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
                  className={`rounded-full cursor-pointer transition-all ${
                    selectedSubject === subject
                      ? 'bg-primary text-white'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
                  }`}
                  onClick={() => {
                    setSelectedSubject(subject);
                    const params = {};
                    if (searchQuery.trim()) params.q = searchQuery.trim();
                    if (subject !== 'all') params.subject = subject;
                    setSearchParams(params);
                    setCurrentPage(1);
                  }}
                  data-testid={`filter-subject-${index}`}
                >
                  {subject === 'all' ? 'Tất cả' : subject}
                </Badge>
              ))}
            </motion.div>
          )}
        </motion.div>

        {filteredDocuments.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center">
            <FileText className="w-14 h-14 text-slate-500 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold mb-2">Không tìm thấy tài liệu phù hợp</h2>
            <p className="text-slate-400">
              Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc.
            </p>
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginatedDocuments.map((doc, index) => (
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
                            <span className="text-sm font-medium">
                              {doc.ratingCount > 0 ? doc.rating : 'Chưa có'}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {doc.title}
                        </h3>

                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                          {doc.description || 'Không có mô tả'}
                        </p>

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

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
                  Trước
                </Button>

                {getVisiblePages().map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    className={`rounded-full min-w-11 ${
                      currentPage === page
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                    }`}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-40"
                >
                  Sau
                  <ChevronRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

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

export default SearchPage;  