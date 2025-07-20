import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, TicketStatus, TicketPriority } from '@/types/ticket';
import { formatRemainingTime, getSlaStatusColor } from '@/lib/sla-utils';
import { formatDate } from '@/lib/date-utils';

interface TicketCardProps {
  ticket: Ticket;
}

const STATUS_COLORS: Record<TicketStatus, string> = {
  'Open': 'bg-blue-500 text-white',
  'In Progress': 'bg-yellow-500 text-white',
  'Resolved': 'bg-green-500 text-white',
  'Closed': 'bg-gray-500 text-white'
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  'Low': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800'
};

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link href={`/tickets/${ticket.id}`} className="text-blue-600 hover:underline font-semibold">
              {ticket.ticketNumber}
            </Link>
            <h3 className="text-lg font-medium text-gray-900 mt-1 line-clamp-2">
              {ticket.subject}
            </h3>
          </div>
          <div className="flex gap-2 ml-4">
            <Badge className={STATUS_COLORS[ticket.status]}>
              {ticket.status}
            </Badge>
            <Badge className={PRIORITY_COLORS[ticket.priority]}>
              {ticket.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Reporter Information */}
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">ผู้แจ้ง:</span>
            <span className="ml-2">{ticket.reporterName}</span>
            <span className="mx-2">•</span>
            <span>{ticket.reporterEmail}</span>
          </div>

          {/* Category and Created Date */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <span className="font-medium">หมวดหมู่:</span>
              <span className="ml-2">{ticket.category}</span>
            </div>
            {ticket.createdAt && (
              <span>สร้างเมื่อ: {formatDate(ticket.createdAt)}</span>
            )}
          </div>

          {/* Description Preview */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {ticket.description}
          </p>

          {/* SLA Information */}
          {ticket.slaDeadline && ticket.status !== 'Closed' && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-2">SLA:</span>
              <Badge className={getSlaStatusColor(new Date(ticket.slaDeadline))}>
                {formatRemainingTime(new Date(ticket.slaDeadline))}
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <Link href={`/tickets/${ticket.id}`}>
              <Button variant="outline" size="sm" className="flex-1">
                ดูรายละเอียด
              </Button>
            </Link>
            {ticket.status === 'Open' && (
              <Link href={`/tickets/${ticket.id}/edit`}>
                <Button variant="outline" size="sm">
                  แก้ไข
                </Button>
              </Link>
            )}
            <Link href={`/tickets/${ticket.id}/comments`}>
              <Button variant="outline" size="sm">
                ความคิดเห็น
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
