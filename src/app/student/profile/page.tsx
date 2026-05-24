import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n";
import { getRoleLabel } from "@/lib/roles";
import ProfileForm from "./ProfileForm";
import StudentAccountSection from "./StudentAccountSection";

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getLocale();
  const isEn = locale === "en";
  const role = session.user.role as string;

  let memberSince = new Date();
  let profileExtra = { phone: "", company: "", position: "", city: "", bio: "" };
  let studentAccountNo: string | null = null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true, phone: true, company: true, position: true, city: true, bio: true, studentAccountNo: true },
    });
    if (user?.createdAt) memberSince = user.createdAt;
    if (user) {
      profileExtra = {
        phone:    user.phone    ?? "",
        company:  user.company  ?? "",
        position: user.position ?? "",
        city:     user.city     ?? "",
        bio:      user.bio      ?? "",
      };
      studentAccountNo = user.studentAccountNo ?? null;
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

      {/* Profile Form */}
      <ProfileForm initial={profileInitial} />

      {/* Student Account */}
      <StudentAccountSection studentAccountNo={studentAccountNo} />

    </div>
  );
}
