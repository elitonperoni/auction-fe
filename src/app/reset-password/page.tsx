"use-client";

import { ResetPasswordForm } from "@/src/app/reset-password/components/resetPassword";
import MenuLink from "@/src/components/MenuLink/menuLink";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="relative bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <MenuLink />
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
