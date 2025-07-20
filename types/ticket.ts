export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Security' | 'Database' | 'Other';

export type Attachment = {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
};

export type TicketComment = {
  id?: string;
  ticketId: string;
  userId: string;
  userName: string;
  content: string; // Changed from comment to content for consistency
  isInternal?: boolean;
  attachments?: Attachment[];
  createdAt?: string;
  updatedAt?: string;
};

export type TicketFeedback = {
  id?: string;
  ticketId: string;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt?: string;
};

export type TicketAssignment = {
  id?: string;
  ticketId: string;
  assignedTo: string; // Supplier ID
  assignedBy: string; // User ID who assigned
  assignedDate?: string;
};

export type TicketChangeLog = {
  id?: string;
  ticketId: string;
  userId: string;
  userName: string;
  action: string; // 'created', 'status_changed', 'assigned', 'comment_added', etc.
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt?: string;
};

export type Ticket = {
  id?: string;
  ticketNumber: string; // Format: RHD-20250703-0001
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  projectId?: string; // Link to project for SLA
  assignedTo?: string; // Supplier ID
  attachments?: Attachment[];
  slaDeadline?: string; // Calculated based on priority and project SLA
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
};

export type TicketFormData = {
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  projectId?: string;
  attachments?: File[];
};

export type TicketFilters = {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  category?: TicketCategory[];
  reporterName?: string;
  assignedTo?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type DashboardStats = {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  criticalTickets: number;
  overdueSlaTickets: number;
};
