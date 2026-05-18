import { auth } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import SharedNav from "@/components/SharedNav";
import ApplyForm from "./ApplyForm";

const COURSE_INFO: Record<string, {
  zh: string; en: string; stage: string;
  price: string; duration: { zh: string; en: string };
}> = {
  "capital-map": {
    zh: "资本通", en: "The Capital Map", stage: "Stage 1",
    price: "RM 2,800",
    duration: { zh: "2 天线下课程", en: "2-Day Offline Programme" },
  },
  "capital-code": {
    zh: "启动资本", en: "The Capital Code", stage: "Stage 2",
    price: "RM 7,800",
    duration: { zh: "3 天线下课程", en: "3-Day Offline Programme" },
  },
  "capital-dao": {
    zh: "资本道", en: "Capital Dao", stage: "Stage 3",
    price: "RM 38,000",
    duration: { zh: "5 天线下课程", en: "5-Day Offline Programme" },
  },
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
  const info = COURSE_INFO[course] ?? COURSE_INFO["capital-map"];

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
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}
          >
            {isEn ? info.en : info.zh}
          </h1>

          {/* Price + Duration */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold font-mono" style={{ color: "#8B6514" }}>
              {info.price}
            </span>
            <span className="text-sm" style={{ color: "#9A9490" }}>
              {isEn ? `· ${info.duration.en}` : `· ${info.duration.zh}`}
            </span>
          </div>

          <p className="text-sm" style={{ color: "#68625C" }}>
            {isEn
              ? "Fill in your details and proceed to payment to secure your seat."
              : "填写您的信息，完成付款即可锁定席位。"}
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-7"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <ApplyForm
            course={course}
            isEn={isEn}
            isLoggedIn={!!session?.user}
            userEmail={session?.user?.email ?? ""}
            callbackUrl={`/apply?course=${course}`}
          />
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
