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
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "../../admin/components/sonner";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query as fsQuery,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const SUBJECT_OPTIONS = [
  "Toán cao cấp",
  "Lập trình Java",
  "Cấu trúc dữ liệu",
  "Tiếng Anh",
  "Machine Learning",
  "Vật lý đại cương",
  "Lập trình",
];

const STATUS_OPTIONS = ["pending", "approved", "rejected"];

const initialForm = {
  title: "",
  subject: SUBJECT_OPTIONS[0],
  authorId: "",
  authorName: "",
  description: "",
  tagsText: "",
  status: "pending",
  fileName: "",
  filePath: "",
  downloadURL: "",
  fileSize: 0,
};

const formatDate = (value) => {
  if (!value) return "--";

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString("vi-VN");
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString("vi-VN");
};

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [queryState, setQueryState] = useState({
    search: "",
    status: "all",
    subject: "all",
    page: 1,
    limit: 8,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / queryState.limit));

  const requestParams = useMemo(
    () => ({
      page: queryState.page,
      limit: queryState.limit,
      search: queryState.search.trim().toLowerCase(),
      status: queryState.status,
      subject: queryState.subject,
    }),
    [queryState],
  );

  const loadPosts = async () => {
    try {
      setLoading(true);

      const constraints = [orderBy("updatedAt", "desc")];

      if (requestParams.status !== "all") {
        constraints.push(where("status", "==", requestParams.status));
      }

      if (requestParams.subject !== "all") {
        constraints.push(where("subject", "==", requestParams.subject));
      }

      // lấy tương đối rộng rồi filter search phía client
      constraints.push(limit(100));

      const q = fsQuery(collection(db, "documents"), ...constraints);
      const snapshot = await getDocs(q);

      let items = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      if (requestParams.search) {
        const keyword = requestParams.search;
        items = items.filter((post) => {
          const haystack = [
            post.title,
            post.subject,
            post.authorName,
            post.description,
            ...(Array.isArray(post.tags) ? post.tags : []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(keyword);
        });
      }

      const startIndex = (requestParams.page - 1) * requestParams.limit;
      const endIndex = startIndex + requestParams.limit;

      setTotal(items.length);
      setPosts(items.slice(startIndex, endIndex));
    } catch (error) {
      console.error("Không tải được danh sách tài liệu", error);
      toast.error("Không tải được danh sách tài liệu");
    } finally {
      setLoading(false);
    }
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
      title: post.title || "",
      subject: post.subject || SUBJECT_OPTIONS[0],
      authorId: post.authorId || "",
      authorName: post.authorName || "",
      description: post.description || "",
      tagsText: Array.isArray(post.tags) ? post.tags.join(", ") : "",
      status: post.status || "pending",
      fileName: post.fileName || "",
      filePath: post.filePath || "",
      downloadURL: post.downloadURL || "",
      fileSize: post.fileSize || 0,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      subject: form.subject,
      authorId: form.authorId.trim(),
      authorName: form.authorName.trim(),
      description: form.description.trim(),
      tags: form.tagsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status: form.status,

      // các field file
      fileName: form.fileName.trim(),
      filePath: form.filePath.trim(),
      downloadURL: form.downloadURL.trim(),
      fileSize: Number(form.fileSize) || 0,

      updatedAt: serverTimestamp(),
    };

    try {
      if (editingPost) {
        await updateDoc(doc(db, "documents", editingPost.id), payload);
        toast.success("Đã cập nhật tài liệu");
      } else {
        await addDoc(collection(db, "documents"), {
          ...payload,
          createdAt: serverTimestamp(),
          downloads: 0,
          views: 0,
          ratingCount: 0,
          ratingTotal: 0,
        });
        toast.success("Đã tạo tài liệu mới");
      }

      setDialogOpen(false);
      setQueryState((prev) => ({ ...prev, page: 1 }));
      await loadPosts();
    } catch (error) {
      console.error("Không thể lưu tài liệu", error);
      toast.error("Không thể lưu tài liệu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá tài liệu này?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "documents", postId));
      toast.success("Đã xoá tài liệu");
      await loadPosts();
    } catch (error) {
      console.error("Không thể xoá tài liệu", error);
      toast.error("Không thể xoá tài liệu");
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
                value={queryState.search}
                onChange={(event) =>
                  setQueryState((prev) => ({
                    ...prev,
                    search: event.target.value,
                    page: 1,
                  }))
                }
                className="cyber-input pl-9"
                placeholder="Tìm theo tiêu đề, môn học, tác giả..."
                data-testid="posts-search-input"
              />
            </div>

            <Select
              value={queryState.status}
              onValueChange={(value) =>
                setQueryState((prev) => ({ ...prev, status: value, page: 1 }))
              }
            >
              <SelectTrigger className="cyber-input w-[180px]" data-testid="posts-status-filter-select">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-900 text-slate-100">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={queryState.subject}
              onValueChange={(value) =>
                setQueryState((prev) => ({ ...prev, subject: value, page: 1 }))
              }
            >
              <SelectTrigger className="cyber-input w-[190px]" data-testid="posts-subject-filter-select">
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-900 text-slate-100">
                <SelectItem value="all">Tất cả môn học</SelectItem>
                {SUBJECT_OPTIONS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
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
            Tạo tài liệu
          </Button>
        </div>
      </section>

      <section className="glass-panel overflow-hidden rounded-2xl" data-testid="posts-table-section">
        <Table data-testid="posts-table">
          <TableHeader>
            <TableRow className="border-b border-white/10">
              <TableHead className="text-xs uppercase text-slate-400">Tài liệu</TableHead>
              <TableHead className="text-xs uppercase text-slate-400">Trạng thái</TableHead>
              <TableHead className="text-xs uppercase text-slate-400">Tác giả</TableHead>
              <TableHead className="text-xs uppercase text-slate-400">Lượt xem</TableHead>
              <TableHead className="text-xs uppercase text-slate-400">Cập nhật</TableHead>
              <TableHead className="text-right text-xs uppercase text-slate-400">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                  Không có tài liệu phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id} className="border-b border-white/5 hover:bg-white/5">
                  <TableCell>
                    <p className="font-semibold text-slate-100">{post.title}</p>
                    <p className="text-xs text-slate-400">{post.subject}</p>
                    <p className="text-xs text-slate-500">{post.fileName || "Chưa có file"}</p>
                  </TableCell>

                  <TableCell>
                    <StatusBadge type="post" value={post.status || "pending"} />
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-slate-200">{post.authorName || "--"}</span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-slate-300">{post.views ?? 0}</span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-slate-300">
                      {formatDate(post.updatedAt)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        variant="ghost"
                        className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                        onClick={() => openEditDialog(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        className="border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                        onClick={() => handleDelete(post.id)}
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

      <section className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3">
        <p className="text-sm text-slate-300">
          Trang {queryState.page}/{totalPages} • Tổng {total} tài liệu
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={queryState.page <= 1}
            onClick={() =>
              setQueryState((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            Trước
          </Button>

          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={queryState.page >= totalPages}
            onClick={() =>
              setQueryState((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Sau
          </Button>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Cập nhật tài liệu" : "Tạo tài liệu mới"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Điền thông tin tài liệu theo metadata của Firestore.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Tiêu đề</label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className="cyber-input"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Môn học</label>
                <Select
                  value={form.subject}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, subject: value }))
                  }
                >
                  <SelectTrigger className="cyber-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900 text-slate-100">
                    {SUBJECT_OPTIONS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Trạng thái</label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="cyber-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900 text-slate-100">
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Author ID</label>
                <Input
                  value={form.authorId}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, authorId: event.target.value }))
                  }
                  className="cyber-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Tên tác giả</label>
                <Input
                  value={form.authorName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, authorName: event.target.value }))
                  }
                  className="cyber-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Tags (phân tách bằng dấu phẩy)</label>
              <Input
                value={form.tagsText}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tagsText: event.target.value }))
                }
                className="cyber-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={5}
                required
                className="cyber-input w-full rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Tên file</label>
                <Input
                  value={form.fileName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, fileName: event.target.value }))
                  }
                  className="cyber-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Kích thước file</label>
                <Input
                  type="number"
                  value={form.fileSize}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, fileSize: event.target.value }))
                  }
                  className="cyber-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">File path</label>
              <Input
                value={form.filePath}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, filePath: event.target.value }))
                }
                className="cyber-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Download URL</label>
              <Input
                value={form.downloadURL}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, downloadURL: event.target.value }))
                }
                className="cyber-input"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                onClick={() => setDialogOpen(false)}
              >
                Huỷ
              </Button>

              <Button
                type="submit"
                className="border-0 bg-cyan-600 text-white hover:bg-cyan-500"
                disabled={saving}
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