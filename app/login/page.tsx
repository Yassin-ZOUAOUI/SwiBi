import { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login - SwiBi",
  description: "Login to your SwiBi account",
};

export default function LoginPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-md">
        <div className="flex flex-col space-y-2 mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Login to continue browsing and selling items
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 