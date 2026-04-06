import { StatusBadge } from "../../admin/components/StatusBadge";
import { Button } from "../../admin/components/button";
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
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "../../admin/components/sonner";

import {
  collection,
  doc,
  getDocs,
  limit,
  query as fsQuery,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../lib/firebase";

const ROLE_OPTIONS = ["student", "moderator", "admin"];

const formatDate = (value) => {
  if (!value) return "--";

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString("vi-VN");
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleString("vi-VN");
};

const normalizeAccount = (docSnap) => {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    uid: data.uid || docSnap.id,
    avatar: data.avatar || "",
    createdAt: data.createdAt || null,
    email: data.email || "",
    name: data.name || "Chưa có tên",
    provider: data.provider || "email",
    role: data.role || "student",
    isLocked: Boolean(data.isLocked),
  };
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [currentUid, setCurrentUid] = useState("");

  const [query, setQuery] = useState({
    search: "",
    role: "all",
    lock: "all",
    page: 1,
    limit: 8,
  });

  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  const params = useMemo(
    () => ({
      search: query.search.trim().toLowerCase(),
      role: query.role,
      lock: query.lock,
      page: query.page,
      limit: query.limit,
    }),
    [query]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUid(user?.uid || "");
    });

    return () => unsubscribe();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const q = fsQuery(collection(db, "users"), limit(200));
      const snapshot = await getDocs(q);

      let items = snapshot.docs.map(normalizeAccount);

      if (params.search) {
        items = items.filter((account) => {
          const haystack = [
            account.name,
            account.email,
            account.uid,
            account.provider,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(params.search);
        });
      }

      if (params.role !== "all") {
        items = items.filter((account) => account.role === params.role);
      }

      if (params.lock === "locked") {
        items = items.filter((account) => account.isLocked);
      }

      if (params.lock === "active") {
        items = items.filter((account) => !account.isLocked);
      }

      items.sort((a, b) => {
        const aTime =
          a.createdAt?.toDate?.()?.getTime?.() || new Date(a.createdAt || 0).getTime();
        const bTime =
          b.createdAt?.toDate?.()?.getTime?.() || new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });

      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;

      setTotal(items.length);
      setAccounts(items.slice(startIndex, endIndex));
    } catch (error) {
      console.error("Không tải được tài khoản", error);
      toast.error("Không tải được tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [params]);

  const isSelfAccount = (account) => {
    if (!currentUid) return false;
    return account.uid === currentUid;
  };

  const handleRoleChange = async (account, role) => {
    if (isSelfAccount(account)) {
      toast.error("Bạn không thể tự thay đổi quyền của chính mình");
      return;
    }

    try {
      setUpdatingId(account.id);

      await updateDoc(doc(db, "users", account.id), {
        role,
      });

      toast.success("Đã cập nhật phân quyền");
      await loadAccounts();
    } catch (error) {
      console.error("Không thể cập nhật quyền", error);
      toast.error("Không thể cập nhật quyền");
    } finally {
      setUpdatingId("");
    }
  };

  const handleLockToggle = async (account) => {
    if (isSelfAccount(account)) {
      toast.error("Bạn không thể tự khóa tài khoản của chính mình");
      return;
    }

    try {
      setUpdatingId(account.id);

      await updateDoc(doc(db, "users", account.id), {
        isLocked: !account.isLocked,
      });

      toast.success(account.isLocked ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản");
      await loadAccounts();
    } catch (error) {
      console.error("Không thể cập nhật trạng thái khoá", error);
      toast.error("Không thể cập nhật trạng thái khoá");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="space-y-5" data-testid="accounts-page">
      <section
        className="glass-panel rounded-2xl p-4 md:p-5"
        data-testid="accounts-toolbar-section"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={query.search}
              onChange={(event) =>
                setQuery((prev) => ({
                  ...prev,
                  search: event.target.value,
                  page: 1,
                }))
              }
              className="cyber-input pl-9"
              placeholder="Tìm theo tên, email hoặc uid..."
              data-testid="accounts-search-input"
            />
          </div>

          <Select
            value={query.role}
            onValueChange={(value) =>
              setQuery((prev) => ({ ...prev, role: value, page: 1 }))
            }
          >
            <SelectTrigger
              className="cyber-input w-[180px]"
              data-testid="accounts-role-filter-select"
            >
              <SelectValue placeholder="Phân quyền" />
            </SelectTrigger>
            <SelectContent
              className="border-white/10 bg-slate-900 text-slate-100"
              data-testid="accounts-role-filter-menu"
            >
              <SelectItem value="all" data-testid="accounts-role-option-all">
                Tất cả quyền
              </SelectItem>
              {ROLE_OPTIONS.map((role) => (
                <SelectItem
                  key={role}
                  value={role}
                  data-testid={`accounts-role-option-${role}`}
                >
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={query.lock}
            onValueChange={(value) =>
              setQuery((prev) => ({ ...prev, lock: value, page: 1 }))
            }
          >
            <SelectTrigger
              className="cyber-input w-[170px]"
              data-testid="accounts-lock-filter-select"
            >
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent
              className="border-white/10 bg-slate-900 text-slate-100"
              data-testid="accounts-lock-filter-menu"
            >
              <SelectItem value="all" data-testid="accounts-lock-option-all">
                Tất cả
              </SelectItem>
              <SelectItem value="active" data-testid="accounts-lock-option-active">
                Active
              </SelectItem>
              <SelectItem value="locked" data-testid="accounts-lock-option-locked">
                Locked
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section
        className="glass-panel overflow-hidden rounded-2xl"
        data-testid="accounts-table-section"
      >
        <Table data-testid="accounts-table">
          <TableHeader>
            <TableRow
              className="border-b border-white/10"
              data-testid="accounts-header-row"
            >
              <TableHead
                className="text-xs uppercase text-slate-400"
                data-testid="accounts-header-user"
              >
                Người dùng
              </TableHead>
              <TableHead
                className="text-xs uppercase text-slate-400"
                data-testid="accounts-header-role"
              >
                Phân quyền
              </TableHead>
              <TableHead
                className="text-xs uppercase text-slate-400"
                data-testid="accounts-header-status"
              >
                Trạng thái
              </TableHead>
              <TableHead
                className="text-xs uppercase text-slate-400"
                data-testid="accounts-header-provider"
              >
                Provider
              </TableHead>
              <TableHead
                className="text-xs uppercase text-slate-400"
                data-testid="accounts-header-created-at"
              >
                Ngày tạo
              </TableHead>
              <TableHead
                className="text-right text-xs uppercase text-slate-400"
                data-testid="accounts-header-actions"
              >
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow data-testid="accounts-loading-row">
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-slate-400"
                  data-testid="accounts-loading-text"
                >
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow data-testid="accounts-empty-row">
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-slate-400"
                  data-testid="accounts-empty-text"
                >
                  Không có tài khoản phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => {
                const isSelf = isSelfAccount(account);
                const isUpdating = updatingId === account.id;

                return (
                  <TableRow
                    key={account.id}
                    className="border-b border-white/5 hover:bg-white/5"
                    data-testid={`accounts-row-${account.id}`}
                  >
                    <TableCell data-testid={`accounts-user-cell-${account.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-sm font-semibold text-slate-200">
                          {account.avatar ? (
                            <img
                              src={account.avatar}
                              alt={account.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            account.name?.charAt(0)?.toUpperCase() || "U"
                          )}
                        </div>

                        <div className="min-w-0">
                          <p
                            className="truncate font-semibold text-slate-100"
                            data-testid={`accounts-name-${account.id}`}
                          >
                            {account.name}
                            {isSelf && (
                              <span className="ml-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300">
                                Bạn
                              </span>
                            )}
                          </p>
                          <p
                            className="truncate text-xs text-slate-400"
                            data-testid={`accounts-email-${account.id}`}
                          >
                            {account.email}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            UID: {account.uid}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell data-testid={`accounts-role-cell-${account.id}`}>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          type="role"
                          value={account.role}
                          dataTestId={`accounts-role-badge-${account.id}`}
                        />
                        <Select
                          value={account.role}
                          onValueChange={(value) => handleRoleChange(account, value)}
                          disabled={isUpdating || isSelf}
                        >
                          <SelectTrigger
                            className="cyber-input h-8 w-[130px]"
                            data-testid={`accounts-role-select-${account.id}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            className="border-white/10 bg-slate-900 text-slate-100"
                            data-testid={`accounts-role-menu-${account.id}`}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem
                                key={role}
                                value={role}
                                data-testid={`accounts-role-item-${account.id}-${role}`}
                              >
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {isSelf && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Không thể sửa quyền chính mình
                        </p>
                      )}
                    </TableCell>

                    <TableCell data-testid={`accounts-status-cell-${account.id}`}>
                      <StatusBadge
                        type="lock"
                        value={account.isLocked ? "locked" : "active"}
                        dataTestId={`accounts-lock-badge-${account.id}`}
                      />
                    </TableCell>

                    <TableCell data-testid={`accounts-provider-cell-${account.id}`}>
                      <span className="text-sm text-slate-300 capitalize">
                        {account.provider || "--"}
                      </span>
                    </TableCell>

                    <TableCell data-testid={`accounts-created-at-cell-${account.id}`}>
                      <span
                        className="text-sm text-slate-300"
                        data-testid={`accounts-created-at-${account.id}`}
                      >
                        {formatDate(account.createdAt)}
                      </span>
                    </TableCell>

                    <TableCell
                      className="text-right"
                      data-testid={`accounts-actions-cell-${account.id}`}
                    >
                      <Button
                        variant="ghost"
                        disabled={isUpdating || isSelf}
                        onClick={() => handleLockToggle(account)}
                        className={
                          isSelf
                            ? "border border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"
                            : account.isLocked
                            ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                            : "border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                        }
                        data-testid={`accounts-lock-toggle-button-${account.id}`}
                      >
                        {isSelf ? "Chính bạn" : account.isLocked ? "Mở khoá" : "Khoá"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </section>

      <section
        className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3"
        data-testid="accounts-pagination-section"
      >
        <p
          className="text-sm text-slate-300"
          data-testid="accounts-pagination-summary"
        >
          Trang {query.page}/{totalPages} • Tổng {total} tài khoản
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={query.page <= 1}
            onClick={() =>
              setQuery((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            data-testid="accounts-pagination-prev"
          >
            Trước
          </Button>
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={query.page >= totalPages}
            onClick={() =>
              setQuery((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            data-testid="accounts-pagination-next"
          >
            Sau
          </Button>
        </div>
      </section>
    </div>
  );
}