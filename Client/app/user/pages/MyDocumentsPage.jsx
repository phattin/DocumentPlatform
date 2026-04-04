import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Eye,
  Clock,
  Trash2,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Button } from '../../user/components/button';
import { Input } from '../../user/components/input';
import { Badge } from '../../user/components/badge';

const MyDocumentsPage = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate('/login');
      return;
    }

    const q = query(
      collection(db, 'documents'),
      where('authorId', '==', user.uid),
      // orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            title: data.title || 'Untitled',
            subject: data.subject || 'Khác',
            description: data.description || '',
            tags: data.tags || [],
            status: data.status || 'pending',
            downloads: data.downloads || 0,
            views: data.views || 0,
            ratingTotal: data.ratingTotal || 0,
            ratingCount: data.ratingCount || 0,
            createdAt: data.createdAt ? data.createdAt.toDate() : null,
            updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
            fileName: data.fileName || '',
            fileType: data.fileType || '',
            fileSize: data.fileSize || 0,
            downloadURL: data.downloadURL || '',
          };
        });

        setDocuments(docs);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Lỗi load my documents:', error);
        setDocuments([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const formatTimeAgo = (date) => {
    if (!date) return 'Không rõ ngày';

    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return {
          label: 'Đã duyệt',
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />,
        };
      case 'rejected':
        return {
          label: 'Bị từ chối',
          className: 'bg-red-500/10 text-red-400 border-red-500/20',
          icon: <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />,
        };
      case 'pending':
      default:
        return {
          label: 'Chờ duyệt',
          className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          icon: <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />,
        };
    }
  };

  const filteredDocuments = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return documents.filter((doc) => {
      const matchKeyword =
        !keyword ||
        doc.title.toLowerCase().includes(keyword) ||
        doc.subject.toLowerCase().includes(keyword) ||
        doc.description.toLowerCase().includes(keyword) ||
        doc.tags.join(' ').toLowerCase().includes(keyword);

      const matchStatus = statusFilter === 'all' || doc.status === statusFilter;

      return matchKeyword && matchStatus;
    });
  }, [documents, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: documents.length,
      approved: documents.filter((doc) => doc.status === 'approved').length,
      pending: documents.filter((doc) => doc.status === 'pending').length,
      rejected: documents.filter((doc) => doc.status === 'rejected').length,
      downloads: documents.reduce((sum, doc) => sum + (doc.downloads || 0), 0),
      views: documents.reduce((sum, doc) => sum + (doc.views || 0), 0),
    };
  }, [documents]);

  const handleDelete = async (docId, title) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xoá tài liệu "${title}" không?`);

    if (!confirmed) return;

    try {
      setDeletingId(docId);
      await deleteDoc(doc(db, 'documents', docId));
    } catch (error) {
      console.error('❌ Lỗi xoá tài liệu:', error);
      alert('Không thể xoá tài liệu. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const getAverageRating = (item) => {
    if (!item.ratingCount) return '0.0';
    return (item.ratingTotal / item.ratingCount).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-400">Đang tải tài liệu của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="my-documents-title">
                Tài liệu của tôi
              </h1>
              <p className="text-slate-400">
                Quản lý tất cả tài liệu bạn đã đăng tải
              </p>
            </div>

            <Link to="/upload">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Đăng tài liệu mới
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <div className="glass-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400 mb-1">Tổng tài liệu</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400 mb-1">Đã duyệt</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400 mb-1">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400 mb-1">Bị từ chối</p>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400 mb-1">Lượt xem</p>
              <p className="text-2xl font-bold">{stats.views.toLocaleString()}</p>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400 mb-1">Lượt tải</p>
              <p className="text-2xl font-bold">{stats.downloads.toLocaleString()}</p>
            </div>
          </div>

          {documents.length > 0 && (
            <div className="glass-panel rounded-2xl p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                  <Input
                    type="text"
                    placeholder="Tìm theo tiêu đề, môn học hoặc tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-transparent border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'ghost'}
                    onClick={() => setStatusFilter('all')}
                    className="rounded-full"
                  >
                    <Filter className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Tất cả
                  </Button>

                  <Button
                    variant={statusFilter === 'approved' ? 'default' : 'ghost'}
                    onClick={() => setStatusFilter('approved')}
                    className="rounded-full"
                  >
                    Đã duyệt
                  </Button>

                  <Button
                    variant={statusFilter === 'pending' ? 'default' : 'ghost'}
                    onClick={() => setStatusFilter('pending')}
                    className="rounded-full"
                  >
                    Chờ duyệt
                  </Button>

                  <Button
                    variant={statusFilter === 'rejected' ? 'default' : 'ghost'}
                    onClick={() => setStatusFilter('rejected')}
                    className="rounded-full"
                  >
                    Từ chối
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {documents.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold mb-2">Bạn chưa đăng tài liệu nào</h2>
            <p className="text-slate-400 mb-6 max-w-xl mx-auto">
              Hãy tải lên tài liệu đầu tiên để bắt đầu chia sẻ với cộng đồng. Sau khi đăng,
              bạn có thể theo dõi trạng thái duyệt ngay tại đây.
            </p>
            <Link to="/upload">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Đăng tài liệu đầu tiên
              </Button>
            </Link>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center">
            <Search className="w-16 h-16 text-slate-500 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold mb-2">Không có kết quả phù hợp</h2>
            <p className="text-slate-400 mb-6">
              Không tìm thấy tài liệu nào khớp với từ khóa hoặc bộ lọc hiện tại.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="rounded-full border-white/10 hover:bg-white/5"
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((item, index) => {
              const statusInfo = getStatusBadge(item.status);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="glass-panel rounded-3xl p-6"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <Badge variant="secondary" className="rounded-full">
                          {item.subject}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={`rounded-full flex items-center gap-1.5 border ${statusInfo.className}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </Badge>

                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" strokeWidth={1.5} />
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                        {item.description || 'Không có mô tả'}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 4).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="rounded-full text-xs border-white/10 text-slate-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                          {item.views.toLocaleString()} lượt xem
                        </span>

                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" strokeWidth={1.5} />
                          {item.downloads.toLocaleString()} lượt tải
                        </span>

                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" strokeWidth={1.5} />
                          {getAverageRating(item)} ({item.ratingCount || 0})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap xl:flex-col gap-3 xl:w-[220px]">
                      <Link to={`/document/${item.id}`} className="flex-1">
                        <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white">
                          <FileText className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Xem chi tiết
                        </Button>
                      </Link>

                      {item.downloadURL ? (
                        <a
                          href={item.downloadURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full rounded-full border-white/10 hover:bg-white/5">
                            <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            Mở file
                          </Button>
                        </a>
                      ) : null}

                      <Button
                        variant="outline"
                        onClick={() => handleDelete(item.id, item.title)}
                        disabled={deletingId === item.id}
                        className="w-full rounded-full border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        )}
                        Xoá tài liệu
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDocumentsPage;