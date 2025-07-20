'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TicketFormData, TicketCategory, TicketPriority } from '@/types/ticket';
import { Project } from '@/types/project';
import { TicketService } from '@/app/api/tickets/ticket-service';

const CATEGORIES: TicketCategory[] = ['Hardware', 'Software', 'Network', 'Security', 'Database', 'Other'];
const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export default function CreateTicketForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [formData, setFormData] = useState<TicketFormData>({
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    category: 'Other',
    priority: 'Medium',
    subject: '',
    description: '',
    projectId: '',
    attachments: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load projects for dropdown (you would fetch from your project service)
    // For demo, using empty array
    setProjects([]);
  }, []);

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
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Process attachments - in a real app, you'd upload to cloud storage
      const processedAttachments: File[] = attachments;

      // Find selected project if any
      const selectedProject = formData.projectId ? 
        projects.find(p => p.id === formData.projectId) : undefined;

      const ticketData: TicketFormData = {
        ...formData,
        attachments: processedAttachments
      };

      const ticket = await TicketService.createTicket(ticketData, selectedProject);
      
      // Redirect to ticket detail page
      router.push(`/tickets/${ticket.id}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง Ticket');
    } finally {
      setLoading(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Validate file size (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = fileArray.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        alert(`ไฟล์ต่อไปนี้มีขนาดเกิน 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      // Validate file types (images, documents, etc.)
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ];
      
      const invalidFiles = fileArray.filter(file => !allowedTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        alert(`ไฟล์ต่อไปนี้ไม่รองรับ: ${invalidFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      setAttachments(prev => [...prev, ...fileArray]);
      setFormData(prev => ({ 
        ...prev, 
        attachments: [...(prev.attachments || []), ...fileArray] 
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || []
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">สร้าง Ticket ใหม่</h1>
            <p className="text-gray-600">กรอกข้อมูลเพื่อแจ้งปัญหาหรือขอความช่วยเหลือ</p>
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
                    value={formData.reporterPhone || ''}
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

              {projects.length > 0 && (
                <div>
                  <Label htmlFor="projectId">โครงการที่เกี่ยวข้อง</Label>
                  <select
                    id="projectId"
                    name="projectId"
                    value={formData.projectId || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- เลือกโครงการ --</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  placeholder="อธิบายรายละเอียดของปัญหาที่พบ เพื่อให้ทีมงานสามารถช่วยเหลือได้อย่างมีประสิทธิภาพ"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* File Attachments */}
              <div>
                <Label htmlFor="attachments">แนบไฟล์ (ไม่บังคับ)</Label>
                <div className="mt-1">
                  <input
                    id="attachments"
                    name="attachments"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    รองรับไฟล์: รูปภาพ, PDF, Word, Excel, Text (ไฟล์ละไม่เกิน 10MB)
                  </p>
                </div>
                
                {/* Display selected files */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">ไฟล์ที่เลือก:</p>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            {file.type.startsWith('image/') ? (
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="flex-shrink-0 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'กำลังสร้าง...' : 'สร้าง Ticket'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/tickets')}
                disabled={loading}
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
