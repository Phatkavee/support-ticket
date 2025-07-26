'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Ticket, 
  TicketStatus, 
  TicketComment, 
  TicketChangeLog, 
  TicketFeedback 
} from '@/types/ticket';
import { TicketService } from '@/app/api/tickets/ticket-service';
import { formatRemainingTime, getSlaStatusColor } from '@/lib/sla-utils';
import { formatDateForUI } from '@/lib/date-utils';

const STATUS_OPTIONS: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

const STATUS_COLORS: Record<TicketStatus, string> = {
  'Open': 'bg-blue-500 text-white',
  'In Progress': 'bg-yellow-500 text-white',
  'Resolved': 'bg-green-500 text-white',
  'Closed': 'bg-gray-500 text-white'
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [changeLogs, setChangeLogs] = useState<TicketChangeLog[]>([]);
  const [feedback, setFeedback] = useState<TicketFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  // Feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const loadTicketData = async () => {
    if (!ticketId) return;

    setLoading(true);
    try {
      const [ticketData, commentsData, changeLogsData, feedbackData] = await Promise.all([
        TicketService.getTicketById(ticketId),
        TicketService.getTicketComments(ticketId),
        TicketService.getTicketChangeLogs(ticketId),
        TicketService.getTicketFeedback(ticketId)
      ]);

      if (!ticketData) {
        router.push('/tickets');
        return;
      }

      setTicket(ticketData);
      setComments(commentsData);
      setChangeLogs(changeLogsData);
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error loading ticket data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTicketData = async () => {
      if (!ticketId) return;

      setLoading(true);
      try {
        const [ticketData, commentsData, changeLogsData, feedbackData] = await Promise.all([
          TicketService.getTicketById(ticketId),
          TicketService.getTicketComments(ticketId),
          TicketService.getTicketChangeLogs(ticketId),
          TicketService.getTicketFeedback(ticketId)
        ]);

        if (!ticketData) {
          router.push('/tickets');
          return;
        }

        setTicket(ticketData);
        setComments(commentsData);
        setChangeLogs(changeLogsData);
        setFeedback(feedbackData);
      } catch (error) {
        console.error('Error loading ticket data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTicketData();
  }, [ticketId, router]);

  const updateTicketStatus = async (newStatus: TicketStatus) => {
    if (!ticket) return;

    setUpdating(true);
    try {
      await TicketService.updateTicketStatus(ticket.id!, newStatus);
      
      // Reload ticket data
      await loadTicketData();
      
      // Show feedback form when ticket is resolved/closed
      if ((newStatus === 'Resolved' || newStatus === 'Closed') && !feedback) {
        setShowFeedbackForm(true);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setUpdating(false);
    }
  };

  const addComment = async () => {
    if (!ticket || !newComment.trim()) return;

    setAddingComment(true);
    try {
      await TicketService.addComment({
        ticketId: ticket.id!,
        userId: 'current-user-id', // In real app, get from auth
        userName: 'Current User', // In real app, get from auth
        content: newComment,
        isInternal: false
      });

      setNewComment('');
      await loadTicketData(); // Reload to show new comment
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น');
    } finally {
      setAddingComment(false);
    }
  };

  const submitFeedback = async () => {
    if (!ticket) return;

    try {
      await TicketService.addFeedback({
        ticketId: ticket.id!,
        rating: feedbackRating,
        comment: feedbackComment
      });

      setShowFeedbackForm(false);
      await loadTicketData(); // Reload to show feedback
      alert('ขอบคุณสำหรับการให้คะแนน!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('เกิดข้อผิดพลาดในการส่งคำติชม');
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateForUI(dateString, { includeTime: true })
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/tickets')}
          className="mb-4"
        >
          ← กลับไปหน้ารายการ
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {ticket.ticketNumber}
            </h1>
            <p className="text-xl text-gray-600">{ticket.subject}</p>
          </div>
          
          <div className="flex gap-2">
            <Badge className={STATUS_COLORS[ticket.status]}>
              {ticket.status}
            </Badge>
            <Badge variant="outline">
              {ticket.priority}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">รายละเอียด Ticket</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">ผู้แจ้งปัญหา</Label>
                <p className="text-gray-900">{ticket.reporterName}</p>
                <p className="text-gray-600 text-sm">{ticket.reporterEmail}</p>
                {ticket.reporterPhone && (
                  <p className="text-gray-600 text-sm">{ticket.reporterPhone}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">หมวดหมู่</Label>
                <p className="text-gray-900">{ticket.category}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">ความเร่งด่วน</Label>
                <p className="text-gray-900">{ticket.priority}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">วันที่สร้าง</Label>
                <p className="text-gray-900">
                  {ticket.createdAt && formatDate(ticket.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <Label className="text-sm font-medium text-gray-500">รายละเอียดปัญหา</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>
            
            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-500">ไฟล์แนบ</Label>
                <div className="mt-2 space-y-2">
                  {ticket.attachments.map((attachment, index) => (
                    <div key={attachment.id || index} className="bg-gray-50 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                            title={attachment.filename}
                          >
                            {attachment.filename}
                          </a>
                          <p className="text-xs text-gray-500 mt-1">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB • {attachment.type}
                          </p>
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                        >
                          
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {ticket.slaDeadline && ticket.status !== 'Closed' && (
              <div>
                <Label className="text-sm font-medium text-gray-500">SLA Status</Label>
                <div className="mt-2">
                  <Badge className={getSlaStatusColor(new Date(ticket.slaDeadline))}>
                    {formatRemainingTime(new Date(ticket.slaDeadline))}
                  </Badge>
                </div>
              </div>
            )}
          </Card>

          {/* Comments Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ความคิดเห็น</h3>
            
            {/* Add Comment Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <Label htmlFor="newComment" className="text-sm font-medium text-gray-700">
                เพิ่มความคิดเห็น
              </Label>
              <textarea
                id="newComment"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="พิมพ์ความคิดเห็นหรือการอัปเดต..."
              />
              <div className="mt-2 flex justify-end">
                <Button 
                  onClick={addComment}
                  disabled={!newComment.trim() || addingComment}
                  size="sm"
                >
                  {addingComment ? 'กำลังเพิ่ม...' : 'เพิ่มความคิดเห็น'}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{comment.userName}</p>
                      {comment.isInternal && (
                        <Badge variant="secondary" className="text-xs mt-1">ภายใน</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {comment.createdAt && formatDate(comment.createdAt)}
                    </p>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">ยังไม่มีความคิดเห็น</p>
              )}
            </div>
          </Card>

          {/* Feedback Section */}
          {ticket.status === 'Closed' && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">คะแนนความพึงพอใจ</h3>
              
              {feedback ? (
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-600 mr-2">คะแนน:</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">{feedback.rating}/5</span>
                  </div>
                  {feedback.comment && (
                    <p className="text-gray-700 mt-2">{feedback.comment}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    วันที่ให้คะแนน: {feedback.createdAt && formatDate(feedback.createdAt)}
                  </p>
                </div>
              ) : showFeedbackForm ? (
                <div className="space-y-4">
                  <div>
                    <Label>ให้คะแนนความพึงพอใจ (1-5 ดาว)</Label>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className={`text-2xl ${
                            star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'
                          } hover:text-yellow-400`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({feedbackRating}/5)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="feedbackComment">ความคิดเห็นเพิ่มเติม (ไม่จำเป็น)</Label>
                    <textarea
                      id="feedbackComment"
                      rows={3}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="แสดงความคิดเห็นเกี่ยวกับการให้บริการ..."
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={submitFeedback}>
                      ส่งคะแนน
                    </Button>
                    <Button variant="outline" onClick={() => setShowFeedbackForm(false)}>
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowFeedbackForm(true)} variant="outline">
                  ให้คะแนนความพึงพอใจ
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">จัดการสถานะ</h3>
            
            <div className="space-y-2">
              {STATUS_OPTIONS.map((status) => (
                <Button
                  key={status}
                  variant={ticket.status === status ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => updateTicketStatus(status)}
                  disabled={updating || ticket.status === status}
                >
                  {status}
                </Button>
              ))}
            </div>
          </Card>

          {/* Change Log */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ประวัติการเปลี่ยนแปลง</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {changeLogs.map((log) => (
                <div key={log.id} className="text-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-900">{log.description}</p>
                    <p className="text-gray-500 text-xs">
                      {log.createdAt && formatDate(log.createdAt)}
                    </p>
                  </div>
                  <p className="text-gray-600">{log.userName}</p>
                </div>
              ))}
              
              {changeLogs.length === 0 && (
                <p className="text-gray-500 text-center py-4">ไม่มีประวัติการเปลี่ยนแปลง</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
