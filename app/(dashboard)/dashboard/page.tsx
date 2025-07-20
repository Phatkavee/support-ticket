'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, TrendingUp, RefreshCw, Plus, FolderPlus, Ticket, AlertTriangle } from 'lucide-react'
import { projectService } from '@/app/api/projects/project-service'
import { TicketService } from '@/app/api/tickets/ticket-service'
import type { Project } from '@/types/project'
import type { DashboardStats, Ticket as TicketType } from '@/types/ticket'
import { formatRemainingTime, getSlaStatusColor } from '@/lib/sla-utils'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [ticketStats, setTicketStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    recentProjects: 0,
    highPriorityProjects: 0,
  })

  // โหลดข้อมูลโครงการและ tickets
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [projectData, ticketData, ticketStatsData] = await Promise.all([
          projectService.getAll(),
          TicketService.getAllTickets(),
          TicketService.getDashboardStats()
        ])
        
        setProjects(projectData)
        setTickets(ticketData)
        setTicketStats(ticketStatsData)
        
        // คำนวณสถิติโครงการ
        const currentDate = new Date()
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate())
        
        const recentCount = projectData.filter(project => 
          new Date(project.createdAt || project.signDate) >= lastMonth
        ).length

        const highPriorityCount = projectData.filter(project => 
          project.slaLevel.high <= 4 // น้อยกว่าหรือเท่ากับ 4 ชั่วโมง
        ).length

        setStats({
          totalProjects: projectData.length,
          recentProjects: recentCount,
          highPriorityProjects: highPriorityCount,
        })
        
        // Log for debugging
        console.log('Loaded data:', { projects: projectData.length, tickets: ticketData.length })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // รีเฟรชข้อมูล
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH')
  }

  // Get recent tickets (last 5)
  const recentTickets = tickets
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5)

  // Get urgent tickets (high priority and critical)
  const urgentTickets = tickets.filter(ticket => 
    (ticket.priority === 'High' || ticket.priority === 'Critical') && 
    (ticket.status === 'Open' || ticket.status === 'In Progress')
  ).slice(0, 5)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
        
        {/* Stats Grid Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>

        {/* Charts Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-80 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-gray-600 mt-2">ภาพรวมระบบจัดการ Projects และ Support Tickets</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Project Stats */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โครงการทั้งหมด</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentProjects} ในเดือนที่ผ่านมา
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA สูง</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityProjects}</div>
            <p className="text-xs text-muted-foreground">
              โครงการที่มี SLA เร่งด่วน
            </p>
          </CardContent>
        </Card>

        {/* Ticket Stats */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets ทั้งหมด</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats?.totalTickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              เปิด: {ticketStats?.openTickets || 0} | ดำเนินการ: {ticketStats?.inProgressTickets || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เกิน SLA</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{ticketStats?.overdueSlaTickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              วิกฤต: {ticketStats?.criticalTickets || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tickets ล่าสุด</CardTitle>
              <Link href="/tickets">
                <Button variant="outline" size="sm">ดูทั้งหมด</Button>
              </Link>
            </div>
            <CardDescription>
              Tickets ที่สร้างล่าสุด 5 รายการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <Link href={`/tickets/${ticket.id}`} className="font-medium text-blue-600 hover:underline">
                      {ticket.ticketNumber}
                    </Link>
                    <p className="text-sm text-gray-600 truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-500">{ticket.reporterName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={ticket.priority === 'Critical' ? 'destructive' : 'outline'}>
                      {ticket.priority}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {ticket.createdAt && formatDate(ticket.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentTickets.length === 0 && (
                <p className="text-gray-500 text-center py-8">ยังไม่มี Tickets</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tickets เร่งด่วน</CardTitle>
              <Link href="/tickets?priority=High,Critical">
                <Button variant="outline" size="sm">ดูทั้งหมด</Button>
              </Link>
            </div>
            <CardDescription>
              Tickets ที่มีความเร่งด่วนสูงและวิกฤต
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentTickets.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-red-50 rounded border-l-4 border-red-500">
                  <div className="flex-1">
                    <Link href={`/tickets/${ticket.id}`} className="font-medium text-blue-600 hover:underline">
                      {ticket.ticketNumber}
                    </Link>
                    <p className="text-sm text-gray-600 truncate">{ticket.subject}</p>
                    {ticket.slaDeadline && ticket.status !== 'Closed' && (
                      <Badge className={`text-xs ${getSlaStatusColor(new Date(ticket.slaDeadline))}`}>
                        {formatRemainingTime(new Date(ticket.slaDeadline))}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {ticket.priority}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{ticket.status}</p>
                  </div>
                </div>
              ))}
              
              {urgentTickets.length === 0 && (
                <p className="text-gray-500 text-center py-8">ไม่มี Tickets เร่งด่วน</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/tickets/create">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-dashed border-2 border-gray-300 hover:border-blue-400">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Plus className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">สร้าง Ticket ใหม่</h3>
              <p className="text-sm text-gray-600">แจ้งปัญหาหรือขอความช่วยเหลือ</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/projects/create">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-dashed border-2 border-gray-300 hover:border-green-400">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <FolderPlus className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">สร้างโครงการใหม่</h3>
              <p className="text-sm text-gray-600">เพิ่มโครงการและกำหนด SLA</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tickets">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-dashed border-2 border-gray-300 hover:border-purple-400">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Ticket className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">จัดการ Tickets</h3>
              <p className="text-sm text-gray-600">ดูและจัดการ Tickets ทั้งหมด</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/projects">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-dashed border-2 border-gray-300 hover:border-orange-400">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <FolderOpen className="w-8 h-8 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900">จัดการโครงการ</h3>
              <p className="text-sm text-gray-600">ดูและแก้ไขโครงการ</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
