import { 
  Ticket, 
  TicketFormData, 
  TicketFilters, 
  TicketComment, 
  TicketChangeLog,
  TicketFeedback,
  DashboardStats,
  TicketStatus 
} from '@/types/ticket';
import { Project } from '@/types/project';
import { generateTicketNumber } from '@/lib/ticket-utils';
import { calculateSlaDeadline } from '@/lib/sla-utils';
import { supabase } from '@/lib/supabase';
import { getCreatedAtTimestamp } from '@/lib/date-utils';
import {
  mapTicketFromDb,
  mapTicketToDb,
  mapAttachmentToDb,
  mapCommentFromDb,
  mapCommentToDb,
  mapChangeLogFromDb,
  mapChangeLogToDb,
  mapFeedbackFromDb,
  mapFeedbackToDb
} from '@/lib/db-mappers';

export class TicketService {

  // Check Supabase connection
  private static async isSupabaseReady(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tickets')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  // Check if storage is available
  private static async isStorageReady(): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('ticket-attachments')
        .list('', { limit: 1 });
      
      return !error;
    } catch {
      return false;
    }
  }

  // Get all tickets
  static async getAllTickets(): Promise<Ticket[]> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_attachments (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase error, falling back to localStorage:', error);
        return this.getAllTicketsFromLocalStorage();
      }

      return tickets?.map(ticket => 
        mapTicketFromDb(ticket, ticket.ticket_attachments || [])
      ) || [];
    } catch (error) {
      console.warn('Error fetching tickets from Supabase, falling back to localStorage:', error);
      return this.getAllTicketsFromLocalStorage();
    }
  }

  // Fallback method using localStorage
  private static getAllTicketsFromLocalStorage(): Promise<Ticket[]> {
    if (typeof window === 'undefined') return Promise.resolve([]);
    
    const stored = localStorage.getItem('support-tickets');
    const tickets = stored ? JSON.parse(stored) : [];
    return Promise.resolve(tickets);
  }

  // Get ticket by ID
  static async getTicketById(id: string): Promise<Ticket | null> {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_attachments (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found in Supabase, try localStorage
          const tickets = await this.getAllTicketsFromLocalStorage();
          return tickets.find(t => t.id === id) || null;
        }
        console.warn('Supabase error, falling back to localStorage:', error);
        const tickets = await this.getAllTicketsFromLocalStorage();
        return tickets.find(t => t.id === id) || null;
      }

      return ticket ? mapTicketFromDb(ticket, ticket.ticket_attachments || []) : null;
    } catch (error) {
      console.warn('Error fetching ticket by ID from Supabase, falling back to localStorage:', error);
      const tickets = await this.getAllTicketsFromLocalStorage();
      return tickets.find(t => t.id === id) || null;
    }
  }

  // Get filtered tickets
  static async getFilteredTickets(filters: TicketFilters): Promise<Ticket[]> {
    let tickets = await this.getAllTickets();

    if (filters.status && filters.status.length > 0) {
      tickets = tickets.filter(ticket => filters.status!.includes(ticket.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      tickets = tickets.filter(ticket => filters.priority!.includes(ticket.priority));
    }

    if (filters.category && filters.category.length > 0) {
      tickets = tickets.filter(ticket => filters.category!.includes(ticket.category));
    }

    if (filters.reporterName) {
      tickets = tickets.filter(ticket => 
        ticket.reporterName.toLowerCase().includes(filters.reporterName!.toLowerCase())
      );
    }

    if (filters.assignedTo) {
      tickets = tickets.filter(ticket => ticket.assignedTo === filters.assignedTo);
    }

    if (filters.projectId) {
      tickets = tickets.filter(ticket => ticket.projectId === filters.projectId);
    }

    if (filters.dateFrom) {
      tickets = tickets.filter(ticket => 
        ticket.createdAt && ticket.createdAt >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      tickets = tickets.filter(ticket => 
        ticket.createdAt && ticket.createdAt <= filters.dateTo!
      );
    }

    return tickets;
  }

  // Create new ticket
  static async createTicket(
    formData: TicketFormData, 
    project?: Project
  ): Promise<Ticket> {
    try {
      // Get existing ticket numbers for generating new number
      const { data: existingTickets } = await supabase
        .from('tickets')
        .select('ticket_number');
      
      const existingNumbers = existingTickets?.map(t => t.ticket_number) || [];
      
      const now = getCreatedAtTimestamp();
      const createdDate = new Date(now);
      
      // Create base ticket data
      const ticketData = {
        ticketNumber: generateTicketNumber(existingNumbers),
        reporterName: formData.reporterName,
        reporterEmail: formData.reporterEmail,
        reporterPhone: formData.reporterPhone,
        category: formData.category,
        priority: formData.priority,
        status: 'Open' as const,
        subject: formData.subject,
        description: formData.description,
        projectId: formData.projectId,
        slaDeadline: calculateSlaDeadline(formData.priority, project, createdDate).toISOString(),
        attachments: [] // Will be populated after file upload
      };

      // Insert ticket into database
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert(mapTicketToDb(ticketData))
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Handle file attachments if any
      const attachments = [];
      if (formData.attachments && formData.attachments.length > 0) {
        // Check if storage is available before attempting uploads
        const storageAvailable = await this.isStorageReady();
        
        if (!storageAvailable) {
          console.warn('Supabase storage is not available. Files will be skipped.');
          // Note: You might want to notify the user that files couldn't be uploaded
        } else {
          for (const file of formData.attachments) {
            try {
              // Upload file to Supabase Storage
              const fileName = `${ticket.id}/${Date.now()}-${file.name}`;
              const { error: uploadError } = await supabase.storage
                .from('ticket-attachments')
                .upload(fileName, file);

              if (uploadError) {
                console.error('Error uploading file:', {
                  fileName: file.name,
                  error: uploadError.message,
                  details: uploadError
                });
                // Continue processing other files
                continue;
              }

              // Get public URL
              const { data: urlData } = supabase.storage
                .from('ticket-attachments')
                .getPublicUrl(fileName);

              // Insert attachment record
              const { data: attachment, error: attachmentError } = await supabase
                .from('ticket_attachments')
                .insert(mapAttachmentToDb({
                  filename: file.name,
                  url: urlData.publicUrl,
                  size: file.size,
                  type: file.type
                }, ticket.id))
                .select()
                .single();

              if (attachmentError) {
                console.error('Error saving attachment record:', {
                  fileName: file.name,
                  error: attachmentError.message,
                  details: attachmentError
                });
                continue;
              }

              if (attachment) {
                attachments.push(attachment);
              }
            } catch (fileError) {
              console.error('Error processing file:', {
                fileName: file.name,
                error: fileError
              });
              // Continue processing other files
              continue;
            }
          }
        }
      }

      // Log ticket creation
      await this.addChangeLog({
        ticketId: ticket.id,
        userId: 'system',
        userName: 'System',
        action: 'created',
        description: 'Ticket created',
        createdAt: now
      });

      return mapTicketFromDb(ticket, attachments);
    } catch (error) {
      console.error('Error creating ticket:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        formData: {
          reporterName: formData.reporterName,
          reporterEmail: formData.reporterEmail,
          subject: formData.subject,
          attachmentCount: formData.attachments?.length || 0
        }
      });
      
      // If this is a database connection issue, try fallback to localStorage
      if (typeof window !== 'undefined') {
        console.warn('Database error detected, falling back to localStorage');
        return this.createTicketInLocalStorage(formData, project);
      }
      
      throw error;
    }
  }

  // Fallback method for localStorage
  private static async createTicketInLocalStorage(
    formData: TicketFormData,
    project?: Project
  ): Promise<Ticket> {
    const tickets = await this.getAllTicketsFromLocalStorage();
    const existingNumbers = tickets.map(t => t.ticketNumber);
    
    const now = getCreatedAtTimestamp();
    const createdDate = new Date(now);
    
    const newTicket: Ticket = {
      id: Date.now().toString(),
      ticketNumber: generateTicketNumber(existingNumbers),
      reporterName: formData.reporterName,
      reporterEmail: formData.reporterEmail,
      reporterPhone: formData.reporterPhone,
      category: formData.category,
      priority: formData.priority,
      status: 'Open',
      subject: formData.subject,
      description: formData.description,
      projectId: formData.projectId,
      slaDeadline: calculateSlaDeadline(formData.priority, project, createdDate).toISOString(),
      createdAt: now,
      updatedAt: now,
      attachments: [] // Note: File attachments not supported in localStorage fallback
    };

    const updatedTickets = [newTicket, ...tickets];
    localStorage.setItem('support-tickets', JSON.stringify(updatedTickets));
    
    return newTicket;
  }

  // Update ticket
  static async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    try {
      // Get original ticket for change tracking
      const { data: originalTicket, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !originalTicket) return null;

      const now = getCreatedAtTimestamp();
      
      // Update ticket in database
      const { data: updatedTicket, error: updateError } = await supabase
        .from('tickets')
        .update({
          ...mapTicketToDb(updates as Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>),
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log changes
      for (const [key, newValue] of Object.entries(updates)) {
        if (key !== 'updatedAt') {
          const dbKey = key === 'reporterName' ? 'reporter_name' : 
                       key === 'reporterEmail' ? 'reporter_email' : 
                       key === 'reporterPhone' ? 'reporter_phone' : 
                       key === 'projectId' ? 'project_id' : 
                       key === 'assignedTo' ? 'assigned_to' : 
                       key === 'slaDeadline' ? 'sla_deadline' : 
                       key === 'resolvedAt' ? 'resolved_at' : 
                       key === 'closedAt' ? 'closed_at' : key;
          
          const oldValue = originalTicket[dbKey];
          if (oldValue !== newValue) {
            await this.addChangeLog({
              ticketId: id,
              userId: 'system',
              userName: 'System',
              action: `${key}_changed`,
              oldValue: String(oldValue || ''),
              newValue: String(newValue || ''),
              description: `${key} changed from ${oldValue || 'empty'} to ${newValue || 'empty'}`,
              createdAt: now
            });
          }
        }
      }

      return mapTicketFromDb(updatedTicket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      return null;
    }
  }

  // Assign ticket to supplier
  static async assignTicket(ticketId: string, supplierId: string, assignedBy: string): Promise<boolean> {
    const updated = await this.updateTicket(ticketId, { 
      assignedTo: supplierId,
      status: 'In Progress' as TicketStatus
    });
    
    if (updated) {
      await this.addChangeLog({
        ticketId,
        userId: assignedBy,
        userName: 'System', // In real app, get user name
        action: 'assigned',
        newValue: supplierId,
        description: `Ticket assigned to supplier`,
        createdAt: getCreatedAtTimestamp()
      });
    }
    
    return !!updated;
  }

  // Update ticket status
  static async updateTicketStatus(
    ticketId: string, 
    status: TicketStatus
  ): Promise<boolean> {
    const updates: Partial<Ticket> = { status };
    
    if (status === 'Resolved') {
      updates.resolvedAt = getCreatedAtTimestamp();
    } else if (status === 'Closed') {
      updates.closedAt = getCreatedAtTimestamp();
    }
    
    const updated = await this.updateTicket(ticketId, updates);
    return !!updated;
  }

  // Get ticket comments
  static async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    try {
      const { data: comments, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return comments?.map(mapCommentFromDb) || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Add comment to ticket
  static async addComment(comment: Omit<TicketComment, 'id' | 'createdAt'>): Promise<TicketComment> {
    try {
      const { data: newComment, error } = await supabase
        .from('ticket_comments')
        .insert(mapCommentToDb(comment))
        .select()
        .single();

      if (error) throw error;

      // Log comment addition
      await this.addChangeLog({
        ticketId: comment.ticketId,
        userId: comment.userId,
        userName: comment.userName,
        action: 'comment_added',
        description: 'Comment added to ticket',
        createdAt: getCreatedAtTimestamp()
      });

      return mapCommentFromDb(newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get ticket change logs
  static async getTicketChangeLogs(ticketId: string): Promise<TicketChangeLog[]> {
    try {
      const { data: logs, error } = await supabase
        .from('ticket_change_logs')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return logs?.map(mapChangeLogFromDb) || [];
    } catch (error) {
      console.error('Error fetching change logs:', error);
      return [];
    }
  }

  // Add change log
  static async addChangeLog(log: Omit<TicketChangeLog, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('ticket_change_logs')
        .insert(mapChangeLogToDb(log));

      if (error) throw error;
    } catch (error) {
      console.error('Error adding change log:', error);
    }
  }

  // Add ticket feedback
  static async addFeedback(feedback: Omit<TicketFeedback, 'id' | 'createdAt'>): Promise<TicketFeedback> {
    try {
      const { data: newFeedback, error } = await supabase
        .from('ticket_feedback')
        .insert(mapFeedbackToDb(feedback))
        .select()
        .single();

      if (error) throw error;

      return mapFeedbackFromDb(newFeedback);
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  }

  // Get ticket feedback
  static async getTicketFeedback(ticketId: string): Promise<TicketFeedback | null> {
    try {
      const { data: feedback, error } = await supabase
        .from('ticket_feedback')
        .select('*')
        .eq('ticket_id', ticketId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return feedback ? mapFeedbackFromDb(feedback) : null;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return null;
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    const tickets = await this.getAllTickets();
    
    const stats: DashboardStats = {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status === 'Open').length,
      inProgressTickets: tickets.filter(t => t.status === 'In Progress').length,
      resolvedTickets: tickets.filter(t => t.status === 'Resolved').length,
      closedTickets: tickets.filter(t => t.status === 'Closed').length,
      criticalTickets: tickets.filter(t => t.priority === 'Critical').length,
      overdueSlaTickets: tickets.filter(t => {
        if (!t.slaDeadline || t.status === 'Closed') return false;
        const deadline = new Date(t.slaDeadline);
        const compareDate = t.resolvedAt ? new Date(t.resolvedAt) : new Date();
        return compareDate > deadline;
      }).length
    };
    
    return stats;
  }

  // Delete ticket (for admin)
  static async deleteTicket(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return false;
    }
  }
}
