import BriefForm from "@/components/brief-form";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <main className="min-h-screen py-10 selection:bg-primary/20">
      <BriefForm />
      <Toaster />
    </main>
  );
}
