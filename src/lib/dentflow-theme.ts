// DentFlow Design System Tokens & O04 Role Permission Matrix

export type StatusTone = "green" | "amber" | "red" | "blue" | "grey" | "purple";

export const STATUS_PILL_STYLES: Record<StatusTone, string> = {
  green:
    "bg-[var(--df-status-green-bg)] text-[var(--df-status-green-text)] border-[var(--df-status-green-border)]",
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

// Exact matrix from Screen O04 (Settings, users & roles)
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

export interface SidebarNavItem {
  id: string;
  screenId: string;
  label: string;
  slug: string; // relative to /c/[company]/dashboard
  badgeType?: "unique" | "new" | "count";
  badgeText?: string;
  requiredPermission?: PermissionRowKey;
  ownerGroupOnly?: boolean;
}

export interface SidebarNavSection {
  title: string;
  items: SidebarNavItem[];
}

export const DENTFLOW_SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    title: "FRONT DESK",
    items: [
      { id: "today", screenId: "C01", label: "Today", slug: "" },
      {
        id: "calendar",
        screenId: "C02",
        label: "Calendar",
        slug: "calendar",
        requiredPermission: "book_move_appointments",
      },
      {
        id: "patients",
        screenId: "C03",
        label: "Patients",
        slug: "patients",
        requiredPermission: "view_patient_records",
      },
      {
        id: "gap-filler",
        screenId: "C11",
        label: "Gap filler",
        slug: "gap-filler",
        badgeType: "unique",
        badgeText: "Unique",
        requiredPermission: "book_move_appointments",
      },
      {
        id: "ai-receptionist",
        screenId: "C17",
        label: "AI receptionist",
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
        id: "dental-chart",
        screenId: "C04",
        label: "Dental chart",
        slug: "dental-chart",
        requiredPermission: "view_patient_records",
      },
      {
        id: "treatment-plans",
        screenId: "C05",
        label: "Treatment plans",
        slug: "treatment-plans",
        requiredPermission: "view_patient_records",
      },
      {
        id: "explainers",
        screenId: "C06",
        label: "Explainers",
        slug: "explainers",
        badgeType: "unique",
        badgeText: "Unique",
        requiredPermission: "view_patient_records",
      },
      {
        id: "prescriptions",
        screenId: "C07",
        label: "Prescriptions",
        slug: "prescriptions",
        requiredPermission: "write_prescriptions",
      },
      {
        id: "post-op",
        screenId: "C08",
        label: "Post-op check-ins",
        slug: "post-op",
        badgeType: "count",
        badgeText: "2",
        requiredPermission: "view_patient_records",
      },
    ],
  },
  {
    title: "REVENUE & GROWTH",
    items: [
      {
        id: "billing",
        screenId: "C09",
        label: "Billing",
        slug: "billing",
        requiredPermission: "collect_payments_refunds",
      },
      {
        id: "recovery",
        screenId: "C10",
        label: "Treatment recovery",
        slug: "recovery",
        badgeType: "unique",
        badgeText: "Unique",
        requiredPermission: "send_campaigns",
      },
      {
        id: "campaigns",
        screenId: "C12",
        label: "Recall & campaigns",
        slug: "campaigns",
        requiredPermission: "send_campaigns",
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        id: "inventory",
        screenId: "C13",
        label: "Inventory & costing",
        slug: "inventory",
        requiredPermission: "inventory_po",
      },
      {
        id: "lab-cases",
        screenId: "C14",
        label: "Lab cases",
        slug: "lab-cases",
        requiredPermission: "view_patient_records",
      },
      {
        id: "sterilisation",
        screenId: "C15",
        label: "Sterilisation",
        slug: "sterilisation",
        requiredPermission: "sterilisation_log",
      },
      {
        id: "staff",
        screenId: "C16",
        label: "Staff & commission",
        slug: "staff",
        requiredPermission: "commission_payroll",
      },
    ],
  },
  {
    title: "GROUP (OWNER)",
    items: [
      {
        id: "all-branches",
        screenId: "O01",
        label: "All branches",
        slug: "all-branches",
        requiredPermission: "see_all_branch_revenue",
      },
      {
        id: "patient-insights",
        screenId: "O05",
        label: "Patient insights",
        slug: "patient-insights",
        badgeType: "new",
        badgeText: "New",
        requiredPermission: "see_all_branch_revenue",
      },
      {
        id: "visiting-specialists",
        screenId: "O02",
        label: "Visiting specialists",
        slug: "visiting-specialists",
        requiredPermission: "see_all_branch_revenue",
      },
      {
        id: "reports",
        screenId: "O03",
        label: "Reports & P&L",
        slug: "reports",
        requiredPermission: "see_all_branch_revenue",
      },
      {
        id: "settings",
        screenId: "O04",
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
