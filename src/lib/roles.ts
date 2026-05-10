export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "超级管理员",
  ADMIN: "管理员",
  ZIBENTONG_GRAD: "资本通毕业生",
  QIDONG_GRAD: "启动资本毕业生",
  ZIBENDAO_GRAD: "资本道毕业生",
  ONLINE_STUDENT: "线上课程学生",
  ENTERPRISE_CLIENT: "企业顾问客户",
  FREE_MEMBER: "免费用户",
};

export const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "#EF4444",
  ADMIN: "#F97316",
  ZIBENTONG_GRAD: "#C9A84C",
  QIDONG_GRAD: "#A88C3A",
  ZIBENDAO_GRAD: "#F5E6C8",
  ONLINE_STUDENT: "#4CAF82",
  ENTERPRISE_CLIENT: "#6B8FD4",
  FREE_MEMBER: "#666660",
};

export const ROLE_OPTIONS = [
  { value: "FREE_MEMBER", label: "免费用户" },
  { value: "ONLINE_STUDENT", label: "线上课程学生" },
  { value: "ZIBENTONG_GRAD", label: "资本通毕业生" },
  { value: "QIDONG_GRAD", label: "启动资本毕业生" },
  { value: "ZIBENDAO_GRAD", label: "资本道毕业生" },
  { value: "ENTERPRISE_CLIENT", label: "企业顾问客户" },
  { value: "ADMIN", label: "管理员" },
  { value: "SUPER_ADMIN", label: "超级管理员" },
] as const;

export const GRADUATE_ROLES = [
  "ZIBENTONG_GRAD",
  "QIDONG_GRAD",
  "ZIBENDAO_GRAD",
] as const;

export const STUDENT_AREA_ROLES = [
  "ZIBENTONG_GRAD",
  "QIDONG_GRAD",
  "ZIBENDAO_GRAD",
  "ONLINE_STUDENT",
] as const;

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

export function getRoleLabel(role: string): string {
  return ROLE_LABEL[role] ?? role;
}

export function isGraduate(role: string): boolean {
  return GRADUATE_ROLES.includes(role as never);
}

export function isStudentArea(role: string): boolean {
  return STUDENT_AREA_ROLES.includes(role as never);
}

export function isAdmin(role: string): boolean {
  return ADMIN_ROLES.includes(role as never);
}
