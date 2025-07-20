import { Ticket, TicketComment, TicketChangeLog, TicketFeedback, Attachment, TicketCategory, TicketPriority, TicketStatus } from '@/types/ticket'
import { Database } from './supabase'

type TicketRow = Database['public']['Tables']['tickets']['Row']
type TicketAttachmentRow = Database['public']['Tables']['ticket_attachments']['Row']
type TicketCommentRow = Database['public']['Tables']['ticket_comments']['Row']
type TicketChangeLogRow = Database['public']['Tables']['ticket_change_logs']['Row']
type TicketFeedbackRow = Database['public']['Tables']['ticket_feedback']['Row']

// Map database ticket to app ticket
export function mapTicketFromDb(
  ticketRow: TicketRow, 
  attachments: TicketAttachmentRow[] = []
): Ticket {
  return {
    id: ticketRow.id,
    ticketNumber: ticketRow.ticket_number,
    reporterName: ticketRow.reporter_name,
    reporterEmail: ticketRow.reporter_email,
    reporterPhone: ticketRow.reporter_phone || undefined,
    category: ticketRow.category as TicketCategory,
    priority: ticketRow.priority as TicketPriority,
    status: ticketRow.status as TicketStatus,
    subject: ticketRow.subject,
    description: ticketRow.description,
    projectId: ticketRow.project_id || undefined,
    assignedTo: ticketRow.assigned_to || undefined,
    slaDeadline: ticketRow.sla_deadline,
    resolvedAt: ticketRow.resolved_at || undefined,
    closedAt: ticketRow.closed_at || undefined,
    createdAt: ticketRow.created_at,
    updatedAt: ticketRow.updated_at,
    attachments: attachments.map(mapAttachmentFromDb)
  }
}

// Map app ticket to database insert
export function mapTicketToDb(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Database['public']['Tables']['tickets']['Insert'] {
  return {
    ticket_number: ticket.ticketNumber,
    reporter_name: ticket.reporterName,
    reporter_email: ticket.reporterEmail,
    reporter_phone: ticket.reporterPhone || null,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    subject: ticket.subject,
    description: ticket.description,
    project_id: ticket.projectId || null,
    assigned_to: ticket.assignedTo || null,
    sla_deadline: ticket.slaDeadline!,
    resolved_at: ticket.resolvedAt || null,
    closed_at: ticket.closedAt || null
  }
}

// Map database attachment to app attachment
export function mapAttachmentFromDb(attachmentRow: TicketAttachmentRow): Attachment {
  return {
    id: attachmentRow.id,
    filename: attachmentRow.filename,
    url: attachmentRow.url,
    size: attachmentRow.size,
    type: attachmentRow.type
  }
}

// Map app attachment to database insert
export function mapAttachmentToDb(attachment: Omit<Attachment, 'id'>, ticketId: string): Database['public']['Tables']['ticket_attachments']['Insert'] {
  return {
    ticket_id: ticketId,
    filename: attachment.filename,
    url: attachment.url,
    size: attachment.size,
    type: attachment.type
  }
}

// Map database comment to app comment
export function mapCommentFromDb(commentRow: TicketCommentRow): TicketComment {
  return {
    id: commentRow.id,
    ticketId: commentRow.ticket_id,
    userId: commentRow.user_id,
    userName: commentRow.user_name,
    content: commentRow.content,
    isInternal: commentRow.is_internal,
    createdAt: commentRow.created_at,
    updatedAt: commentRow.updated_at
  }
}

// Map app comment to database insert
export function mapCommentToDb(comment: Omit<TicketComment, 'id' | 'createdAt' | 'updatedAt'>): Database['public']['Tables']['ticket_comments']['Insert'] {
  return {
    ticket_id: comment.ticketId,
    user_id: comment.userId,
    user_name: comment.userName,
    content: comment.content,
    is_internal: comment.isInternal || false
  }
}

// Map database change log to app change log
export function mapChangeLogFromDb(changeLogRow: TicketChangeLogRow): TicketChangeLog {
  return {
    id: changeLogRow.id,
    ticketId: changeLogRow.ticket_id,
    userId: changeLogRow.user_id,
    userName: changeLogRow.user_name,
    action: changeLogRow.action,
    oldValue: changeLogRow.old_value || undefined,
    newValue: changeLogRow.new_value || undefined,
    description: changeLogRow.description,
    createdAt: changeLogRow.created_at
  }
}

// Map app change log to database insert
export function mapChangeLogToDb(changeLog: Omit<TicketChangeLog, 'id'>): Database['public']['Tables']['ticket_change_logs']['Insert'] {
  return {
    ticket_id: changeLog.ticketId,
    user_id: changeLog.userId,
    user_name: changeLog.userName,
    action: changeLog.action,
    old_value: changeLog.oldValue || null,
    new_value: changeLog.newValue || null,
    description: changeLog.description
  }
}

// Map database feedback to app feedback
export function mapFeedbackFromDb(feedbackRow: TicketFeedbackRow): TicketFeedback {
  return {
    id: feedbackRow.id,
    ticketId: feedbackRow.ticket_id,
    rating: feedbackRow.rating,
    comment: feedbackRow.comment || undefined,
    createdAt: feedbackRow.created_at
  }
}

// Map app feedback to database insert
export function mapFeedbackToDb(feedback: Omit<TicketFeedback, 'id' | 'createdAt'>): Database['public']['Tables']['ticket_feedback']['Insert'] {
  return {
    ticket_id: feedback.ticketId,
    rating: feedback.rating,
    comment: feedback.comment || null
  }
}
