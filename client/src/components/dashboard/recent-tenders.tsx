import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/utils";
import { Tender } from "@shared/schema";

interface RecentTendersProps {
  tenders: Tender[];
}

export default function RecentTenders({ tenders }: RecentTendersProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-lg font-semibold">Recent Tenders</h3>
        <Link href="/tenders">
          <a className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </a>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tenders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tenders found</p>
          ) : (
            tenders.slice(0, 3).map((tender) => (
              <div key={tender.id} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{tender.title}</h4>
                  <p className="text-sm text-muted-foreground">REF: {tender.reference}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <Badge className={`status-badge status-${tender.status}`}>
                      {getStatusLabel(tender.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Due: {formatDate(tender.submissionDeadline)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {tender.estimatedValue ? formatCurrency(tender.estimatedValue) : 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">0 submissions</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
