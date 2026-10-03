import { LayoutDashboard, Users, Presentation, FileText, Handshake, FileSignature, CreditCard, Percent, Wallet, FolderKanban, SquareCheckBig, ShieldCheck, Bug, Rocket, GraduationCap, Star, Kanban, Contact, Repeat, RefreshCw, Server, Plug, Dumbbell, Apple, HeartPulse, Ruler, CalendarClock, IdCard, Activity, BarChart3, UserCog, History, ClipboardList, Receipt, Salad, TrendingUp, Image as ImageIcon, type LucideIcon } from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard, leads: Users, demos: Presentation, estimates: FileText, deals: Handshake, agreements: FileSignature,
  payments: CreditCard, commissions: Percent, wallets: Wallet, projects: FolderKanban, tasks: SquareCheckBig, qc: ShieldCheck,
  issues: Bug, deployments: Rocket, trainings: GraduationCap, reviews: Star, board: Kanban, customers: Contact,
  members: Users, memberships: IdCard, plans: ClipboardList, attendance: Activity, appointments: CalendarClock, trainers: UserCog, exercises: Dumbbell,
  workouts: Dumbbell, foods: Apple, diets: Salad, 'health-profiles': HeartPulse, assessments: Ruler, 'progress-logs': TrendingUp, receipts: Receipt, audit: History, reports: BarChart3,
  services: Repeat, renewals: RefreshCw, servers: Server, integrations: Plug,
};
