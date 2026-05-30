import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n";
import ProfileForm from "./ProfileForm";
import StudentAccountSection from "./StudentAccountSection";

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getLocale();
  const isEn = locale === "en";
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
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
            {session.user.name}
          </h1>
          <p className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>{session.user.email}</p>

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
