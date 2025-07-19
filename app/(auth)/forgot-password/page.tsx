import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams;
  
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <ForgotPasswordForm message={params.message} />
    </div>
  );
}