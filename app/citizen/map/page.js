import PageHeader from "@/components/ui/PageHeader";
import InteractiveCityMap from "@/components/map/InteractiveCityMap";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { DEMO_REPORTS } from "@/lib/demo-data";

export const metadata = { title: "City Map — Citizen Portal" };

export default function CitizenMapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive City Map"
        subtitle="View all reported city issues, active repairs, traffic zones, and emergency alerts."
        actions={
          <div className="flex gap-2">
            <Link href="/citizen/report">
              <Button size="sm">+ Report Issue</Button>
            </Link>
          </div>
        }
      />

      {/* Interactive Map */}
      <InteractiveCityMap initialReports={DEMO_REPORTS} userRole="citizen" height="660px" />
    </div>
  );
}
