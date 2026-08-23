import { getSession } from "../../lib/auth";
import SiteHeader from "../SiteHeader";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Autentificare",
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  const session = await getSession();
  return (
    <>
      <SiteHeader session={session} />
      <LoginForm />
    </>
  );
}
