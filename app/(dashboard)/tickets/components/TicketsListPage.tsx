'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Ticket, 
  TicketFilters, 
  TicketStatus, 
  TicketPriority,
  DashboardStats 
} from '@/types/ticket';
import { TicketService } from '@/app/api/tickets/ticket-service';
import { formatRemainingTime, getSlaStatusColor } from '@/lib/sla-utils';
import { formatDateForUI } from '@/lib/date-utils';

const STATUS_COLORS: Record<TicketStatus, string> = {
  'Open': 'bg-blue-500',
  'In Progress': 'bg-yellow-500',
  'Resolved': 'bg-green-500',
  'Closed': 'bg-gray-500'
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  'Low': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800'
};

export default function TicketsListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        TicketService.getAllTickets(),
        TicketService.getDashboardStats()
      ]);
      
      setTickets(ticketsData);
      setFilteredTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...tickets];

      // Apply search term
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(ticket => 
          ticket.ticketNumber.toLowerCase().includes(search) ||
          ticket.reporterName.toLowerCase().includes(search) ||
          ticket.subject.toLowerCase().includes(search) ||
          ticket.reporterEmail.toLowerCase().includes(search)
        );
      }

      // Apply other filters
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(ticket => filters.status!.includes(ticket.status));
      }

      if (filters.priority && filters.priority.length > 0) {
        filtered = filtered.filter(ticket => filters.priority!.includes(ticket.priority));
      }

      if (filters.category && filters.category.length > 0) {
        filtered = filtered.filter(ticket => filters.category!.includes(ticket.category));
      }

      setFilteredTickets(filtered);
    };

    applyFilters();
  }, [filters, searchTerm, tickets]);

  const handleStatusFilter = (status: TicketStatus) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    
    setFilters(prev => ({ ...prev, status: newStatus }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const formatDate = (dateString: string) => {
    return formatDateForUI(dateString, { includeTime: true })
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">จัดการ Tickets</h1>
          <Link href="/tickets/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              + สร้าง Ticket ใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-gray-600">ทั้งหมด</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalTickets}</div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:bg-blue-50" 
                onClick={() => handleStatusFilter('Open')}>
            <div className="text-sm text-gray-600">เปิด</div>
            <div className="text-2xl font-bold text-blue-600">{stats.openTickets}</div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:bg-yellow-50"
                onClick={() => handleStatusFilter('In Progress')}>
            <div className="text-sm text-gray-600">กำลังดำเนินการ</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgressTickets}</div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:bg-green-50"
                onClick={() => handleStatusFilter('Resolved')}>
            <div className="text-sm text-gray-600">แก้ไขแล้ว</div>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleStatusFilter('Closed')}>
            <div className="text-sm text-gray-600">ปิดแล้ว</div>
            <div className="text-2xl font-bold text-gray-600">{stats.closedTickets}</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-600">วิกฤต</div>
            <div className="text-2xl font-bold text-red-600">{stats.criticalTickets}</div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-600">เกิน SLA</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdueSlaTickets}</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="ค้นหาด้วย Ticket Number, ชื่อ, อีเมล, หัวข้อ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {(filters.status || []).map(status => (
              <Badge 
                key={status}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleStatusFilter(status)}
              >
                {status} ✕
              </Badge>
            ))}
          </div>
          
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <Button variant="outline" onClick={clearFilters}>
              ล้างตัวกรอง
            </Button>
          )}
        </div>
      </Card>

      {/* Tickets List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้แจ้ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หัวข้อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ความเร่งด่วน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สร้าง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การกระทำ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
                      {ticket.ticketNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ticket.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.reporterName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ticket.reporterEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {ticket.subject}
                      </div>
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {ticket.attachments.length}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      className={`text-white ${STATUS_COLORS[ticket.status]}`}
                    >
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={PRIORITY_COLORS[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.slaDeadline && ticket.status !== 'Closed' && (
                      <Badge className={getSlaStatusColor(new Date(ticket.slaDeadline))}>
                        {formatRemainingTime(new Date(ticket.slaDeadline))}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.createdAt && formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/tickets/${ticket.id}`}>
                      <Button variant="outline" size="sm">
                        ดูรายละเอียด
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">ไม่พบ Tickets</div>
              <div className="text-gray-400 text-sm mt-2">
                {tickets.length === 0 ? 'ยังไม่มี Tickets ในระบบ' : 'ไม่มี Tickets ที่ตรงกับเงื่อนไขการค้นหา'}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
