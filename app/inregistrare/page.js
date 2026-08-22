import { getSession } from "../../lib/auth";
import SiteHeader from "../SiteHeader";
import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Creează cont | FixEasy",
  robots: { index: false, follow: true },
};

export default async function RegisterPage() {
  const session = await getSession();
  return (
    <>
      <SiteHeader session={session} />
      <RegisterForm />
    </>
  );
}
