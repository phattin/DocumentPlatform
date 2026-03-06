import { Card, CardContent, CardHeader, CardTitle } from "../../admin/components/card";
import { FileText, ShieldAlert, UserCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchDashboardActivities, fetchDashboardStats } from "../../services/adminApi";

const initialStats = {
  total_posts: 0,
  pending_posts: 0,
  approved_posts: 0,
  rejected_posts: 0,
  total_accounts: 0,
  locked_accounts: 0,
};

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleString("vi-VN");
};

export default function DashboardPage() {
  const [stats, setStats] = useState(initialStats);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsRes, activitiesRes] = await Promise.all([
          fetchDashboardStats(),
          fetchDashboardActivities(),
        ]);
        setStats(statsRes);
        setActivities(activitiesRes.items ?? []);
      } catch (error) {
        console.error("Lỗi tải dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cards = useMemo(
    () => [
      {
        key: "total-posts",
        label: "Tổng bài viết",
        value: stats.total_posts,
        icon: FileText,
        className: "from-cyan-500/20 to-sky-500/10",
      },
      {
        key: "pending-posts",
        label: "Đang chờ duyệt",
        value: stats.pending_posts,
        icon: ShieldAlert,
        className: "from-amber-500/20 to-orange-500/10",
      },
      {
        key: "total-accounts",
        label: "Tổng tài khoản",
        value: stats.total_accounts,
        icon: Users,
        className: "from-indigo-500/20 to-blue-500/10",
      },
      {
        key: "approved-posts",
        label: "Bài đã duyệt",
        value: stats.approved_posts,
        icon: UserCheck,
        className: "from-emerald-500/20 to-cyan-500/10",
      },
    ],
    [stats],
  );

  const statusBars = useMemo(() => {
    const total = stats.total_posts || 1;
    return [
      { key: "approved", label: "Approved", value: stats.approved_posts, color: "bg-emerald-400" },
      { key: "pending", label: "Pending", value: stats.pending_posts, color: "bg-amber-400" },
      { key: "rejected", label: "Rejected", value: stats.rejected_posts, color: "bg-rose-400" },
    ].map((item) => ({
      ...item,
      percent: Math.round((item.value / total) * 100),
    }));
  }, [stats]);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="dashboard-stat-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.key}
              className={`glass-panel overflow-hidden border-white/10 bg-gradient-to-br ${card.className}`}
              data-testid={`dashboard-card-${card.key}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-300" data-testid={`dashboard-card-title-${card.key}`}>
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-4">
                  <p className="text-3xl font-bold text-white" data-testid={`dashboard-card-value-${card.key}`}>
                    {loading ? "..." : card.value}
                  </p>
                  <div
                    className="rounded-lg border border-white/15 bg-slate-900/60 p-2 text-cyan-300"
                    data-testid={`dashboard-card-icon-${card.key}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]" data-testid="dashboard-content-grid">
        <Card className="glass-panel" data-testid="dashboard-status-distribution-card">
          <CardHeader>
            <CardTitle className="text-base text-white" data-testid="dashboard-status-chart-title">
              Phân bố trạng thái bài viết
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusBars.map((item) => (
              <div key={item.key} className="space-y-1" data-testid={`dashboard-status-row-${item.key}`}>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span data-testid={`dashboard-status-label-${item.key}`}>{item.label}</span>
                  <span data-testid={`dashboard-status-value-${item.key}`}>
                    {item.value} ({item.percent}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800" data-testid={`dashboard-status-bar-bg-${item.key}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                    data-testid={`dashboard-status-bar-fill-${item.key}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-panel" data-testid="dashboard-activity-card">
          <CardHeader>
            <CardTitle className="text-base text-white" data-testid="dashboard-activity-title">
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400" data-testid="dashboard-activity-empty">
                Chưa có dữ liệu hoạt động.
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border border-white/10 bg-slate-950/40 p-3"
                  data-testid={`dashboard-activity-item-${activity.id}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-100" data-testid={`activity-title-${activity.id}`}>
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-400" data-testid={`activity-time-${activity.id}`}>
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-cyan-300" data-testid={`activity-action-${activity.id}`}>
                    {activity.action}
                  </p>
                  <p className="text-xs text-slate-400" data-testid={`activity-actor-${activity.id}`}>
                    bởi {activity.actor}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
