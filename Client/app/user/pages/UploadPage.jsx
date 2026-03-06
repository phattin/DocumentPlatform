import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../../user/components/input';
import { Button } from '../../user/components/button';
import { Label } from '../../user/components/label';
import { Textarea } from '../../user/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../user/components/select';
import { Badge } from '../../user/components/badge';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const subjects = [
    'Toán học',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Lập trình',
    'Công nghệ thông tin',
    'Tiếng Anh',
    'Văn học',
    'Lịch sử',
    'Địa lý',
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Upload:', { file, formData, tags });
  };

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="upload-page-title">Tải tài liệu lên</h1>
            <p className="text-slate-400">Chia sẻ kiến thức của bạn với cộng đồng</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Zone */}
            <div className="glass-panel rounded-3xl p-8">
              <Label className="text-lg font-semibold mb-4 block">Tệp tài liệu</Label>
              <div
                className={`border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center p-12 cursor-pointer ${dragActive
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
                data-testid="upload-drop-zone"
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />

                {file ? (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-primary mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-lg font-medium mb-1">{file.name}</p>
                    <p className="text-sm text-slate-400 mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="rounded-full text-slate-400 hover:text-white"
                      data-testid="remove-file-btn"
                    >
                      Xóa tệp
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-lg font-medium mb-2">Kéo thả tệp vào đây</p>
                    <p className="text-sm text-slate-400 mb-4">hoặc nhấp để chọn tệp</p>
                    <p className="text-xs text-slate-500">Hỗ trợ: PDF, DOC, DOCX, PPT, PPTX, TXT (Tối đa 50MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Information */}
            <div className="glass-panel rounded-3xl p-8 space-y-6">
              <h3 className="text-lg font-semibold">Thông tin tài liệu</h3>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">
                  Tiêu đề tài liệu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Ví dụ: Giáo trình Toán Cao Cấp A1"
                  value={formData.title}
                  onChange={handleChange}
                  className="h-12 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white"
                  required
                  data-testid="upload-title-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-slate-300">
                  Môn học <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject: value })
                  }
                >
                  <SelectTrigger
                    id="subject"
                    data-testid="upload-subject-select"
                    className="
        h-12
        w-full
        glass-input
        rounded-xl
        text-white/50
        px-4
        focus:ring-2
        focus:ring-primary/20
        focus:border-primary
        border border-white/10
      "
                  >
                    <SelectValue
                      placeholder="Chọn môn học"
                      className="text-white/50"
                    />
                  </SelectTrigger>

                  <SelectContent className="bg-[#12141F] border border-white/10 text-white">
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject}
                        className="hover:bg-white/10 focus:bg-white/10"
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Mô tả ngắn gọn về nội dung tài liệu..."
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-32 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white resize-none"
                  data-testid="upload-description-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-slate-300">
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    type="text"
                    placeholder="Nhập tag và nhấn Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 h-12 glass-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-white"
                    data-testid="upload-tag-input"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="rounded-full bg-primary hover:bg-primary/90 px-6 h-12"
                    data-testid="add-tag-btn"
                  >
                    <Plus className="w-5 h-5" strokeWidth={1.5} />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="rounded-full bg-primary/20 text-primary border-primary/30 pl-3 pr-2 py-1"
                        data-testid={`tag-${index}`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full px-8 h-12 text-slate-400 hover:text-white hover:bg-white/5"
                data-testid="cancel-btn"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-8 h-12 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95"
                data-testid="submit-upload-btn"
              >
                <UploadIcon className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Đăng tải
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;