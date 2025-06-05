import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  
  // Format large amounts in Crores and Lakhs (Indian system)
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }
}

export function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    published: 'Published',
    in_progress: 'In Progress',
    closed: 'Closed',
    awarded: 'Awarded',
  };
  return statusMap[status] || status;
}

export function getDaysUntilDeadline(deadline: string | Date) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isDeadlineUrgent(deadline: string | Date, urgentThreshold = 3) {
  const daysUntil = getDaysUntilDeadline(deadline);
  return daysUntil <= urgentThreshold && daysUntil >= 0;
}

export function getDeadlineColor(deadline: string | Date) {
  const daysUntil = getDaysUntilDeadline(deadline);
  if (daysUntil < 0) return 'text-gray-500'; // Past deadline
  if (daysUntil <= 3) return 'text-red-500'; // Urgent
  if (daysUntil <= 7) return 'text-orange-500'; // Warning
  return 'text-green-500'; // Safe
}
