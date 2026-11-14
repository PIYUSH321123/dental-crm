// DentFlow Design System Tokens & Role Permission Matrix

export type StatusTone = "green" | "amber" | "red" | "blue" | "grey" | "purple" | "teal";

export const STATUS_PILL_STYLES: Record<StatusTone, string> = {
  green:
    "bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)] border-[var(--df-status-green-border)]",
  teal:
    "bg-[var(--df-teal-soft)] text-[var(--df-teal)] border-[var(--df-teal-border)]",
  amber:
    "bg-[var(--df-status-amber-bg)] text-[var(--df-status-amber-text)] border-[var(--df-status-amber-border)]",
  red:
    "bg-[var(--df-status-red-bg)] text-[var(--df-status-red-text)] border-[var(--df-status-red-border)]",
  blue:
    "bg-[var(--df-status-blue-bg)] text-[var(--df-status-blue-text)] border-[var(--df-status-blue-border)]",
  grey:
    "bg-[var(--df-status-grey-bg)] text-[var(--df-status-grey-text)] border-[var(--df-status-grey-border)]",
  purple:
    "bg-[var(--df-status-purple-bg)] text-[var(--df-status-purple-text)] border-[var(--df-status-purple-border)]",
};

export type DentflowRoleKey =
  | "Owner"
  | "Branch mgr"
  | "Dentist"
  | "Visiting"
  | "Assistant"
  | "Front desk"
  | "Accounts";

export type PermissionAccessLevel = "F" | "V" | "O" | "-";
export type PermissionCode = PermissionAccessLevel;

export type PermissionRowKey =
  | "view_patient_records"
  | "edit_chart_plans"
  | "write_prescriptions"
  | "book_move_appointments"
  | "collect_payments_refunds"
  | "give_discounts_over_10"
  | "see_all_branch_revenue"
  | "commission_payroll"
  | "send_campaigns"
  | "inventory_po"
  | "sterilisation_log"
  | "export_patient_data";

export interface RolePermissionRow {
  key: PermissionRowKey;
  label: string;
  levels: Record<DentflowRoleKey, PermissionAccessLevel>;
}

export const DENTFLOW_ROLES: DentflowRoleKey[] = [
  "Owner",
  "Branch mgr",
  "Dentist",
  "Visiting",
  "Assistant",
  "Front desk",
  "Accounts",
];

// Exact matrix from Settings, users & roles
export const INITIAL_ROLE_PERMISSIONS: RolePermissionRow[] = [
  {
    key: "view_patient_records",
    label: "View patient records",
    levels: {
      Owner: "F",
      "Branch mgr": "V",
      Dentist: "F",
      Visiting: "O",
      Assistant: "V",
      "Front desk": "V",
      Accounts: "-",
    },
  },
  {
    key: "edit_chart_plans",
    label: "Edit chart & treatment plans",
    levels: {
      Owner: "F",
      "Branch mgr": "-",
      Dentist: "F",
      Visiting: "O",
      Assistant: "-",
      "Front desk": "-",
      Accounts: "-",
    },
  },
  {
    key: "write_prescriptions",
    label: "Write prescriptions",
    levels: {
      Owner: "F",
      "Branch mgr": "-",
      Dentist: "F",
      Visiting: "O",
      Assistant: "-",
      "Front desk": "-",
      Accounts: "-",
    },
  },
  {
    key: "book_move_appointments",
    label: "Book / move appointments",
    levels: {
      Owner: "F",
      "Branch mgr": "F",
      Dentist: "F",
      Visiting: "O",
      Assistant: "V",
      "Front desk": "F",
      Accounts: "-",
    },
  },
  {
    key: "collect_payments_refunds",
    label: "Collect payments & refunds",
    levels: {
      Owner: "F",
      "Branch mgr": "F",
      Dentist: "V",
      Visiting: "-",
      Assistant: "-",
      "Front desk": "F",
      Accounts: "F",
    },
  },
  {
    key: "give_discounts_over_10",
    label: "Give discounts > 10%",
    levels: {
      Owner: "F",
      "Branch mgr": "F",
      Dentist: "-",
      Visiting: "-",
      Assistant: "-",
      "Front desk": "-",
      Accounts: "-",
    },
  },
  {
    key: "see_all_branch_revenue",
    label: "See all-branch revenue",
    levels: {
      Owner: "F",
      "Branch mgr": "-",
      Dentist: "-",
      Visiting: "-",
      Assistant: "-",
      "Front desk": "-",
      Accounts: "V",
    },
  },
  {
    key: "commission_payroll",
    label: "Commission & payroll",
    levels: {
      Owner: "F",
      "Branch mgr": "-",
      Dentist: "-",
      Visiting: "O",
      Assistant: "-",
      "Front desk": "-",
      Accounts: "F",
    },
  },
  {
    key: "send_campaigns",
    label: "Send campaigns",
    levels: {
      Owner: "F",
      "Branch mgr": "F",
      Dentist: "-",
      Visiting: "-",
      Assistant: "-",
      "Front desk": "V",
      Accounts: "-",
    },
  },
  {
    key: "inventory_po",
    label: "Inventory & purchase orders",
    levels: {
      Owner: "F",
      "Branch mgr": "F",
      Dentist: "V",
      Visiting: "-",
      Assistant: "F",
      "Front desk": "-",
      Accounts: "V",
    },
  },
  {
    key: "sterilisation_log",
    label: "Sterilisation log",
    levels: {
      Owner: "F",
      "Branch mgr": "V",
      Dentist: "V",
      Visiting: "-",
      Assistant: "F",
      "Front desk": "-",
      Accounts: "-",
    },
  },
  {
    key: "export_patient_data",
    label: "Export patient data",
    levels: {
      Owner: "F",
      "Branch mgr": "-",
      Dentist: "-",
      Visiting: "-",
      Assistant: "-",
      "Front desk": "-",
      Accounts: "-",
    },
  },
];

