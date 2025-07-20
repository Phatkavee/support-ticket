import { TicketPriority } from '@/types/ticket';
import { Project, SLALevel } from '@/types/project';

/**
 * Calculate SLA deadline based on priority and project SLA settings
 * @param priority - Ticket priority
 * @param project - Project with SLA settings
 * @param createdAt - Ticket creation date
 * @returns SLA deadline date
 */
export const calculateSlaDeadline = (
  priority: TicketPriority,
  project?: Project,
  createdAt: Date = new Date()
): Date => {
  // Default SLA hours if no project is specified
  const defaultSla: SLALevel = {
    high: 4,      // 4 hours for high priority
    medium: 8,    // 8 hours for medium priority
    low: 24       // 24 hours for low priority
  };

  const sla = project?.slaLevel || defaultSla;
  
  let hoursToAdd: number;
  
  switch (priority) {
    case 'Critical':
      hoursToAdd = sla.high / 2; // Critical gets half the time of high
      break;
    case 'High':
      hoursToAdd = sla.high;
      break;
    case 'Medium':
      hoursToAdd = sla.medium;
      break;
    case 'Low':
      hoursToAdd = sla.low;
      break;
    default:
      hoursToAdd = sla.medium;
  }

  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hoursToAdd);
  
  return deadline;
};

/**
 * Check if ticket is overdue based on SLA
 * @param slaDeadline - SLA deadline date
 * @param resolvedAt - Date when ticket was resolved (optional)
 * @returns True if ticket is overdue
 */
export const isTicketOverdue = (
  slaDeadline: Date,
  resolvedAt?: Date
): boolean => {
  const compareDate = resolvedAt || new Date();
  return compareDate > slaDeadline;
};

/**
 * Get remaining time until SLA deadline
 * @param slaDeadline - SLA deadline date
 * @returns Object with remaining time information
 */
export const getRemainingTime = (slaDeadline: Date) => {
  const now = new Date();
  const diff = slaDeadline.getTime() - now.getTime();
  
  if (diff <= 0) {
    return {
      isOverdue: true,
      hours: 0,
      minutes: 0,
      totalMinutes: 0
    };
  }
  
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return {
    isOverdue: false,
    hours,
    minutes,
    totalMinutes
  };
};

/**
 * Format remaining time as human readable string
 * @param slaDeadline - SLA deadline date
 * @returns Formatted time string
 */
export const formatRemainingTime = (slaDeadline: Date): string => {
  const remaining = getRemainingTime(slaDeadline);
  
  if (remaining.isOverdue) {
    return 'Overdue';
  }
  
  if (remaining.hours > 24) {
    const days = Math.floor(remaining.hours / 24);
    const hours = remaining.hours % 24;
    return `${days}d ${hours}h remaining`;
  }
  
  if (remaining.hours > 0) {
    return `${remaining.hours}h ${remaining.minutes}m remaining`;
  }
  
  return `${remaining.minutes}m remaining`;
};

/**
 * Get SLA status color based on remaining time
 * @param slaDeadline - SLA deadline date
 * @returns Color class for styling
 */
export const getSlaStatusColor = (slaDeadline: Date): string => {
  const remaining = getRemainingTime(slaDeadline);
  
  if (remaining.isOverdue) {
    return 'text-red-600 bg-red-50';
  }
  
  if (remaining.totalMinutes < 60) {
    return 'text-orange-600 bg-orange-50';
  }
  
  if (remaining.totalMinutes < 240) { // Less than 4 hours
    return 'text-yellow-600 bg-yellow-50';
  }
  
  return 'text-green-600 bg-green-50';
};
