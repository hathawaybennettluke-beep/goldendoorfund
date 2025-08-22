import { ArrowRight, Heart, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  category: string;
  urgency?: "high" | "medium" | "low";
}

interface CampaignShowcaseProps {
  heading?: string;
  description?: string;
  campaigns?: Campaign[];
  viewAllUrl?: string;
}

const defaultCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Emergency Water Wells for Rural Communities",
    description:
      "Providing clean, safe drinking water to remote villages in East Africa. Each well serves 500+ people.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 45000,
    goal: 75000,
    donors: 234,
    category: "Water & Sanitation",
    urgency: "high",
  },
  {
    id: "2",
    title: "School Supplies for Underprivileged Children",
    description:
      "Ensuring every child has access to basic educational materials and books for the upcoming school year.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 28000,
    goal: 40000,
    donors: 156,
    category: "Education",
    urgency: "medium",
  },
  {
    id: "3",
    title: "Mobile Medical Clinic for Remote Areas",
    description:
      "Bringing essential healthcare services to communities without access to medical facilities.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 62000,
    goal: 100000,
    donors: 389,
    category: "Healthcare",
    urgency: "high",
  },
];

const CampaignShowcase = ({
  heading = "Active Campaigns Making a Difference",
  description = "Support causes that matter to you. Every donation brings us closer to our goals and creates lasting impact in communities worldwide.",
  campaigns = defaultCampaigns,
  viewAllUrl = "/campaigns",
}: CampaignShowcaseProps) => {
  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  return (
    <section className="py-24">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg"
            >
              <div className="relative">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                />
                {campaign.urgency && (
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getUrgencyColor(campaign.urgency)}`}
                    >
                      {campaign.urgency === "high"
                        ? "Urgent"
                        : campaign.urgency === "medium"
                          ? "Active"
                          : "Ongoing"}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {campaign.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold line-clamp-2">
                  {campaign.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                  {campaign.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">
                      {formatCurrency(campaign.raised)} raised
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(campaign.goal)} goal
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${getProgressPercentage(campaign.raised, campaign.goal)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {campaign.donors} donors
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {Math.round(
                        getProgressPercentage(campaign.raised, campaign.goal)
                      )}
                      % funded
                    </span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  Donate Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <a href={viewAllUrl}>
              View All Campaigns
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export { CampaignShowcase };
