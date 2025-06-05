import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Tender } from "@shared/schema";
import { getDaysUntilDeadline } from "@/lib/utils";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: tenders = [] } = useQuery<Tender[]>({
    queryKey: ["/api/tenders"],
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the month starts
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayTenders = tenders.filter(tender => {
      const deadlineDate = new Date(tender.submissionDeadline);
      return deadlineDate.toDateString() === date.toDateString();
    });
    
    calendarDays.push({
      day,
      date,
      tenders: dayTenders,
    });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tender Calendar</CardTitle>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium min-w-[150px] text-center">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Calendar Header */}
            {dayNames.map((day) => (
              <div key={day} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((dayData, index) => (
              <div 
                key={index} 
                className="bg-card p-2 h-24 text-sm border-0 relative min-h-[96px]"
              >
                {dayData && (
                  <>
                    <div className={`text-foreground ${
                      dayData.date.toDateString() === new Date().toDateString() 
                        ? 'font-bold text-primary' 
                        : ''
                    }`}>
                      {dayData.day}
                    </div>
                    
                    {/* Tender deadlines */}
                    <div className="absolute bottom-1 left-1 right-1 space-y-1">
                      {dayData.tenders.slice(0, 2).map((tender) => {
                        const daysUntil = getDaysUntilDeadline(tender.submissionDeadline);
                        const bgColor = daysUntil <= 3 ? 'bg-red-500' : 
                                       daysUntil <= 7 ? 'bg-orange-500' : 'bg-green-500';
                        
                        return (
                          <div 
                            key={tender.id}
                            className={`${bgColor} text-white text-xs px-1 py-0.5 rounded truncate`}
                            title={tender.title}
                          >
                            {tender.title}
                          </div>
                        );
                      })}
                      {dayData.tenders.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayData.tenders.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
