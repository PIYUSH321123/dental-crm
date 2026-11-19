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
      "Branch mgr": "V",
      Dentist: "V",
      Visiting: "V",
      Assistant: "V",
      "Front desk": "V",
      Accounts: "V",
    },
  },
  {
    key: "commission_payroll",
    label: "Commission & payroll",
    levels: {
      Owner: "F",
      "Branch mgr": "V",
      Dentist: "V",
      Visiting: "O",
      Assistant: "V",
      "Front desk": "V",
      Accounts: "F",
    },
  },
  {
    key: "send_campaigns",
    label: "Send campaigns",
    levels: {
      Owner: "F",
      "Branch mgr": "F",
      Dentist: "V",
      Visiting: "V",
      Assistant: "V",
      "Front desk": "V",
      Accounts: "V",
    },
  },
  {
    key: "inventory_po",
    label: "Inventory & purchase orders",
    levels: {
      Owner: "F",
      "Branch mgr": "F",
      Dentist: "V",
      Visiting: "V",
      Assistant: "F",
      "Front desk": "V",
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
      Visiting: "V",
      Assistant: "F",
      "Front desk": "V",
      Accounts: "V",
    },
  },
  {
    key: "export_patient_data",
    label: "Export patient data",
    levels: {
      Owner: "F",
      "Branch mgr": "V",
      Dentist: "V",
      Visiting: "V",
      Assistant: "V",
      "Front desk": "V",
      Accounts: "V",
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
  allowedRoles?: DentflowRoleKey[];
  ownerGroupOnly?: boolean;
  subTabs?: SidebarSubTab[];
}

export interface SidebarNavSection {
  title: string;
  items: SidebarNavItem[];
}

export const DENTFLOW_SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    title: "TODAY",
    items: [
      { id: "dashboard", label: "Dashboard", slug: "today" },
      {
        id: "calendar",
        label: "Appointments",
        slug: "calendar",
        requiredPermission: "book_move_appointments",
        allowedRoles: ["Owner", "Branch mgr", "Dentist", "Visiting", "Assistant", "Front desk"],
      },
      {
        id: "video-consult",
        label: "Video consultation",
        slug: "video-consult",
        requiredPermission: "book_move_appointments",
        allowedRoles: ["Owner", "Branch mgr", "Dentist", "Visiting", "Front desk"],
      },
      {
        id: "gap-filler",
        label: "Gap filler",
        slug: "gap-filler",
        requiredPermission: "book_move_appointments",
        allowedRoles: ["Owner", "Branch mgr", "Front desk"],
      },
      {
        id: "ai-receptionist",
        label: "AI assistant",
        slug: "ai-receptionist",
        requiredPermission: "book_move_appointments",
        allowedRoles: ["Owner", "Branch mgr", "Front desk"],
      },
    ],
  },
  {
    title: "PATIENTS & CLINICAL",
    items: [
      {
        id: "patients",
        label: "Patients",
        slug: "patients",
        requiredPermission: "view_patient_records",
        allowedRoles: ["Owner", "Branch mgr", "Dentist", "Visiting", "Assistant", "Front desk"],
      },
      {
        id: "dental-chart",
        label: "Dental chart",
        slug: "dental-chart",
        requiredPermission: "view_patient_records",
        allowedRoles: ["Owner", "Branch mgr", "Dentist", "Visiting", "Assistant", "Front desk"],
      },
      {
        id: "treatment-plans",
        label: "Treatment plans",
        slug: "treatment-plans",
        requiredPermission: "view_patient_records",
        allowedRoles: ["Owner", "Branch mgr", "Dentist", "Visiting", "Front desk"],
      },
      {
        id: "post-op",
        label: "Post-op check-ins",
        slug: "post-op",
        badgeType: "count",
        badgeText: "2",
        requiredPermission: "view_patient_records",
        allowedRoles: ["Owner", "Branch mgr", "Dentist", "Visiting", "Assistant", "Front desk"],
      },
      {
        id: "prescriptions",
        label: "Prescriptions",
        slug: "prescriptions",
        requiredPermission: "write_prescriptions",
        allowedRoles: ["Owner", "Dentist", "Visiting"],
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
        allowedRoles: ["Owner", "Branch mgr", "Front desk", "Accounts"],
      },
      {
        id: "insurance",
        label: "Insurance & TPA",
        slug: "insurance",
        requiredPermission: "collect_payments_refunds",
        allowedRoles: ["Owner", "Branch mgr", "Front desk", "Accounts"],
      },
      {
        id: "treatment-recovery",
        label: "Treatment recovery",
        slug: "treatment-recovery",
        requiredPermission: "send_campaigns",
        allowedRoles: ["Owner", "Branch mgr", "Front desk"],
      },
      {
        id: "recall-campaigns",
        label: "Recall & campaigns",
        slug: "recall-campaigns",
        requiredPermission: "send_campaigns",
        allowedRoles: ["Owner", "Branch mgr", "Front desk"],
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
        requiredPermission: "see_all_branch_revenue",
        allowedRoles: ["Owner", "Branch mgr"],
      },
      {
        id: "group-dashboard",
        label: "All branches",
        slug: "group-dashboard",
        requiredPermission: "see_all_branch_revenue",
        allowedRoles: ["Owner", "Branch mgr", "Accounts"],
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
        allowedRoles: ["Owner", "Branch mgr", "Assistant", "Accounts"],
      },
      {
        id: "lab-cases",
        label: "Lab cases",
        slug: "lab-cases",
        requiredPermission: "view_patient_records",
        allowedRoles: ["Owner", "Branch mgr", "Dentist", "Visiting", "Assistant"],
      },
      {
        id: "sterilisation",
        label: "Sterilisation",
        slug: "sterilisation",
        requiredPermission: "sterilisation_log",
        allowedRoles: ["Owner", "Branch mgr", "Dentist", "Assistant"],
      },
      {
        id: "staff-commission",
        label: "Staff & commission",
        slug: "staff-commission",
        requiredPermission: "commission_payroll",
        allowedRoles: ["Owner", "Branch mgr", "Accounts"],
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        id: "visiting-specialists",
        label: "Visiting specialists",
        slug: "visiting-specialists",
        requiredPermission: "see_all_branch_revenue",
        allowedRoles: ["Owner", "Branch mgr"],
      },
      {
        id: "reports",
        label: "Reports & P&L",
        slug: "reports",
        requiredPermission: "see_all_branch_revenue",
        allowedRoles: ["Owner", "Branch mgr", "Accounts"],
      },
      {
        id: "settings",
        label: "Settings",
        slug: "settings",
        allowedRoles: ["Owner", "Branch mgr"],
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
  if (item.allowedRoles && !item.allowedRoles.includes(role)) {
    return false;
  }
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

