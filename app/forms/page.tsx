import type { Metadata } from "next";
import FormsClient from "@/components/FormsClient";

export const metadata: Metadata = {
  title: "Suggest a Restaurant",
  description:
    "Know a halal restaurant in Pune we have missed? Submit it here and we will review it for the Wurrynot listing.",
  alternates: {
    canonical: "https://wurrynot.com/forms",
  },
};

export default function FormsPage() {
  return <FormsClient />;
}