export interface SidebarSubTab {
  id: string;
  label: string;
  slug: string;
  badgeText?: string;
}

export interface SidebarNavItem {
  id: string;
  label: string;
  slug: string; // relative to /app
  badgeType?: "unique" | "new" | "count";
  badgeText?: string;
  requiredPermission?: PermissionRowKey;
  ownerGroupOnly?: boolean;
  subTabs?: SidebarSubTab[];
}

export interface SidebarNavSection {
  title: string;
  items: SidebarNavItem[];
}

export const DENTFLOW_SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    title: "",
    items: [
      { id: "dashboard", label: "Dashboard", slug: "today" },
      {
        id: "patients",
        label: "Patients",
        slug: "patients",
        requiredPermission: "view_patient_records",
      },
      {
        id: "calendar",
        label: "Appointments",
        slug: "calendar",
        requiredPermission: "book_move_appointments",
      },
      {
        id: "video-consult",
        label: "Video consultation",
        slug: "video-consult",
        badgeType: "unique",
        badgeText: "Live",
        requiredPermission: "book_move_appointments",
      },
      {
        id: "gap-filler",
        label: "Gap filler",
        slug: "gap-filler",
        badgeType: "unique",
        badgeText: "Unique",
        requiredPermission: "book_move_appointments",
      },
      {
        id: "ai-receptionist",
        label: "AI assistant",
        slug: "ai-receptionist",
        badgeType: "unique",
        badgeText: "Unique",
        requiredPermission: "book_move_appointments",
      },
    ],
  },
  {
    title: "CLINICAL",
    items: [
      {
        id: "treatment-plans",
        label: "Treatment plans",
        slug: "treatment-plans",
        requiredPermission: "view_patient_records",
      },
      {
        id: "post-op",
        label: "Post-op check-ins",
        slug: "post-op",
        badgeType: "count",
        badgeText: "2",
        requiredPermission: "view_patient_records",
      },
      {
        id: "prescriptions",
        label: "Prescriptions",
        slug: "prescriptions",
        requiredPermission: "write_prescriptions",
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      {
        id: "billing",
        label: "Billing",
        slug: "billing",
        requiredPermission: "collect_payments_refunds",
      },
      {
        id: "insurance",
        label: "Insurance & TPA",
        slug: "insurance",
        requiredPermission: "collect_payments_refunds",
      },
      {
        id: "treatment-recovery",
        label: "Treatment recovery",
        slug: "treatment-recovery",
        badgeType: "unique",
        badgeText: "Unique",
        requiredPermission: "send_campaigns",
      },
      {
        id: "recall-campaigns",
        label: "Recall & campaigns",
        slug: "recall-campaigns",
        requiredPermission: "send_campaigns",
      },
    ],
  },
  {
    title: "GROWTH",
    items: [
      {
        id: "patient-insights",
        label: "Patient insights",
        slug: "patient-insights",
        badgeType: "new",
        badgeText: "New",
        requiredPermission: "see_all_branch_revenue",
      },
      {
        id: "group-dashboard",
        label: "All branches",
        slug: "group-dashboard",
        requiredPermission: "see_all_branch_revenue",
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        id: "inventory",
        label: "Inventory & costing",
        slug: "inventory",
        requiredPermission: "inventory_po",
      },
      {
        id: "lab-cases",
        label: "Lab cases",
        slug: "lab-cases",
        requiredPermission: "view_patient_records",
      },
      {
        id: "sterilisation",
        label: "Sterilisation",
        slug: "sterilisation",
        requiredPermission: "sterilisation_log",
      },
      {
        id: "staff-commission",
        label: "Staff & commission",
        slug: "staff-commission",
        requiredPermission: "commission_payroll",
      },
    ],
  },
  {
    title: "SETTINGS & REPORTS",
    items: [
      {
        id: "visiting-specialists",
        label: "Visiting specialists",
        slug: "visiting-specialists",
        requiredPermission: "see_all_branch_revenue",
      },
      {
        id: "reports",
        label: "Reports & P&L",
        slug: "reports",
        requiredPermission: "see_all_branch_revenue",
      },
      {
        id: "settings",
        label: "Settings",
        slug: "settings",
        ownerGroupOnly: true,
      },
    ],
  },
];

