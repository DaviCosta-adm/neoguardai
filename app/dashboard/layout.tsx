import MobileNav from "@/app/components/dashboard/MobileNav";
import OnboardingBanner from "@/app/components/dashboard/OnboardingBanner";
import Sidebar from "@/app/components/dashboard/Sidebar";
import { requireAuth } from "@/app/lib/auth/dal";
import { needsInstitutionOnboarding } from "@/app/lib/data/assinaturas";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAuth();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  const onOnboarding = pathname.startsWith("/dashboard/onboarding");
  const onConvites = pathname.startsWith("/dashboard/convites");

  if (
    auth.user.role === "admin_instituicao" &&
    pathname &&
    !onOnboarding &&
    !onConvites &&
    (await needsInstitutionOnboarding(auth.user.instituicaoId))
  ) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar role={auth.user.role} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          <OnboardingBanner
            role={auth.user.role}
            instituicaoId={auth.user.instituicaoId}
            pathname={pathname || undefined}
          />
          {children}
        </div>
      </div>
      <MobileNav role={auth.user.role} />
    </div>
  );
}
