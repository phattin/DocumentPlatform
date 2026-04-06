import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  Star,
  User,
  Calendar,
  FileText,
  Eye,
  Send,
  Loader2,
  Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../user/components/button';
import { Badge } from '../../user/components/badge';
import { Textarea } from '../../user/components/textarea';
import { Avatar, AvatarFallback } from '../../user/components/avatar';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
  where,
  limit,
  increment,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { logActivity } from '../../lib/logActivity';

const DocumentDetailPage = () => {
  const { id } = useParams();

  const [docData, setDocData] = useState(null);
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingComment, setUploadingComment] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [authorData, setAuthorData] = useState(null);
  const [authorStats, setAuthorStats] = useState({
    totalDocuments: 0,
    totalDownloads: 0,
  });

  const [relatedDocs, setRelatedDocs] = useState([]);

  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    const docRef = doc(db, 'documents', id);

    const unsubscribeDoc = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          setDocData({
            id: snap.id,
            ...data,
            uploadDate: data.createdAt ? data.createdAt.toDate() : new Date(),
          });

          setLikesCount(data.likesCount || 0);
        } else {
          setDocData(null);
          setLikesCount(0);
        }

        setLoading(false);
      },
      (error) => {
        console.error('Lỗi realtime document:', error);
        setLoading(false);
      }
    );

    const commentsQuery = query(
      collection(db, 'comments'),
      where('documentId', '==', id),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribeComments = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentsData = snapshot.docs.map((c) => ({
          id: c.id,
          ...c.data(),
          createdAt: c.data().createdAt?.toDate() || new Date(),
        }));

        setComments(commentsData);
      },
      (error) => {
        console.error('Lỗi realtime comments:', error);
      }
    );

    updateDoc(docRef, {
      views: increment(1),
    }).catch(console.error);

    return () => {
      unsubscribeDoc();
      unsubscribeComments();
    };
  }, [id]);

  useEffect(() => {
    if (!id || !auth.currentUser) {
      setLiked(false);
      return;
    }

    const likeRef = doc(db, 'documents', id, 'likes', auth.currentUser.uid);

    const unsubscribeLike = onSnapshot(
      likeRef,
      (snap) => {
        setLiked(snap.exists());
      },
      (error) => {
        console.error('Lỗi realtime like status:', error);
      }
    );

    return () => unsubscribeLike();
  }, [id]);

  useEffect(() => {
    if (!docData?.authorId) return;

    const loadAuthorAndRelated = async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', docData.authorId));
        if (userSnap.exists()) {
          setAuthorData(userSnap.data());
        }

        const authorDocsSnap = await getDocs(
          query(
            collection(db, 'documents'),
            where('authorId', '==', docData.authorId)
          )
        );

        const totalDownloads = authorDocsSnap.docs.reduce(
          (sum, d) => sum + (d.data().downloads || 0),
          0
        );

        setAuthorStats({
          totalDocuments: authorDocsSnap.size,
          totalDownloads,
        });

        if (docData.subject) {
          const relatedSnap = await getDocs(
            query(
              collection(db, 'documents'),
              where('subject', '==', docData.subject),
              limit(10)
            )
          );

          const related = relatedSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((d) => d.id !== id)
            .slice(0, 3);

          setRelatedDocs(related);
        }
      } catch (error) {
        console.error('Lỗi load author/related:', error);
      }
    };

    loadAuthorAndRelated();
  }, [docData?.authorId, docData?.subject, id]);

  const handleRating = (value) => setRating(value);

  const handleToggleLike = async () => {
    if (!auth.currentUser) {
      alert('Bạn cần đăng nhập để thích tài liệu');
      return;
    }

    if (!docData?.id || likeLoading) return;

    setLikeLoading(true);

    const user = auth.currentUser;
    const documentRef = doc(db, 'documents', docData.id);
    const likeRef = doc(db, 'documents', docData.id, 'likes', user.uid);

    try {
      const result = await runTransaction(db, async (transaction) => {
        const documentSnap = await transaction.get(documentRef);
        const likeSnap = await transaction.get(likeRef);

        if (!documentSnap.exists()) {
          throw new Error('Tài liệu không tồn tại');
        }

        const currentLikes = documentSnap.data().likesCount || 0;

        if (likeSnap.exists()) {
          transaction.delete(likeRef);
          transaction.update(documentRef, {
            likesCount: Math.max(currentLikes - 1, 0),
          });
          return { liked: false };
        } else {
          transaction.set(likeRef, {
            userId: user.uid,
            documentId: docData.id,
            createdAt: serverTimestamp(),
          });
          transaction.update(documentRef, {
            likesCount: currentLikes + 1,
          });
          return { liked: true };
        }
      });

      await logActivity(
        user.uid,
        result.liked ? 'like' : 'unlike',
        result.liked
          ? `Đã thích "${docData.title}"`
          : `Đã bỏ thích "${docData.title}"`,
        docData.id
      );
    } catch (error) {
      console.error('Like toggle error:', error);
      alert('Không thể cập nhật lượt thích');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!docData?.downloadURL) return;
    if (!auth.currentUser) {
      alert('Bạn cần đăng nhập để tải tài liệu');
      return;
    }

    setDownloading(true);
    try {
      await updateDoc(doc(db, 'documents', id), {
        downloads: increment(1),
      });

      await logActivity(
        auth.currentUser.uid,
        'download',
        `Đã tải xuống "${docData.title}"`,
        id
      );

      const link = window.document.createElement('a');
      link.href = docData.downloadURL;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = docData.fileName || `document-${id}`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!comment.trim() || rating === 0 || !auth.currentUser) return;

    setUploadingComment(true);
    try {
      const user = auth.currentUser;

      await addDoc(collection(db, 'comments'), {
        documentId: id,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        authorAvatar: user.photoURL || '',
        content: comment.trim(),
        rating,
        createdAt: serverTimestamp(),
      });

      await logActivity(
        user.uid,
        'comment',
        `Đã bình luận vào "${docData.title}"`,
        id
      );

      await updateDoc(doc(db, 'documents', id), {
        ratingTotal: increment(rating),
        ratingCount: increment(1),
      });

      setComment('');
      setRating(0);
    } catch (error) {
      console.error('Lỗi gửi comment:', error);
    } finally {
      setUploadingComment(false);
    }
  };

  const averageRating =
    docData?.ratingCount > 0
      ? ((docData.ratingTotal || 0) / docData.ratingCount).toFixed(1)
      : '0.0';

  const getRelatedRating = (item) =>
    item?.ratingCount > 0
      ? ((item.ratingTotal || 0) / item.ratingCount).toFixed(1)
      : '0.0';

  const isPdf =
    docData?.fileType?.toLowerCase() === 'pdf' ||
    docData?.fileName?.toLowerCase()?.endsWith('.pdf');

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

  if (!docData) {
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
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="glass-panel rounded-3xl p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <Badge variant="secondary" className="rounded-full">
                  {docData.subject}
                </Badge>

                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg font-semibold">{averageRating}</span>
                  <span className="text-sm text-slate-400 ml-1">
                    ({docData.ratingCount || 0})
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4">{docData.title}</h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  <span>{docData.authorName || 'Anonymous'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  <span>
                    {docData.uploadDate?.toLocaleDateString('vi-VN') || 'Vừa xong'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  <span>{(docData.downloads || 0).toLocaleString()} lượt tải</span>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  <span>{(docData.views || 0).toLocaleString()} lượt xem</span>
                </div>

                <div className="flex items-center gap-2">
                  <Heart
                    className={`w-4 h-4 ${liked ? 'text-pink-400 fill-pink-400' : 'text-slate-400'}`}
                    strokeWidth={1.5}
                  />
                  <span>{likesCount.toLocaleString()} lượt thích</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {docData.tags?.slice(0, 6).map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="rounded-full border-white/10 text-slate-400"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {docData.description && (
                <p className="text-slate-300 leading-relaxed mb-6">
                  {docData.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/10">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-8 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  onClick={handleDownload}
                  disabled={downloading || !docData.downloadURL}
                >
                  {downloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" strokeWidth={1.5} />
                  )}
                  {downloading ? 'Đang tải...' : 'Tải xuống'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleToggleLike}
                  disabled={likeLoading}
                  className={`rounded-full px-6 flex items-center gap-2 border-white/10 hover:bg-white/5 ${
                    liked ? 'text-pink-400 border-pink-400/30 bg-pink-400/10' : 'text-slate-200'
                  }`}
                >
                  {likeLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart
                      className={`w-5 h-5 ${liked ? 'fill-pink-400 text-pink-400' : ''}`}
                      strokeWidth={1.5}
                    />
                  )}
                  {liked ? 'Đã thích' : 'Thích'}
                  <span className="text-sm">({likesCount.toLocaleString()})</span>
                </Button>

                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <span>{docData.fileType || 'PDF'}</span>
                  <span>•</span>
                  <span>{Math.round((docData.fileSize || 0) / 1024 / 1024)} MB</span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-8 mb-6">
              <h2 className="text-xl font-bold mb-4">Xem trước</h2>

              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0B0C15] min-h-[500px]">
                {docData?.downloadURL && isPdf ? (
                  <iframe
                    src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                      docData.downloadURL
                    )}`}
                    className="w-full min-h-[700px]"
                    title={`Preview ${docData.title}`}
                  />
                ) : (
                  <div className="h-[500px] flex flex-col items-center justify-center p-8 text-center">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-6" strokeWidth={1.5} />
                    <p className="text-slate-400 mb-2">
                      {docData?.fileType ? 'Chỉ hỗ trợ xem trước PDF' : 'Không có file preview'}
                    </p>
                    <Button size="sm" className="rounded-full mt-4" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Tải xuống để xem
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-3 text-center">
                Preview by Google Docs Viewer
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6">
                Đánh giá & Bình luận ({comments.length})
              </h2>

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
                      >
                        <Star
                          className={`w-7 h-7 ${
                            value <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-600'
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
                  />
                </div>

                <Button
                  type="submit"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white px-6 flex items-center gap-2"
                  disabled={
                    uploadingComment || !auth.currentUser || rating === 0 || !comment.trim()
                  }
                >
                  {uploadingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  {uploadingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                </Button>
              </form>

              <div className="space-y-6">
                {comments.map((cmt, index) => (
                  <motion.div
                    key={cmt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 pb-6 last:border-0"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        {cmt.authorAvatar ? (
                          <img
                            src={cmt.authorAvatar}
                            alt={cmt.authorName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback>
                            {cmt.authorName?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1">
                        <p className="font-semibold">{cmt.authorName}</p>
                        <div className="flex items-center gap-2 mt-1 mb-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                className={`w-4 h-4 ${
                                  value <= cmt.rating
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
                        <p className="text-slate-300">{cmt.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {comments.length === 0 && (
                  <p className="text-center text-slate-500 py-8">
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-4">Tác giả</h3>

              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16 bg-primary/20 text-primary text-xl">
                  {authorData?.avatar ? (
                    <img
                      src={authorData.avatar}
                      alt={docData.authorName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback>
                      {docData.authorName?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div>
                  <p className="font-semibold text-lg">
                    {docData.authorName || 'Anonymous'}
                  </p>
                  <p className="text-sm text-slate-400">Người dùng</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-primary">
                    {authorStats.totalDocuments}
                  </p>
                  <p className="text-xs text-slate-400">Tài liệu</p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-primary">
                    {authorStats.totalDownloads.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">Lượt tải</p>
                </div>
              </div>

              {docData.authorId && (
                <Link to={`/profile/${docData.authorId}`}>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-white/10 hover:bg-white/5"
                  >
                    Xem hồ sơ
                  </Button>
                </Link>
              )}
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-4">Tài liệu liên quan</h3>

              <div className="space-y-3">
                {relatedDocs.length > 0 ? (
                  relatedDocs.map((item) => (
                    <Link key={item.id} to={`/document/${item.id}`}>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <FileText
                          className="w-5 h-5 text-primary flex-shrink-0 mt-1"
                          strokeWidth={1.5}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2 mb-1">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{getRelatedRating(item)}</span>
                            <span>•</span>
                            <span>{(item.downloads || 0).toLocaleString()} tải</span>
                            <span>•</span>
                            <span>{(item.likesCount || 0).toLocaleString()} thích</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Không có tài liệu liên quan
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;