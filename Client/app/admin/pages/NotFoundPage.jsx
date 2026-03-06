import { Button } from "../../admin/components/button";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] p-6" data-testid="not-found-page">
      <div className="glass-panel max-w-lg space-y-4 rounded-2xl p-8 text-center" data-testid="not-found-card">
        <div className="mx-auto w-fit rounded-full bg-rose-500/10 p-4 text-rose-300" data-testid="not-found-icon">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-white" data-testid="not-found-title">
          Trang không tồn tại
        </h1>
        <p className="text-sm text-slate-400" data-testid="not-found-description">
          Đường dẫn bạn truy cập không hợp lệ. Vui lòng quay lại trang quản trị.
        </p>
        <Button asChild className="bg-cyan-600 text-white hover:bg-cyan-500" data-testid="not-found-back-button">
          <Link to="/admin/dashboard">Về Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
