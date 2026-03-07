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
import { approvePost, fetchPendingModeration, rejectPost } from "../../services/adminApi";
import { Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "../../admin/components/sonner";

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleString("vi-VN");
};

export default function ModerationPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [processingId, setProcessingId] = useState("");

  const limit = 6;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const params = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit,
    }),
    [search, page],
  );

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await fetchPendingModeration(params);
      setItems(response.items ?? []);
      setTotal(response.total ?? 0);
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

  const handleApprove = async (postId) => {
    try {
      setProcessingId(postId);
      await approvePost(postId, "Admin Reviewer");
      toast.success("Đã duyệt bài viết");
      await loadQueue();
    } catch (error) {
      console.error("Duyệt bài thất bại", error);
      toast.error("Duyệt bài thất bại");
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) {
      return;
    }

    try {
      setProcessingId(rejectTarget.id);
      await rejectPost(rejectTarget.id, { reviewer_name: "Admin Reviewer", reason });
      toast.success("Đã từ chối bài viết");
      setRejectTarget(null);
      setReason("");
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
      <section className="glass-panel rounded-2xl p-4 md:p-5" data-testid="moderation-toolbar-section">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm trong hàng chờ duyệt..."
            className="cyber-input pl-9"
            data-testid="moderation-search-input"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="moderation-card-grid">
        {loading ? (
          <p className="col-span-full rounded-xl border border-white/10 bg-slate-900/40 p-5 text-slate-300" data-testid="moderation-loading-text">
            Đang tải hàng chờ kiểm duyệt...
          </p>
        ) : items.length === 0 ? (
          <p className="col-span-full rounded-xl border border-white/10 bg-slate-900/40 p-5 text-slate-300" data-testid="moderation-empty-text">
            Không có bài viết nào đang chờ duyệt.
          </p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="glass-panel fade-slide rounded-2xl p-4" data-testid={`moderation-card-${item.id}`}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-white" data-testid={`moderation-title-${item.id}`}>
                  {item.title}
                </h3>
                <StatusBadge type="post" value={item.status} dataTestId={`moderation-status-${item.id}`} />
              </div>

              <p className="mb-3 text-sm text-slate-300" data-testid={`moderation-description-${item.id}`}>
                {item.description}
              </p>

              <div className="mb-3 flex flex-wrap gap-2" data-testid={`moderation-tags-${item.id}`}>
                {item.tags.map((tag) => (
                  <span key={`${item.id}-${tag}`} className="tag-chip" data-testid={`moderation-tag-${item.id}-${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-400" data-testid={`moderation-meta-${item.id}`}>
                {item.subject} • bởi {item.author_name} • {formatDate(item.created_at)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleApprove(item.id)}
                  disabled={processingId === item.id}
                  className="bg-emerald-600 text-white hover:bg-emerald-500"
                  data-testid={`moderation-approve-button-${item.id}`}
                >
                  <Check className="h-4 w-4" />
                  Duyệt
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setRejectTarget(item)}
                  className="border border-rose-400/35 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                  data-testid={`moderation-reject-button-${item.id}`}
                >
                  <X className="h-4 w-4" />
                  Từ chối
                </Button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3" data-testid="moderation-pagination-section">
        <p className="text-sm text-slate-300" data-testid="moderation-pagination-summary">
          Trang {page}/{totalPages} • Tổng {total} bài chờ duyệt
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            data-testid="moderation-pagination-prev"
          >
            Trước
          </Button>
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            data-testid="moderation-pagination-next"
          >
            Sau
          </Button>
        </div>
      </section>

      <Dialog open={Boolean(rejectTarget)} onOpenChange={(open) => (!open ? setRejectTarget(null) : null)}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100" data-testid="moderation-reject-dialog">
          <DialogHeader>
            <DialogTitle data-testid="moderation-reject-dialog-title">Từ chối bài viết</DialogTitle>
            <DialogDescription className="text-slate-400" data-testid="moderation-reject-dialog-description">
              Ghi rõ lý do để người đăng có thể chỉnh sửa và gửi lại.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-slate-300" data-testid="moderation-reject-post-title">
              {rejectTarget?.title}
            </p>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="cyber-input w-full rounded-md px-3 py-2 text-sm"
              placeholder="Nhập lý do từ chối..."
              data-testid="moderation-reject-reason-input"
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
              data-testid="moderation-reject-cancel-button"
            >
              Huỷ
            </Button>
            <Button
              className="border-0 bg-rose-600 text-white hover:bg-rose-500"
              onClick={handleReject}
              disabled={reason.trim().length < 3 || (rejectTarget && processingId === rejectTarget.id)}
              data-testid="moderation-reject-submit-button"
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
