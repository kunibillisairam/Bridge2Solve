import { redirect } from "next/navigation";

export default function UniversityRootRedirect() {
  redirect("/university/dashboard");
}
