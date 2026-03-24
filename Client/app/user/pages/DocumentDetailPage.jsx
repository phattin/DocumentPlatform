import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Star, User, Calendar, FileText, Eye, MessageSquare, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../user/components/button';
import { Badge } from '../../user/components/badge';
import { Textarea } from '../../user/components/textarea';
import { Avatar, AvatarFallback } from '../../user/components/avatar';
import { doc, getDoc, updateDoc, collection, addDoc, orderBy, query, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { increment } from 'firebase/firestore';  // 🔥 Atomic increment

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingComment, setUploadingComment] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // 🔥 Load document và comments từ Firestore
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);

        // 1. Lấy document chính
        const docRef = doc(db, "documents", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setDocument({
            id: docSnap.id,
            ...data,
            uploadDate: data.createdAt ? data.createdAt.toDate() : new Date(),
          });

          // 2. Increment views
          await updateDoc(docRef, {
            views: increment(1)
          });

          // 3. Load comments (subcollection comments/{docId})
          const commentsQuery = query(
            collection(db, "comments"),
            orderBy("createdAt", "desc"),
            limit(10)
          );
          const commentsSnap = await getDocs(commentsQuery);
          const commentsData = commentsSnap.docs.map(c => ({
            id: c.id,
            ...c.data(),
            createdAt: c.data().createdAt?.toDate() || new Date(),
          }));
          setComments(commentsData);
        } else {
          console.log("❌ Không tìm thấy document");
        }
      } catch (error) {
        console.error("❌ Lỗi load document:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDocument();
    }
  }, [id]);

  // 🔥 Handle download + increment counter
  const handleDownload = async () => {
    if (!document?.downloadURL) return;

    setDownloading(true);
    try {
      // Increment downloads
      const docRef = doc(db, "documents", id);
      await updateDoc(docRef, {
        downloads: increment(1)
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = document.downloadURL;
      link.download = document.fileName || `document-${id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Refresh data
      setDocument(prev => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
    } catch (error) {
      console.error("❌ Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  // 🔥 Submit rating + comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || rating === 0 || !auth.currentUser) return;

    setUploadingComment(true);
    try {
      const user = auth.currentUser;

      // Tạo comment mới
      const commentRef = await addDoc(collection(db, "comments"), {
        documentId: id,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        authorAvatar: user.photoURL || '',
        content: comment,
        rating: rating,
        createdAt: serverTimestamp(),
      });

      // Refresh comments
      const newComment = {
        id: commentRef.id,
        documentId: id,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        authorAvatar: user.photoURL || '',
        content: comment,
        rating,
        createdAt: new Date(),
      };
      setComments([newComment, ...comments]);

      setComment('');
      setRating(0);
    } catch (error) {
      console.error("❌ Lỗi gửi comment:", error);
    } finally {
      setUploadingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-400">Đang tải tài liệu...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tài liệu không tồn tại</h2>
          <Link to="/" className="text-primary hover:underline">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Document Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {/* Document Header */}
            <div className="glass-panel rounded-3xl p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <Badge variant="secondary" className="rounded-full" data-testid="doc-subject-badge">
                  {document.subject}
                </Badge>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg font-semibold">
                    {((document.rating || 0) / (document.ratingCount || 1)).toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-400 ml-1">({document.ratingCount || 0})</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4" data-testid="doc-title">
                {document.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  <span>{document.authorName || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  <span>{document.uploadDate?.toLocaleDateString('vi-VN') || 'Vừa xong'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  <span>{(document.downloads || 0).toLocaleString()} lượt tải</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  <span>{(document.views || 0).toLocaleString()} lượt xem</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {document.tags?.slice(0, 6).map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="rounded-full border-white/10 text-slate-400"
                    data-testid={`doc-tag-${tag}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {document.description && (
                <p className="text-slate-300 leading-relaxed mb-6" data-testid="doc-description">
                  {document.description}
                </p>
              )}

              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-8 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  onClick={handleDownload}
                  disabled={downloading || !document.downloadURL}
                  data-testid="download-btn"
                >
                  {downloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" strokeWidth={1.5} />
                  )}
                  {downloading ? 'Đang tải...' : 'Tải xuống'}
                </Button>
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <span>{document.fileType || 'PDF'}</span>
                  <span>•</span>
                  <span>
                    {Math.round((document.fileSize || 0) / 1024 / 1024)} MB
                  </span>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="glass-panel rounded-3xl p-8 mb-6">
              <h2 className="text-xl font-bold mb-4" data-testid="preview-heading">Xem trước</h2>
              <div className="aspect-video rounded-2xl border border-white/10 overflow-hidden bg-[#0B0C15]">
                {document?.downloadURL && document.fileType?.toLowerCase() === 'pdf' ? (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(document.downloadURL)}&embedded=true`}
                    className="w-full h-full min-h-[500px]"
                    frameBorder="0"
                    allowFullScreen={true}
                    title={`Xem trước ${document.title}`}
                    loading="lazy"
                    data-testid="pdf-preview"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-6" strokeWidth={1.5} />
                    <div>
                      <p className="text-slate-400 mb-2">
                        {document?.fileType ? `Chỉ hỗ trợ xem trước PDF` : 'Không có file preview'}
                      </p>
                      <Button
                        size="sm"
                        className="rounded-full mt-4"
                        onClick={handleDownload}
                        data-testid="download-fallback-btn"
                      >
                        <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Tải xuống để xem
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Preview by Google Docs Viewer
              </p>
            </div>  


            {/* Comments Section */}
            <div className="glass-panel rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6" data-testid="comments-heading">
                Đánh giá & Bình luận ({comments.length})
              </h2>

              {/* Add Comment Form */}
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">Đánh giá của bạn</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRating(value)}
                        className="transition-all hover:scale-110 p-1"
                        data-testid={`rating-star-${value}`}
                      >
                        <Star
                          className={`w-7 h-7 ${value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <Textarea
                    placeholder="Chia sẻ ý kiến của bạn về tài liệu này..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-32 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white resize-none"
                    disabled={uploadingComment}
                    data-testid="comment-input"
                  />
                </div>

                <Button
                  type="submit"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white px-6 flex items-center gap-2"
                  disabled={uploadingComment || !auth.currentUser || rating === 0 || !comment.trim()}
                  data-testid="submit-comment-btn"
                >
                  {uploadingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  {uploadingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((cmt, index) => (
                  <motion.div
                    key={cmt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 pb-6 last:border-0"
                    data-testid={`comment-${index}`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10" src={cmt.authorAvatar}>
                        <AvatarFallback>
                          {cmt.authorName?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{cmt.authorName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <Star
                                    key={value}
                                    className={`w-4 h-4 ${value <= cmt.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-600'
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-500">
                                {cmt.createdAt?.toLocaleDateString('vi-VN') || 'Vừa xong'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300">{cmt.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {comments.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Author Info & Related */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Author Card */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-4" data-testid="author-heading">Tác giả</h3>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16 bg-primary/20 text-primary text-xl">
                  <AvatarFallback>
                    {document.authorName?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{document.authorName || 'Anonymous'}</p>
                  <p className="text-sm text-slate-400">Người dùng</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-primary">1</p>
                  <p className="text-xs text-slate-400">Tài liệu</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-primary">
                    {(document.downloads || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">Lượt tải</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-full border-white/10 hover:bg-white/5"
                data-testid="view-profile-btn"
              >
                Xem hồ sơ
              </Button>
            </div>

            {/* Related Documents */}
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-4" data-testid="related-heading">
                Tài liệu liên quan
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2 mb-1">
                      Tìm tài liệu cùng chủ đề...
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>4.7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;
