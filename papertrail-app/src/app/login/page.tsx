import LoginForm from "./components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "PaperTrail Login",
    description: "Login to access your PaperTrail dashboard and manage your logs.",
};

export default function LoginPage() {
    return (
        <main>
            <LoginForm />
        </main>
    );
}