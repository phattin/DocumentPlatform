import { StatusBadge } from "../../admin/components/StatusBadge";
import { Button } from "../../admin/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../admin/components/dialog";
import { Input } from "../../admin/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../admin/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../admin/components/table";
import { createPost, deletePost, fetchPosts, updatePost } from "../../services/adminApi";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "../../admin/components/sonner";

const SUBJECT_OPTIONS = [
  "Toán cao cấp",
  "Lập trình Java",
  "Cấu trúc dữ liệu",
  "Tiếng Anh",
  "Machine Learning",
  "Vật lý đại cương",
];

const initialForm = {
  title: "",
  subject: SUBJECT_OPTIONS[0],
  author_name: "",
  description: "",
  tagsText: "",
};

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString("vi-VN");
};

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ search: "", status: "all", subject: "all", page: 1, limit: 8 });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  const requestParams = useMemo(
    () => ({
      page: query.page,
      limit: query.limit,
      search: query.search || undefined,
      status: query.status === "all" ? undefined : query.status,
      subject: query.subject === "all" ? undefined : query.subject,
    }),
    [query],
  );

  // const loadPosts = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await fetchPosts(requestParams);
  //     setPosts(response.items ?? []);
  //     setTotal(response.total ?? 0);
  //   } catch (error) {
  //     console.error("Không tải được danh sách bài viết", error);
  //     toast.error("Không tải được danh sách bài viết");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadPosts = async () => {
  setPosts([
    {
      id: 1,
      title: "Tài liệu test kiểm duyệt",
      subject: "Toán cao cấp",
      status: "rejected",
      author_name: "Tester Admin",
      updated_at: "2026-03-06",
      tags: []
    },
    {
      id: 2,
      title: "Tổng hợp đề cương Toán cao cấp",
      subject: "Toán cao cấp",
      status: "approved",
      author_name: "Nguyễn Minh Anh",
      updated_at: "2026-03-06",
      tags: []
    }
  ]);

  setTotal(6);
};

  useEffect(() => {
    loadPosts();
  }, [requestParams]);

  const openCreateDialog = () => {
    setEditingPost(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEditDialog = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      subject: post.subject,
      author_name: post.author_name,
      description: post.description,
      tagsText: post.tags.join(", "),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      subject: form.subject,
      author_name: form.author_name,
      description: form.description,
      tags: form.tagsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingPost) {
        await updatePost(editingPost.id, payload);
        toast.success("Đã cập nhật bài viết");
      } else {
        await createPost(payload);
        toast.success("Đã tạo bài viết mới");
      }
      setDialogOpen(false);
      setQuery((prev) => ({ ...prev, page: 1 }));
      await loadPosts();
    } catch (error) {
      console.error("Không thể lưu bài viết", error);
      toast.error("Không thể lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá bài viết này?")) {
      return;
    }

    try {
      await deletePost(postId);
      toast.success("Đã xoá bài viết");
      await loadPosts();
    } catch (error) {
      console.error("Không thể xoá bài viết", error);
      toast.error("Không thể xoá bài viết");
    }
  };

  return (
    <div className="space-y-5" data-testid="posts-page">
      <section className="glass-panel rounded-2xl p-4 md:p-5" data-testid="posts-toolbar-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={query.search}
                onChange={(event) => setQuery((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
                className="cyber-input pl-9"
                placeholder="Tìm theo tiêu đề, môn học, tác giả..."
                data-testid="posts-search-input"
              />
            </div>

            <Select
              value={query.status}
              onValueChange={(value) => setQuery((prev) => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger className="cyber-input w-[180px]" data-testid="posts-status-filter-select">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-900 text-slate-100" data-testid="posts-status-filter-menu">
                <SelectItem value="all" data-testid="posts-status-option-all">
                  Tất cả trạng thái
                </SelectItem>
                <SelectItem value="pending" data-testid="posts-status-option-pending">
                  Pending
                </SelectItem>
                <SelectItem value="approved" data-testid="posts-status-option-approved">
                  Approved
                </SelectItem>
                <SelectItem value="rejected" data-testid="posts-status-option-rejected">
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={query.subject}
              onValueChange={(value) => setQuery((prev) => ({ ...prev, subject: value, page: 1 }))}
            >
              <SelectTrigger className="cyber-input w-[190px]" data-testid="posts-subject-filter-select">
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-900 text-slate-100" data-testid="posts-subject-filter-menu">
                <SelectItem value="all" data-testid="posts-subject-option-all">
                  Tất cả môn học
                </SelectItem>
                {SUBJECT_OPTIONS.map((subject) => (
                  <SelectItem
                    key={subject}
                    value={subject}
                    data-testid={`posts-subject-option-${subject.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={openCreateDialog}
            className="border-0 bg-cyan-600 text-white hover:bg-cyan-500"
            data-testid="posts-create-button"
          >
            <Plus className="h-4 w-4" />
            Tạo bài viết
          </Button>
        </div>
      </section>

      <section className="glass-panel overflow-hidden rounded-2xl" data-testid="posts-table-section">
        <Table data-testid="posts-table">
          <TableHeader>
            <TableRow className="border-b border-white/10" data-testid="posts-table-header-row">
              <TableHead className="text-xs uppercase text-slate-400" data-testid="posts-header-title">
                Bài viết
              </TableHead>
              <TableHead className="text-xs uppercase text-slate-400" data-testid="posts-header-status">
                Trạng thái
              </TableHead>
              <TableHead className="text-xs uppercase text-slate-400" data-testid="posts-header-author">
                Tác giả
              </TableHead>
              <TableHead className="text-xs uppercase text-slate-400" data-testid="posts-header-updated">
                Cập nhật
              </TableHead>
              <TableHead className="text-right text-xs uppercase text-slate-400" data-testid="posts-header-actions">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow data-testid="posts-table-loading-row">
                <TableCell colSpan={5} className="py-8 text-center text-slate-400" data-testid="posts-loading-text">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow data-testid="posts-table-empty-row">
                <TableCell colSpan={5} className="py-8 text-center text-slate-400" data-testid="posts-empty-text">
                  Không có bài viết phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`posts-row-${post.id}`}>
                  <TableCell data-testid={`posts-title-cell-${post.id}`}>
                    <p className="font-semibold text-slate-100" data-testid={`posts-title-${post.id}`}>
                      {post.title}
                    </p>
                    <p className="text-xs text-slate-400" data-testid={`posts-subject-${post.id}`}>
                      {post.subject}
                    </p>
                  </TableCell>
                  <TableCell data-testid={`posts-status-cell-${post.id}`}>
                    <StatusBadge type="post" value={post.status} dataTestId={`posts-status-badge-${post.id}`} />
                  </TableCell>
                  <TableCell data-testid={`posts-author-cell-${post.id}`}>
                    <span className="text-sm text-slate-200" data-testid={`posts-author-${post.id}`}>
                      {post.author_name}
                    </span>
                  </TableCell>
                  <TableCell data-testid={`posts-updated-cell-${post.id}`}>
                    <span className="text-sm text-slate-300" data-testid={`posts-updated-${post.id}`}>
                      {formatDate(post.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right" data-testid={`posts-actions-cell-${post.id}`}>
                    <div className="inline-flex gap-2">
                      <Button
                        variant="ghost"
                        className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                        onClick={() => openEditDialog(post)}
                        data-testid={`posts-edit-button-${post.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                        onClick={() => handleDelete(post.id)}
                        data-testid={`posts-delete-button-${post.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3" data-testid="posts-pagination-section">
        <p className="text-sm text-slate-300" data-testid="posts-pagination-summary">
          Trang {query.page}/{totalPages} • Tổng {total} bài viết
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={query.page <= 1}
            onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
            data-testid="posts-pagination-prev"
          >
            Trước
          </Button>
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={query.page >= totalPages}
            onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
            data-testid="posts-pagination-next"
          >
            Sau
          </Button>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-[620px]" data-testid="posts-form-dialog">
          <DialogHeader>
            <DialogTitle data-testid="posts-form-title">{editingPost ? "Cập nhật bài viết" : "Tạo bài viết mới"}</DialogTitle>
            <DialogDescription className="text-slate-400" data-testid="posts-form-description">
              Điền thông tin bài viết theo metadata chuẩn của hệ thống.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit} data-testid="posts-form">
            <div className="space-y-2">
              <label className="text-sm text-slate-300" data-testid="posts-form-label-title">
                Tiêu đề
              </label>
              <Input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="cyber-input"
                required
                data-testid="posts-form-input-title"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300" data-testid="posts-form-label-subject">
                  Môn học
                </label>
                <Select
                  value={form.subject}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger className="cyber-input" data-testid="posts-form-select-subject">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900 text-slate-100" data-testid="posts-form-subject-menu">
                    {SUBJECT_OPTIONS.map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject}
                        data-testid={`posts-form-subject-option-${subject.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300" data-testid="posts-form-label-author">
                  Tác giả
                </label>
                <Input
                  value={form.author_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, author_name: event.target.value }))}
                  className="cyber-input"
                  required
                  data-testid="posts-form-input-author"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300" data-testid="posts-form-label-tags">
                Tags (phân tách bằng dấu phẩy)
              </label>
              <Input
                value={form.tagsText}
                onChange={(event) => setForm((prev) => ({ ...prev, tagsText: event.target.value }))}
                className="cyber-input"
                data-testid="posts-form-input-tags"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300" data-testid="posts-form-label-description">
                Mô tả
              </label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={5}
                required
                className="cyber-input w-full rounded-md px-3 py-2 text-sm"
                data-testid="posts-form-textarea-description"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                onClick={() => setDialogOpen(false)}
                data-testid="posts-form-cancel-button"
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                className="border-0 bg-cyan-600 text-white hover:bg-cyan-500"
                disabled={saving}
                data-testid="posts-form-submit-button"
              >
                {saving ? "Đang lưu..." : editingPost ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
