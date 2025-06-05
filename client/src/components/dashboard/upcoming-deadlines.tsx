import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tender } from "@shared/schema";
import { getDaysUntilDeadline, getDeadlineColor } from "@/lib/utils";

interface UpcomingDeadlinesProps {
  tenders: Tender[];
}

export default function UpcomingDeadlines({ tenders }: UpcomingDeadlinesProps) {
  const upcomingTenders = tenders
    .filter(tender => {
      const daysUntil = getDaysUntilDeadline(tender.submissionDeadline);
      return daysUntil >= 0 && daysUntil <= 30;
    })
    .sort((a, b) => 
      new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime()
    )
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingTenders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>
          ) : (
            upcomingTenders.map((tender) => {
              const daysUntil = getDaysUntilDeadline(tender.submissionDeadline);
              const colorClass = getDeadlineColor(tender.submissionDeadline);
              
              return (
                <div key={tender.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    daysUntil <= 3 ? 'bg-red-500' : 
                    daysUntil <= 7 ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{tender.title}</p>
                    <p className={`text-xs ${colorClass}`}>
                      {daysUntil === 0 ? 'Due today' : 
                       daysUntil === 1 ? 'Due tomorrow' :
                       `Due in ${daysUntil} days`}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
