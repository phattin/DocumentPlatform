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
import { Pencil, Plus, Search, Trash2, Upload, FileText, X, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "../../admin/components/sonner";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query as fsQuery,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../../lib/firebase";

const SUBJECT_OPTIONS = [
  "Toán cao cấp",
  "Lập trình Java",
  "Cấu trúc dữ liệu",
  "Tiếng Anh",
  "Machine Learning",
  "Vật lý đại cương",
  "Lập trình",
  "Công nghệ thông tin",
  "Toán học",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Văn học",
  "Lịch sử",
  "Địa lý",
];

const STATUS_OPTIONS = ["pending", "approved", "rejected"];

const initialForm = {
  title: "",
  subject: SUBJECT_OPTIONS[0],
  description: "",
  tagsText: "",
  status: "approved",
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

  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setCurrentUserProfile(null);
        return;
      }

      try {
        const q = fsQuery(
          collection(db, "users"),
          where("uid", "==", user.uid),
          limit(1),
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setCurrentUserProfile(snapshot.docs[0].data());
        } else {
          setCurrentUserProfile({
            uid: user.uid,
            name: user.displayName || user.email || "Người dùng",
            email: user.email || "",
            avatar: user.photoURL || "",
            provider: user.providerData?.[0]?.providerId || "email",
          });
        }
      } catch (error) {
        console.error("Không tải được hồ sơ người dùng", error);
        setCurrentUserProfile({
          uid: user.uid,
          name: user.displayName || user.email || "Người dùng",
          email: user.email || "",
          avatar: user.photoURL || "",
          provider: user.providerData?.[0]?.providerId || "email",
        });
      }
    });

    return () => unsubscribe();
  }, []);

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

  const resetFormState = () => {
    setForm(initialForm);
    setEditingPost(null);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadingFile(false);
  };

  const openCreateDialog = () => {
    resetFormState();
    setDialogOpen(true);
  };

  const openEditDialog = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || "",
      subject: post.subject || SUBJECT_OPTIONS[0],
      description: post.description || "",
      tagsText: Array.isArray(post.tags) ? post.tags.join(", ") : "",
      status: post.status || "approved",
    });
    setSelectedFile(null);
    setUploadProgress(0);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetFormState();
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    const input = document.getElementById("posts-file-upload");
    if (input) {
      input.value = "";
    }
  };

  const uploadDocumentFile = async (file, authorUid, title, subject) => {
    setUploadingFile(true);
    setUploadProgress(0);

    try {
      const safeFileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `documents/${authorUid}/${safeFileName}`);

      const metadata = {
        contentType: file.type || "application/octet-stream",
        customMetadata: {
          title: title || "",
          subject: subject || "",
          uploadedBy: authorUid || "",
        },
      };

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 250);

      await uploadBytes(storageRef, file, metadata);
      clearInterval(interval);
      setUploadProgress(100);

      const downloadURL = await getDownloadURL(storageRef);

      return {
        fileName: file.name,
        fileSize: file.size,
        filePath: `documents/${authorUid}/${safeFileName}`,
        downloadURL,
      };
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
      return;
    }

    if (!currentUserProfile) {
      toast.error("Chưa tải xong thông tin người dùng");
      return;
    }

    if (!editingPost && !selectedFile) {
      toast.error("Vui lòng chọn file tài liệu");
      return;
    }

    setSaving(true);

    try {
      let filePayload = {
        fileName: editingPost?.fileName || "",
        filePath: editingPost?.filePath || "",
        downloadURL: editingPost?.downloadURL || "",
        fileSize: editingPost?.fileSize || 0,
      };

      if (selectedFile) {
        filePayload = await uploadDocumentFile(
          selectedFile,
          currentUser.uid,
          form.title.trim(),
          form.subject,
        );
      }

      const payload = {
        title: form.title.trim(),
        subject: form.subject,
        description: form.description.trim(),
        tags: form.tagsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        authorId: currentUser.uid,
        authorName:
          currentUserProfile.name ||
          currentUser.displayName ||
          currentUser.email ||
          "Người dùng",
        updatedAt: serverTimestamp(),
        ...filePayload,
      };

      if (editingPost) {
        await updateDoc(doc(db, "documents", editingPost.id), {
          ...payload,
          status: form.status,
        });
        toast.success("Đã cập nhật tài liệu");
      } else {
        await addDoc(collection(db, "documents"), {
          ...payload,
          status: "approved",
          createdAt: serverTimestamp(),
          downloads: 0,
          views: 0,
          ratingCount: 0,
          ratingTotal: 0,
        });
        toast.success("Đã tạo tài liệu mới");
      }

      handleCloseDialog();
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
                    <StatusBadge type="post" value={post.status || "approved"} />
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

      <Dialog open={dialogOpen} onOpenChange={(open) => (!open ? handleCloseDialog() : setDialogOpen(true))}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Cập nhật tài liệu" : "Tạo tài liệu mới"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingPost
                ? "Chỉnh sửa thông tin tài liệu và có thể thay file nếu cần."
                : "Tài liệu mới sẽ tự động được duyệt sau khi đăng."}
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

              {editingPost && (
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
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Tags (phân tách bằng dấu phẩy)</label>
              <Input
                value={form.tagsText}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tagsText: event.target.value }))
                }
                className="cyber-input"
                placeholder="Ví dụ: java, oop, midterm"
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

            <div className="space-y-3">
              <label className="text-sm text-slate-300">
                {editingPost ? "Thay file tài liệu" : "File tài liệu"}
              </label>

              <div
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  saving || uploadingFile
                    ? "cursor-not-allowed border-white/10 bg-white/5 opacity-70"
                    : "cursor-pointer border-white/15 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10"
                }`}
                onClick={() => {
                  if (!saving && !uploadingFile) {
                    document.getElementById("posts-file-upload")?.click();
                  }
                }}
              >
                <input
                  id="posts-file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                  disabled={saving || uploadingFile}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="h-10 w-10 text-cyan-300" />
                    <div>
                      <p className="font-medium text-slate-100">{selectedFile.name}</p>
                      <p className="text-sm text-slate-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedFile();
                      }}
                    >
                      <X className="h-4 w-4" />
                      Bỏ file
                    </Button>
                  </div>
                ) : editingPost?.fileName ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="h-10 w-10 text-slate-300" />
                    <div>
                      <p className="font-medium text-slate-100">{editingPost.fileName}</p>
                      <p className="text-sm text-slate-400">
                        File hiện tại • bấm để thay file mới
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-10 w-10 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-100">Chọn file tài liệu</p>
                      <p className="text-sm text-slate-400">
                        Hỗ trợ: PDF, DOC, DOCX, PPT, PPTX, TXT
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {(uploadingFile || uploadProgress > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Đang upload file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Người đăng:</span>{" "}
                {currentUserProfile?.name || currentUser?.displayName || currentUser?.email || "--"}
              </p>
              <p>
                <span className="text-slate-400">Email:</span>{" "}
                {currentUserProfile?.email || currentUser?.email || "--"}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                onClick={handleCloseDialog}
              >
                Huỷ
              </Button>

              <Button
                type="submit"
                className="border-0 bg-cyan-600 text-white hover:bg-cyan-500"
                disabled={
                  saving ||
                  uploadingFile ||
                  !currentUser ||
                  !form.title.trim() ||
                  !form.subject ||
                  (!editingPost && !selectedFile)
                }
              >
                {saving || uploadingFile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : editingPost ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}