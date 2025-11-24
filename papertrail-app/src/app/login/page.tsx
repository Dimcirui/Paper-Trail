import LoginForm from "./components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PaperTrail Login",
  description: "Login to access your PaperTrail dashboard and manage your logs.",
};

type LoginPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo =
    typeof params?.next === "string" && params.next ? params.next : "/dashboard";

  return (
    <main>
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}
