import { auth } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import SharedNav from "@/components/SharedNav";
import ApplyForm from "./ApplyForm";

const COURSE_NAMES: Record<string, { zh: string; en: string; stage: string }> = {
  "capital-map":  { zh: "资本通", en: "The Capital Map", stage: "Stage 1" },
  "capital-code": { zh: "启动资本", en: "The Capital Code", stage: "Stage 2" },
  "capital-dao":  { zh: "资本道", en: "Capital Dao", stage: "Stage 3" },
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course = "capital-map" } = await searchParams;
  const session = await auth();
  const locale = await getLocale();
  const isEn = locale === "en";
  const info = COURSE_NAMES[course] ?? COURSE_NAMES["capital-map"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F4EF", color: "#1C1814" }}>
      <SharedNav locale={locale} activeHref="/courses" isLoggedIn={!!session?.user} />

      <div className="max-w-xl mx-auto px-4 pt-28 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}
          >
            {isEn ? `Offline Programme · ${info.stage}` : `线下课程 · ${info.stage}`}
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}
          >
            {isEn ? info.en : info.zh}
          </h1>
          <p className="text-sm" style={{ color: "#68625C" }}>
            {isEn
              ? "Fill in the form below and our team will reach out within 1-2 business days."
              : "填写以下信息，我们的顾问团队将在 1-2 个工作日内与您联系。"}
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-7"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <ApplyForm course={course} isEn={isEn} />
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#C0B8B0" }}>
          {isEn
            ? "Your information is kept private and used only for enrolment purposes."
            : "您的信息仅用于报名联系，不会向第三方披露。"}
        </p>
      </div>
    </div>
  );
}
