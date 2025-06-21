import LoginForm from "@/components/login-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm error={params.error} />
      </div>
    </div>
  );
}
