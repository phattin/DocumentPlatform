import React, { useState } from 'react';
import { FileText, Edit, Trash2, Eye, Download, Calendar, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../user/components/button';
import { Badge } from '../../user/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs';

const MyDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState('uploaded');

  const uploadedDocs = [
    {
      id: 1,
      title: 'Giáo trình Toán Cao Cấp A1',
      subject: 'Toán học',
      downloads: 1234,
      views: 3456,
      uploadDate: '15/12/2024',
      status: 'published',
    },
    {
      id: 2,
      title: 'Cấu trúc dữ liệu và giải thuật',
      subject: 'Lập trình',
      downloads: 892,
      views: 2134,
      uploadDate: '10/12/2024',
      status: 'published',
    },
    {
      id: 3,
      title: 'Nguyên lý hệ điều hành',
      subject: 'Công nghệ thông tin',
      downloads: 567,
      views: 1432,
      uploadDate: '05/12/2024',
      status: 'published',
    },
  ];

  const savedDocs = [
    {
      id: 4,
      title: 'Lập trình hướng đối tượng với Java',
      subject: 'Lập trình',
      author: 'Trần Thị B',
      savedDate: '18/12/2024',
    },
    {
      id: 5,
      title: 'Vật lý đại cương 1',
      subject: 'Vật lý',
      author: 'Hoàng Thị E',
      savedDate: '16/12/2024',
    },
  ];

  const handleDelete = (id) => {
    console.log('Delete document:', id);
  };

  const handleEdit = (id) => {
    console.log('Edit document:', id);
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

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="my-docs-title">Tài liệu của tôi</h1>
            <p className="text-slate-400">Quản lý tài liệu đã tải lên và đã lưu</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-panel h-12 p-1 mb-8">
              <TabsTrigger
                value="uploaded"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                data-testid="tab-uploaded"
              >
                Đã tải lên ({uploadedDocs.length})
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                data-testid="tab-saved"
              >
                Đã lưu ({savedDocs.length})
              </TabsTrigger>
            </TabsList>

            {/* Uploaded Documents */}
            <TabsContent value="uploaded">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                {uploadedDocs.map((doc, index) => (
                  <motion.div key={doc.id} variants={itemVariants}>
                    <div
                      className="glass-panel rounded-2xl p-6 hover:border-primary/50 transition-all"
                      data-testid={`uploaded-doc-${index}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-primary" strokeWidth={1.5} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{doc.title}</h3>
                              <Badge variant="secondary" className="rounded-full text-xs">
                                {doc.subject}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" strokeWidth={1.5} />
                                <span>{doc.views} lượt xem</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="w-4 h-4" strokeWidth={1.5} />
                                <span>{doc.downloads} lượt tải</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                                <span>{doc.uploadDate}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link to={`/document/${doc.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-full text-primary hover:bg-primary/10"
                                  data-testid={`view-doc-${index}`}
                                >
                                  <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
                                  Xem
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full hover:bg-white/5"
                                onClick={() => handleEdit(doc.id)}
                                data-testid={`edit-doc-${index}`}
                              >
                                <Edit className="w-4 h-4 mr-2" strokeWidth={1.5} />
                                Chỉnh sửa
                              </Button>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full"
                              data-testid={`doc-menu-${index}`}
                            >
                              <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#12141F] border-white/10">
                            <DropdownMenuItem
                              className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                              onClick={() => handleEdit(doc.id)}
                            >
                              <Edit className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Saved Documents */}
            <TabsContent value="saved">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                {savedDocs.map((doc, index) => (
                  <motion.div key={doc.id} variants={itemVariants}>
                    <div
                      className="glass-panel rounded-2xl p-6 hover:border-primary/50 transition-all"
                      data-testid={`saved-doc-${index}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-primary" strokeWidth={1.5} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{doc.title}</h3>
                              <Badge variant="secondary" className="rounded-full text-xs">
                                {doc.subject}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                              <span>Tác giả: {doc.author}</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                                <span>Đã lưu: {doc.savedDate}</span>
                              </div>
                            </div>

                            <Link to={`/document/${doc.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-primary hover:bg-primary/10"
                                data-testid={`view-saved-doc-${index}`}
                              >
                                <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
                                Xem tài liệu
                              </Button>
                            </Link>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-destructive hover:bg-destructive/10"
                          data-testid={`remove-saved-${index}`}
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default MyDocumentsPage;