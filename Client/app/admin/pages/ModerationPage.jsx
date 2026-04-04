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
import { Check, Download, Search, ShieldAlert, Clock3, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "../../admin/components/sonner";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const formatDate = (value) => {
  if (!value) return "--";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString("vi-VN");
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleString("vi-VN");
};

const isPdfFile = (item) => {
  const fileName = item?.fileName?.toLowerCase() || "";
  const fileUrl = item?.downloadURL?.toLowerCase() || "";
  return fileName.endsWith(".pdf") || fileUrl.includes(".pdf");
};

const getGooglePreviewUrl = (url) => {
  if (!url) return "";
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
};

export default function ModerationPage() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [processingId, setProcessingId] = useState("");

  const limitPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(total / limitPerPage));

  const params = useMemo(
    () => ({
      search: search.trim().toLowerCase(),
      page,
      activeTab,
    }),
    [search, page, activeTab]
  );

  const loadPendingDocuments = async () => {
    const q = query(
      collection(db, "documents"),
      where("status", "==", "pending"),
      limit(100)
    );

    const snapshot = await getDocs(q);

    let docs = snapshot.docs.map((item) => ({
      id: item.id,
      type: "pending",
      ...item.data(),
    }));

    if (params.search) {
      docs = docs.filter((item) => {
        const text = [
          item.title,
          item.subject,
          item.authorName,
          item.description,
          ...(Array.isArray(item.tags) ? item.tags : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(params.search);
      });
    }

    docs.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime?.() || new Date(a.createdAt || 0).getTime();
      const bTime = b.createdAt?.toDate?.()?.getTime?.() || new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });

    return docs;
  };

  const loadReportedDocuments = async () => {
    const reportsQuery = query(
      collection(db, "reports"),
      where("status", "==", "open"),
      limit(200)
    );

    const reportsSnapshot = await getDocs(reportsQuery);
    const reports = reportsSnapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    const grouped = reports.reduce((acc, report) => {
      if (!report.documentId) return acc;
      if (!acc[report.documentId]) acc[report.documentId] = [];
      acc[report.documentId].push(report);
      return acc;
    }, {});

    const documentIds = Object.keys(grouped);

    const merged = await Promise.all(
      documentIds.map(async (documentId) => {
        const docRef = doc(db, "documents", documentId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return null;
        }

        const data = docSnap.data();
        const reportList = grouped[documentId] || [];

        return {
          id: docSnap.id,
          type: "reported",
          ...data,
          reports: reportList,
          reportCount: reportList.length,
          latestReport: reportList[0] || null,
        };
      })
    );

    let results = merged.filter(Boolean);

    if (params.search) {
      results = results.filter((item) => {
        const text = [
          item.title,
          item.subject,
          item.authorName,
          item.description,
          ...(Array.isArray(item.tags) ? item.tags : []),
          ...(item.reports || []).map((r) => `${r.username} ${r.description}`),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(params.search);
      });
    }

    results.sort((a, b) => {
      const aTime =
        a.latestReport?.createdAt?.toDate?.()?.getTime?.() ||
        new Date(a.latestReport?.createdAt || 0).getTime();
      const bTime =
        b.latestReport?.createdAt?.toDate?.()?.getTime?.() ||
        new Date(b.latestReport?.createdAt || 0).getTime();
      return bTime - aTime;
    });

    return results;
  };

  const loadQueue = async () => {
    try {
      setLoading(true);

      const data =
        params.activeTab === "pending"
          ? await loadPendingDocuments()
          : await loadReportedDocuments();

      const start = (params.page - 1) * limitPerPage;
      const end = start + limitPerPage;

      setTotal(data.length);
      setItems(data.slice(start, end));
    } catch (error) {
      console.error("Không tải được hàng chờ kiểm duyệt", error);
      toast.error("Không tải được hàng chờ kiểm duyệt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [params]);

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleDownloadFile = (item) => {
    if (!item?.downloadURL) {
      toast.error("Không có file để tải xuống");
      return;
    }

    const link = window.document.createElement("a");
    link.href = item.downloadURL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = item.fileName || `document-${item.id}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const resolveReportsByDocumentId = async (documentId, nextStatus = "resolved") => {
    const q = query(
      collection(db, "reports"),
      where("documentId", "==", documentId),
      where("status", "==", "open")
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((reportDoc) => {
      batch.update(reportDoc.ref, {
        status: nextStatus,
        reviewedAt: serverTimestamp(),
        reviewedBy: "Admin Reviewer",
      });
    });

    await batch.commit();
  };

  const handleApprove = async (item) => {
    try {
      setProcessingId(item.id);

      await updateDoc(doc(db, "documents", item.id), {
        status: "approved",
        moderationReason: "",
        reviewedBy: "Admin Reviewer",
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (item.type === "reported") {
        await resolveReportsByDocumentId(item.id, "resolved");
      }

      toast.success(
        item.type === "pending"
          ? "Đã duyệt tài liệu"
          : "Đã duyệt tài liệu và đóng các report"
      );

      if (selectedItem?.id === item.id) {
        setDetailOpen(false);
        setSelectedItem(null);
      }

      await loadQueue();
    } catch (error) {
      console.error("Duyệt bài thất bại", error);
      toast.error("Duyệt bài thất bại");
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;

    try {
      setProcessingId(rejectTarget.id);

      await updateDoc(doc(db, "documents", rejectTarget.id), {
        status: "rejected",
        moderationReason: reason.trim(),
        reviewedBy: "Admin Reviewer",
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (rejectTarget.type === "reported") {
        await resolveReportsByDocumentId(rejectTarget.id, "resolved");
      }

      toast.success("Đã từ chối tài liệu");
      setRejectTarget(null);
      setReason("");
      setDetailOpen(false);
      setSelectedItem(null);
      await loadQueue();
    } catch (error) {
      console.error("Từ chối bài thất bại", error);
      toast.error("Từ chối bài thất bại");
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="space-y-5" data-testid="moderation-page">
      <section className="glass-panel rounded-2xl p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                setActiveTab("pending");
                setPage(1);
              }}
              className={
                activeTab === "pending"
                  ? "bg-cyan-600 text-white hover:bg-cyan-500"
                  : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              }
            >
              <Clock3 className="h-4 w-4" />
              Bài mới đăng
            </Button>

            <Button
              type="button"
              onClick={() => {
                setActiveTab("reported");
                setPage(1);
              }}
              className={
                activeTab === "reported"
                  ? "bg-amber-600 text-white hover:bg-amber-500"
                  : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              }
            >
              <ShieldAlert className="h-4 w-4" />
              Bài bị report
            </Button>
          </div>

          <div className="relative w-full md:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={
                activeTab === "pending"
                  ? "Tìm trong bài mới đăng..."
                  : "Tìm trong bài bị report..."
              }
              className="cyber-input pl-9"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="col-span-full rounded-xl border border-white/10 bg-slate-900/40 p-5 text-slate-300">
            Đang tải dữ liệu kiểm duyệt...
          </p>
        ) : items.length === 0 ? (
          <p className="col-span-full rounded-xl border border-white/10 bg-slate-900/40 p-5 text-slate-300">
            {activeTab === "pending"
              ? "Không có tài liệu nào đang chờ duyệt."
              : "Không có tài liệu nào đang bị report."}
          </p>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="glass-panel fade-slide rounded-2xl p-4 flex flex-col h-full min-h-[260px] cursor-pointer transition hover:bg-white/5"
              onClick={() => handleOpenDetail(item)}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-white line-clamp-2">
                  {item.title}
                </h3>
                <StatusBadge type="post" value={item.status || "pending"} />
              </div>

              <p className="mb-3 text-sm text-slate-300 line-clamp-3">
                {item.description || "Không có mô tả"}
              </p>

              <div className="mb-3 flex flex-wrap gap-2">
                {(item.tags || []).slice(0, 3).map((tag) => (
                  <span key={`${item.id}-${tag}`} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-400">
                {item.subject} • bởi {item.authorName || "--"} • {formatDate(item.createdAt)}
              </p>

              {item.type === "reported" && (
                <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
                  <p className="text-sm font-medium text-amber-300">
                    Số report: {item.reportCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Report gần nhất bởi {item.latestReport?.username || "--"} •{" "}
                    {formatDate(item.latestReport?.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-200 line-clamp-2">
                    {item.latestReport?.description || "Không có nội dung report"}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(item);
                  }}
                  disabled={processingId === item.id}
                  className="bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <Check className="h-4 w-4" />
                  {item.type === "pending" ? "Duyệt" : "Giữ bài"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRejectTarget(item);
                  }}
                  className="border border-rose-400/35 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                >
                  <X className="h-4 w-4" />
                  {item.type === "pending" ? "Từ chối" : "Gỡ bài"}
                </Button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3">
        <p className="text-sm text-slate-300">
          Trang {page}/{totalPages} • Tổng {total} mục
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Trước
          </Button>
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Sau
          </Button>
        </div>
      </section>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedItem(null);
        }}
      >
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-[1280px] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 pr-8">
              <span className="line-clamp-2">{selectedItem?.title || "Chi tiết tài liệu"}</span>
              {selectedItem?.status ? (
                <StatusBadge type="post" value={selectedItem.status} />
              ) : null}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Xem thông tin chi tiết và xem trước file tài liệu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-4 overflow-y-auto pr-2">
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <h4 className="mb-3 text-sm font-semibold text-white">Thông tin tài liệu</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-400">Tác giả:</span> {selectedItem?.authorName || "--"}
                  </p>
                  <p>
                    <span className="text-slate-400">Môn học:</span> {selectedItem?.subject || "--"}
                  </p>
                  <p className="break-words">
                    <span className="text-slate-400">Tên file:</span> {selectedItem?.fileName || "--"}
                  </p>
                  <p>
                    <span className="text-slate-400">Kích thước:</span> {selectedItem?.fileSize ?? 0} bytes
                  </p>
                  <p>
                    <span className="text-slate-400">Ngày tạo:</span> {formatDate(selectedItem?.createdAt)}
                  </p>
                  <p>
                    <span className="text-slate-400">Cập nhật:</span> {formatDate(selectedItem?.updatedAt)}
                  </p>
                  <p>
                    <span className="text-slate-400">Lượt xem:</span> {selectedItem?.views ?? 0}
                  </p>
                  <p>
                    <span className="text-slate-400">Lượt tải:</span> {selectedItem?.downloads ?? 0}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <h4 className="mb-3 text-sm font-semibold text-white">Mô tả</h4>
                <p className="text-sm leading-6 text-slate-300">
                  {selectedItem?.description || "Không có mô tả"}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <h4 className="mb-3 text-sm font-semibold text-white">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedItem?.tags || []).length > 0 ? (
                    selectedItem.tags.map((tag) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Không có tag</span>
                  )}
                </div>
              </div>

              {selectedItem?.type === "reported" && (
                <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-amber-300">
                    Danh sách report ({selectedItem?.reportCount || 0})
                  </h4>
                  <div className="space-y-3">
                    {(selectedItem?.reports || []).map((report) => (
                      <div
                        key={report.id}
                        className="rounded-lg border border-white/10 bg-black/20 p-3"
                      >
                        <p className="text-sm font-medium text-slate-100">
                          {report.username || "--"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(report.createdAt)}
                        </p>
                        <p className="mt-2 text-sm text-slate-200">
                          {report.description || "Không có nội dung report"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
              {selectedItem?.downloadURL ? (
                isPdfFile(selectedItem) ? (
                  <div className="overflow-hidden bg-[#0B0C15] min-h-[760px]">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <h4 className="text-sm font-semibold text-white">Xem trước</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDownloadFile(selectedItem)}
                        className="border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                      >
                        <Download className="h-4 w-4" />
                        Tải xuống
                      </Button>
                    </div>

                    <iframe
                      src={getGooglePreviewUrl(selectedItem.downloadURL)}
                      className="w-full min-h-[700px]"
                      title={`Preview ${selectedItem?.title || "document"}`}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[760px] flex-col items-center justify-center gap-3 p-8 text-center">
                    <p className="text-slate-300">Không hỗ trợ xem trước trực tiếp định dạng này.</p>
                    <Button
                      type="button"
                      onClick={() => handleDownloadFile(selectedItem)}
                      className="bg-cyan-600 text-white hover:bg-cyan-500"
                    >
                      <Download className="h-4 w-4" />
                      Tải xuống
                    </Button>
                  </div>
                )
              ) : (
                <div className="flex min-h-[760px] items-center justify-center p-6 text-slate-400">
                  Tài liệu này chưa có file để xem trước.
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="ghost"
              className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              onClick={() => setDetailOpen(false)}
            >
              Đóng
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
              onClick={() => handleDownloadFile(selectedItem)}
              disabled={!selectedItem?.downloadURL}
            >
              <Download className="h-4 w-4" />
              Tải xuống
            </Button>

            {selectedItem && (
              <>
                <Button
                  onClick={() => handleApprove(selectedItem)}
                  disabled={processingId === selectedItem.id}
                  className="bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <Check className="h-4 w-4" />
                  {selectedItem.type === "pending" ? "Duyệt" : "Giữ bài"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setDetailOpen(false);
                    setRejectTarget(selectedItem);
                  }}
                  className="border border-rose-400/35 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                >
                  <X className="h-4 w-4" />
                  {selectedItem.type === "pending" ? "Từ chối" : "Gỡ bài"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setReason("");
          }
        }}
      >
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>
              {rejectTarget?.type === "reported" ? "Gỡ tài liệu bị report" : "Từ chối bài viết"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Nhập lý do để lưu vào kết quả kiểm duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-slate-300">{rejectTarget?.title}</p>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="cyber-input w-full rounded-md px-3 py-2 text-sm"
              placeholder="Nhập lý do..."
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              onClick={() => {
                setRejectTarget(null);
                setReason("");
              }}
            >
              Huỷ
            </Button>
            <Button
              className="border-0 bg-rose-600 text-white hover:bg-rose-500"
              onClick={handleReject}
              disabled={
                reason.trim().length < 3 ||
                (rejectTarget && processingId === rejectTarget.id)
              }
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}