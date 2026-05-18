import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n";
import { getRoleLabel } from "@/lib/roles";
import ProfileForm from "./ProfileForm";

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getLocale();
  const isEn = locale === "en";
  const role = session.user.role as string;

  const ACHIEVEMENTS = isEn ? [
    { id: "register", icon: "", title: "Welcome", desc: "Completed registration and started your journey", unlocked: true },
    { id: "first-lesson", icon: "", title: "First Step", desc: "Completed the first lesson" },
    { id: "module-done", icon: "", title: "Finance Basics", desc: "Completed the financial fundamentals module" },
    { id: "streak-7", icon: "→", title: "Dedicated Learner", desc: "7 consecutive days of learning" },
    { id: "tools-3", icon: "", title: "Tool Expert", desc: "Used 3 different capital tools" },
  ] : [
    { id: "register", icon: "", title: "欢迎加入", desc: "完成注册，开始学习之旅", unlocked: true },
    { id: "first-lesson", icon: "", title: "第一步", desc: "完成第一关课程" },
    { id: "module-done", icon: "", title: "财务启蒙", desc: "完成财务基础模块" },
    { id: "streak-7", icon: "→", title: "学习达人", desc: "连续学习7天" },
    { id: "tools-3", icon: "", title: "工具专家", desc: "使用3种计算工具" },
  ];

  let completedCount = 0;
  let totalXP = 0;
  let memberSince = new Date();
  let profileExtra = { phone: "", company: "", position: "", city: "", bio: "" };

  try {
    const [progress, user] = await Promise.all([
      prisma.lessonProgress.findMany({
        where: { userId: session.user.id, completed: true },
        include: { lesson: { select: { points: true } } },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { createdAt: true, phone: true, company: true, position: true, city: true, bio: true },
      }),
    ]);
    completedCount = progress.length;
    totalXP = progress.reduce((sum, p) => sum + (p.lesson.points ?? 0), 0);
    if (user?.createdAt) memberSince = user.createdAt;
    if (user) {
      profileExtra = {
        phone:    user.phone    ?? "",
        company:  user.company  ?? "",
        position: user.position ?? "",
        city:     user.city     ?? "",
        bio:      user.bio      ?? "",
      };
    }
  } catch {
    // DB not seeded
  }

  const initials = (session.user.name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const joinDate = memberSince.toLocaleDateString(isEn ? "en-MY" : "zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const profileInitial = {
    name:     session.user.name ?? "",
    email:    session.user.email ?? "",
    ...profileExtra,
  };

  const stats = isEn ? [
    { label: "Lessons Done", value: completedCount, unit: "", icon: "" },
    { label: "Total XP", value: totalXP, unit: "XP", icon: "XP" },
    { label: "Tools Available", value: "22", unit: "", icon: "" },
  ] : [
    { label: "完成课程", value: completedCount, unit: "关", icon: "" },
    { label: "累计积分", value: totalXP, unit: "XP", icon: "XP" },
    { label: "可用工具", value: "22", unit: "个", icon: "" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-10 space-y-6">

      {/* Profile Card */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{
            backgroundColor: "#FBF4E4",
            border: "2px solid rgba(201,168,76,0.3)",
            color: "#C9A84C",
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
            {session.user.name}
          </h1>
          <p className="text-sm mb-3" style={{ color: "var(--color-text-secondary)" }}>{session.user.email}</p>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            <span className="text-xs font-medium" style={{ color: "#C9A84C" }}>
              {getRoleLabel(role)}
            </span>
          </div>

          {(profileExtra.position || profileExtra.company || profileExtra.city) && (
            <p className="text-xs mt-2 space-x-2" style={{ color: "var(--color-text-muted)" }}>
              {profileExtra.position && <span>{profileExtra.position}</span>}
              {profileExtra.position && profileExtra.company && <span>·</span>}
              {profileExtra.company && <span>{profileExtra.company}</span>}
              {profileExtra.city && <span>· {profileExtra.city}</span>}
            </p>
          )}

          <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
            {isEn ? `Joined ${joinDate}` : `加入于 ${joinDate}`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl text-center"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
          >
            <div className="text-base mb-1" style={{ color: "var(--color-text-muted)" }}>{s.icon}</div>
            <div className="text-xl font-bold font-mono" style={{ color: "#C9A84C" }}>
              {s.value}
              {s.unit && <span className="text-xs font-normal ml-0.5" style={{ color: "var(--color-text-muted)" }}>{s.unit}</span>}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Profile Form */}
      <ProfileForm initial={profileInitial} />

      {/* Achievements */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          {isEn ? "Achievement Badges" : "成就徽章"}
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = ach.unlocked === true || (ach.id === "first-lesson" && completedCount > 0);
            return (
              <div
                key={ach.id}
                className="flex flex-col items-center text-center p-3 rounded-xl"
                title={`${ach.title}: ${ach.desc}`}
                style={{
                  backgroundColor: unlocked ? "#FBF4E4" : "#F0EDE7",
                  border: `1px solid ${unlocked ? "rgba(201,168,76,0.3)" : "#E0D9CE"}`,
                  opacity: unlocked ? 1 : 0.5,
                  cursor: "help",
                }}
              >
                <span className="text-2xl mb-1.5">{ach.icon}</span>
                <span className="text-xs font-medium leading-snug" style={{ color: unlocked ? "#1C1814" : "#9A9490" }}>
                  {ach.title}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-center mt-3" style={{ color: "var(--color-text-muted)" }}>
          {isEn ? "Hover to view achievement details" : "悬停查看成就详情"}
        </p>
      </div>

    </div>
  );
}
