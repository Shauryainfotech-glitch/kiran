import type { Tender, Vendor, Submission, Document } from "@shared/schema";

export interface TenderWithSubmissions extends Tender {
  submissionCount: number;
  submissions?: SubmissionWithVendor[];
  documents?: Document[];
}

export interface SubmissionWithVendor extends Submission {
  vendor?: Vendor;
}

export interface DashboardStats {
  active: number;
  dueThisWeek: number;
  totalValue: string;
  successRate: string;
}

export interface UpcomingDeadline {
  id: number;
  title: string;
  deadline: string;
  daysLeft: number;
  urgency: 'high' | 'medium' | 'low';
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  status: string;
  category: string;
  value?: string;
}

export type TenderStatus = 'draft' | 'published' | 'in_progress' | 'closed' | 'awarded';
export type SubmissionStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected';
