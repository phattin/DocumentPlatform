import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Star, User, Calendar, FileText, Eye, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../user/components/button';
import { Badge } from '../../user/components/badge';
import { Textarea } from '../../user/components/textarea';
import { Avatar, AvatarFallback } from '../components/avatar';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const document = {
    id: 1,
    title: 'Giáo trình Toán Cao Cấp A1',
    subject: 'Toán học',
    author: {
      name: 'Nguyễn Văn A',
      avatar: 'NVA',
    },
    downloads: 1234,
    views: 3456,
    rating: 4.8,
    ratingCount: 87,
    tags: ['Toán', 'Đại số', 'Cao cấp', 'Giải tích'],
    uploadDate: '15/12/2024',
    fileSize: '12.5 MB',
    fileType: 'PDF',
    description:
      'Tài liệu tổng hợp về giải tích và đại số tuyến tính dành cho sinh viên năm nhất. Nội dung bao gồm: giới hạn, đạo hàm, tích phân, chuỗi, ma trận và định thức.',
  };

  const comments = [
    {
      id: 1,
      author: 'Trần Thị B',
      avatar: 'TTB',
      content: 'Tài liệu rất hữu ích, giải thích rõ ràng và dễ hiểu. Cảm ơn bạn đã chia sẻ!',
      rating: 5,
      date: '2 ngày trước',
    },
    {
      id: 2,
      author: 'Lê Văn C',
      avatar: 'LVC',
      content: 'Nội dung chi tiết, phù hợp cho ôn thi. 5 sao!',
      rating: 5,
      date: '5 ngày trước',
    },
    {
      id: 3,
      author: 'Phạm Văn D',
      avatar: 'PVD',
      content: 'Tài liệu tốt nhưng một số chỗ hơi khó hiểu. Nhưng nhìn chung vẫn rất hữu ích.',
      rating: 4,
      date: '1 tuần trước',
    },
  ];

  const handleRating = (value) => {
    setRating(value);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    console.log('Comment:', { rating, comment });
    setComment('');
    setRating(0);
  };

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
                  <span className="text-lg font-semibold">{document.rating}</span>
                  <span className="text-sm text-slate-400 ml-1">({document.ratingCount})</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4" data-testid="doc-title">
                {document.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  <span>{document.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  <span>{document.uploadDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  <span>{document.downloads} lượt tải</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  <span>{document.views} lượt xem</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {document.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full border-white/10 text-slate-400"
                    data-testid={`doc-tag-${tag}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="text-slate-300 leading-relaxed mb-6" data-testid="doc-description">
                {document.description}
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-8 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95"
                  data-testid="download-btn"
                >
                  <Download className="w-5 h-5 mr-2" strokeWidth={1.5} />
                  Tải xuống
                </Button>
                <div className="text-sm text-slate-400">
                  <p>
                    {document.fileType} • {document.fileSize}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="glass-panel rounded-3xl p-8 mb-6">
              <h2 className="text-xl font-bold mb-4" data-testid="preview-heading">Xem trước</h2>
              <div className="aspect-[3/4] bg-[#0B0C15] rounded-2xl border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-slate-500">Xem trước tài liệu</p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="glass-panel rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6" data-testid="comments-heading">
                Đánh giá & Bình luận
              </h2>

              {/* Add Comment Form */}
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">Đánh giá của bạn</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRating(value)}
                        className="transition-all hover:scale-110"
                        data-testid={`rating-star-${value}`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
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
                    data-testid="comment-input"
                  />
                </div>

                <Button
                  type="submit"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white px-6"
                  data-testid="submit-comment-btn"
                >
                  <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Gửi bình luận
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-white/5 pb-6 last:border-0"
                    data-testid={`comment-${index}`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10 bg-primary/20 text-primary">
                        <AvatarFallback>{comment.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{comment.author}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <Star
                                    key={value}
                                    className={`w-3 h-3 ${
                                      value <= comment.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-500">{comment.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300">{comment.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                  <AvatarFallback>{document.author.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{document.author.name}</p>
                  <p className="text-sm text-slate-400">Sinh viên</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-primary">24</p>
                  <p className="text-xs text-slate-400">Tài liệu</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-primary">5.2K</p>
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
              <h3 className="text-lg font-semibold mb-4" data-testid="related-heading">Tài liệu liên quan</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    data-testid={`related-doc-${index}`}
                  >
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2 mb-1">
                        Toán Cao Cấp A2 - Phần {item}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>4.7</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;