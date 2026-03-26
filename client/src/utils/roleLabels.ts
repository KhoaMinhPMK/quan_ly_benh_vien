/**
 * Shared role labels — DRY utility
 * Used by: Header, Sidebar, DashboardPage, UserListPage
 */

export const ROLE_LABELS: Record<string, Record<string, string>> = {
  vi: {
    admin: 'Quản trị viên',
    doctor: 'Bác sĩ',
    nurse: 'Điều dưỡng',
    records_staff: 'Nhân viên hồ sơ',
    receptionist: 'Lễ tân',
  },
  en: {
    admin: 'Administrator',
    doctor: 'Doctor',
    nurse: 'Nurse',
    records_staff: 'Records Staff',
    receptionist: 'Receptionist',
  },
};

/** Get role label for a given language */
export function getRoleLabel(lang: string, role: string): string {
  return ROLE_LABELS[lang]?.[role] || role;
}