export function canRoleAccessNavItem(
  role: DentflowRoleKey,
  item: SidebarNavItem,
  matrix: RolePermissionRow[] = INITIAL_ROLE_PERMISSIONS,
): boolean {
  if (role === "Owner") return true;
  if (item.ownerGroupOnly) return role === "Branch mgr";
  if (!item.requiredPermission) return true;
  const row = matrix.find((r) => r.key === item.requiredPermission);
  if (!row) return true;
  return row.levels[role] !== "-";
}

export function canRoleAccessAppSlug(
  role: DentflowRoleKey,
  slug: string,
  matrix: RolePermissionRow[] = INITIAL_ROLE_PERMISSIONS,
): boolean {
  const cleanSlug = slug.replace(/^\/app\/?/, "").split("/")[0].split("?")[0] || "today";
  if (cleanSlug === "dashboard" || cleanSlug === "today") return true;
  if (cleanSlug === "dental-chart" || cleanSlug === "explainers") {
    const row = matrix.find((r) => r.key === "view_patient_records");
    return !row || row.levels[role] !== "-";
  }
  for (const section of DENTFLOW_SIDEBAR_SECTIONS) {
    const found = section.items.find((i) => i.slug === cleanSlug);
    if (found) {
      return canRoleAccessNavItem(role, found, matrix);
    }
  }
  return true;
}

export const ROLE_USER_PROFILES: Record<
  DentflowRoleKey,
  { name: string; subtitle: string; initials: string }
> = {
  Owner: {
    name: "Dr. Sneha Kulkarni",
    subtitle: "Dentist — owner",
    initials: "SK",
  },
  "Branch mgr": {
    name: "Prakash Jha",
    subtitle: "Branch manager",
    initials: "PJ",
  },
  Dentist: {
    name: "Dr. Arjun Mehta",
    subtitle: "Associate dentist",
    initials: "AM",
  },
  Visiting: {
    name: "Dr. Farhan Ali",
    subtitle: "Implantologist (visiting)",
    initials: "FA",
  },
  Assistant: {
    name: "Ravi Gaikwad",
    subtitle: "Dental assistant",
    initials: "RG",
  },
  "Front desk": {
    name: "Anita Pawar",
    subtitle: "Front desk",
    initials: "AP",
  },
  Accounts: {
    name: "Meenakshi Joshi",
    subtitle: "Accounts & billing",
    initials: "MJ",
  },
};

