import { Badge } from "../../admin/components/badge";

const POST_STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

const ROLE_STYLES = {
  admin: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  moderator: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  student: "bg-slate-500/10 text-slate-300 border-slate-500/30",
};

const LOCK_STYLES = {
  locked: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

export const StatusBadge = ({ type, value, dataTestId }) => {
  let style = "bg-slate-500/10 text-slate-300 border-slate-500/30";

  if (type === "post") {
    style = POST_STATUS_STYLES[value] ?? style;
  }
  if (type === "role") {
    style = ROLE_STYLES[value] ?? style;
  }
  if (type === "lock") {
    style = LOCK_STYLES[value] ?? style;
  }

  return (
    <Badge
      variant="outline"
      className={`border px-2.5 py-1 text-xs font-semibold capitalize ${style}`}
      data-testid={dataTestId}
    >
      {value}
    </Badge>
  );
};
