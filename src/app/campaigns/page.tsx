import CampaignsManagement from "@/components/CampaignPage";
import { Suspense } from "react";

export default function CampaignPage() {
  return (
    <Suspense>
      <CampaignsManagement />
    </Suspense>
  );
}
