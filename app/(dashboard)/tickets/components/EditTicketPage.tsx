'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ticket, TicketCategory, TicketPriority } from '@/types/ticket';
import { TicketService } from '@/app/api/tickets/ticket-service';

const CATEGORIES: TicketCategory[] = ['Hardware', 'Software', 'Network', 'Security', 'Database', 'Other'];
const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export default function EditTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    category: 'Other' as TicketCategory,
    priority: 'Medium' as TicketPriority,
    subject: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadTicket = async () => {
      if (!ticketId) return;

      try {
        const ticketData = await TicketService.getTicketById(ticketId);
        if (!ticketData) {
          router.push('/tickets');
          return;
        }

        setTicket(ticketData);
        setFormData({
          reporterName: ticketData.reporterName,
          reporterEmail: ticketData.reporterEmail,
          reporterPhone: ticketData.reporterPhone || '',
          category: ticketData.category,
          priority: ticketData.priority,
          subject: ticketData.subject,
          description: ticketData.description
        });
      } catch (error) {
        console.error('Error loading ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reporterName.trim()) {
      newErrors.reporterName = 'ชื่อผู้แจ้งปัญหาจำเป็นต้องกรอก';
    }

    if (!formData.reporterEmail.trim()) {
      newErrors.reporterEmail = 'อีเมลจำเป็นต้องกรอก';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reporterEmail)) {
      newErrors.reporterEmail = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'หัวข้อปัญหาจำเป็นต้องกรอก';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'รายละเอียดปัญหาจำเป็นต้องกรอก';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !ticket) {
      return;
    }

    setSaving(true);
    try {
      await TicketService.updateTicket(ticket.id!, {
        reporterName: formData.reporterName,
        reporterEmail: formData.reporterEmail,
        reporterPhone: formData.reporterPhone || undefined,
        category: formData.category,
        priority: formData.priority,
        subject: formData.subject,
        description: formData.description
      });
      
      // Redirect back to ticket detail
      router.push(`/tickets/${ticket.id}`);
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไข Ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบ Ticket</h1>
          <Button onClick={() => router.push('/tickets')}>
            กลับไปหน้ารายการ Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/tickets/${ticket.id}`)}
          className="mb-4"
        >
          ← กลับไปหน้ารายละเอียด
        </Button>

        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              แก้ไข Ticket: {ticket.ticketNumber}
            </h1>
            <p className="text-gray-600">แก้ไขข้อมูล Ticket</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reporter Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">ข้อมูลผู้แจ้ง</h3>
              
              <div>
                <Label htmlFor="reporterName">ชื่อผู้แจ้งปัญหา *</Label>
                <Input
                  id="reporterName"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleInputChange}
                  className={errors.reporterName ? 'border-red-500' : ''}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
                {errors.reporterName && (
                  <p className="text-red-500 text-sm mt-1">{errors.reporterName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterEmail">อีเมล *</Label>
                  <Input
                    id="reporterEmail"
                    name="reporterEmail"
                    type="email"
                    value={formData.reporterEmail}
                    onChange={handleInputChange}
                    className={errors.reporterEmail ? 'border-red-500' : ''}
                    placeholder="example@email.com"
                  />
                  {errors.reporterEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.reporterEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reporterPhone">เบอร์โทร</Label>
                  <Input
                    id="reporterPhone"
                    name="reporterPhone"
                    value={formData.reporterPhone}
                    onChange={handleInputChange}
                    placeholder="0xx-xxx-xxxx"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">รายละเอียด Ticket</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">หมวดหมู่ *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority">ระดับความเร่งด่วน *</Label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">หัวข้อปัญหา *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={errors.subject ? 'border-red-500' : ''}
                  placeholder="สรุปปัญหาโดยย่อ"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">รายละเอียดของปัญหา *</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="อธิบายรายละเอียดของปัญหาที่พบ"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push(`/tickets/${ticket.id}`)}
                disabled={saving}
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
