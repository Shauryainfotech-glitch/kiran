import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  iconBgColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = "neutral",
  iconBgColor = "bg-blue-100"
}: StatsCardProps) {
  const changeColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-muted-foreground"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center">
            <span className={`text-sm ${changeColors[changeType]}`}>
              {changeType === "positive" ? "↗" : changeType === "negative" ? "↘" : ""} {change}
            </span>
            {changeType !== "neutral" && (
              <span className="text-muted-foreground text-sm ml-2">vs last month</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
