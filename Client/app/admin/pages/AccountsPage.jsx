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
import { fetchAccounts, updateAccountLock, updateAccountRole } from "../../services/adminApi";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "../../admin/components/sonner";

const ROLE_OPTIONS = ["student", "moderator", "admin"];

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleString("vi-VN");
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [query, setQuery] = useState({ search: "", role: "all", lock: "all", page: 1, limit: 8 });

  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  const params = useMemo(() => {
    const computed = {
      page: query.page,
      limit: query.limit,
      search: query.search || undefined,
      role: query.role === "all" ? undefined : query.role,
    };

    if (query.lock === "locked") {
      computed.is_locked = true;
    }
    if (query.lock === "active") {
      computed.is_locked = false;
    }

    return computed;
  }, [query]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetchAccounts(params);
      setAccounts(response.items ?? []);
      setTotal(response.total ?? 0);
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

  const handleRoleChange = async (accountId, role) => {
    try {
      setUpdatingId(accountId);
      await updateAccountRole(accountId, role);
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
    try {
      setUpdatingId(account.id);
      await updateAccountLock(account.id, !account.is_locked);
      toast.success(account.is_locked ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản");
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
      <section className="glass-panel rounded-2xl p-4 md:p-5" data-testid="accounts-toolbar-section">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={query.search}
              onChange={(event) => setQuery((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
              className="cyber-input pl-9"
              placeholder="Tìm theo tên hoặc email..."
              data-testid="accounts-search-input"
            />
          </div>

          <Select
            value={query.role}
            onValueChange={(value) => setQuery((prev) => ({ ...prev, role: value, page: 1 }))}
          >
            <SelectTrigger className="cyber-input w-[180px]" data-testid="accounts-role-filter-select">
              <SelectValue placeholder="Phân quyền" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900 text-slate-100" data-testid="accounts-role-filter-menu">
              <SelectItem value="all" data-testid="accounts-role-option-all">
                Tất cả quyền
              </SelectItem>
              {ROLE_OPTIONS.map((role) => (
                <SelectItem key={role} value={role} data-testid={`accounts-role-option-${role}`}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={query.lock}
            onValueChange={(value) => setQuery((prev) => ({ ...prev, lock: value, page: 1 }))}
          >
            <SelectTrigger className="cyber-input w-[170px]" data-testid="accounts-lock-filter-select">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900 text-slate-100" data-testid="accounts-lock-filter-menu">
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

      <section className="glass-panel overflow-hidden rounded-2xl" data-testid="accounts-table-section">
        <Table data-testid="accounts-table">
          <TableHeader>
            <TableRow className="border-b border-white/10" data-testid="accounts-header-row">
              <TableHead className="text-xs uppercase text-slate-400" data-testid="accounts-header-user">
                Người dùng
              </TableHead>
              <TableHead className="text-xs uppercase text-slate-400" data-testid="accounts-header-role">
                Phân quyền
              </TableHead>
              <TableHead className="text-xs uppercase text-slate-400" data-testid="accounts-header-status">
                Trạng thái
              </TableHead>
              <TableHead className="text-xs uppercase text-slate-400" data-testid="accounts-header-last-active">
                Hoạt động gần nhất
              </TableHead>
              <TableHead className="text-right text-xs uppercase text-slate-400" data-testid="accounts-header-actions">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow data-testid="accounts-loading-row">
                <TableCell colSpan={5} className="py-8 text-center text-slate-400" data-testid="accounts-loading-text">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow data-testid="accounts-empty-row">
                <TableCell colSpan={5} className="py-8 text-center text-slate-400" data-testid="accounts-empty-text">
                  Không có tài khoản phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`accounts-row-${account.id}`}>
                  <TableCell data-testid={`accounts-user-cell-${account.id}`}>
                    <p className="font-semibold text-slate-100" data-testid={`accounts-name-${account.id}`}>
                      {account.full_name}
                    </p>
                    <p className="text-xs text-slate-400" data-testid={`accounts-email-${account.id}`}>
                      {account.email}
                    </p>
                  </TableCell>
                  <TableCell data-testid={`accounts-role-cell-${account.id}`}>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="role" value={account.role} dataTestId={`accounts-role-badge-${account.id}`} />
                      <Select
                        value={account.role}
                        onValueChange={(value) => handleRoleChange(account.id, value)}
                        disabled={updatingId === account.id}
                      >
                        <SelectTrigger className="cyber-input h-8 w-[130px]" data-testid={`accounts-role-select-${account.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-slate-900 text-slate-100" data-testid={`accounts-role-menu-${account.id}`}>
                          {ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role} value={role} data-testid={`accounts-role-item-${account.id}-${role}`}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell data-testid={`accounts-status-cell-${account.id}`}>
                    <StatusBadge
                      type="lock"
                      value={account.is_locked ? "locked" : "active"}
                      dataTestId={`accounts-lock-badge-${account.id}`}
                    />
                  </TableCell>
                  <TableCell data-testid={`accounts-last-active-cell-${account.id}`}>
                    <span className="text-sm text-slate-300" data-testid={`accounts-last-active-${account.id}`}>
                      {formatDate(account.last_active_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right" data-testid={`accounts-actions-cell-${account.id}`}>
                    <Button
                      variant="ghost"
                      disabled={updatingId === account.id}
                      onClick={() => handleLockToggle(account)}
                      className={
                        account.is_locked
                          ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          : "border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                      }
                      data-testid={`accounts-lock-toggle-button-${account.id}`}
                    >
                      {account.is_locked ? "Mở khoá" : "Khoá"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3" data-testid="accounts-pagination-section">
        <p className="text-sm text-slate-300" data-testid="accounts-pagination-summary">
          Trang {query.page}/{totalPages} • Tổng {total} tài khoản
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={query.page <= 1}
            onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
            data-testid="accounts-pagination-prev"
          >
            Trước
          </Button>
          <Button
            variant="secondary"
            className="border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
            disabled={query.page >= totalPages}
            onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
            data-testid="accounts-pagination-next"
          >
            Sau
          </Button>
        </div>
      </section>
    </div>
  );
}
