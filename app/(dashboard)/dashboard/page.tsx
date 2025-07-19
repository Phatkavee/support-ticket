'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, Calendar, TrendingUp, RefreshCw, Plus, FolderPlus } from 'lucide-react'
import { projectService } from '@/lib/project-service'
import type { Project } from '@/types/project'

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    recentProjects: 0,
    highPriorityProjects: 0,
  })

  // โหลดข้อมูลโครงการ
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await projectService.getAll()
        setProjects(data)
        
        // คำนวณสถิติ
        const currentDate = new Date()
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate())
        
        const recentCount = data.filter(project => 
          new Date(project.createdAt || project.signDate) >= lastMonth
        ).length

        const highPriorityCount = data.filter(project => 
          project.slaLevel.high <= 4 // น้อยกว่าหรือเท่ากับ 4 ชั่วโมง
        ).length

        setStats({
          totalProjects: data.length,
          recentProjects: recentCount,
          highPriorityProjects: highPriorityCount,
        })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* หัวเรื่อง */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            ภาพรวมของระบบจัดการโครงการ Support Ticket
          </p>
        </div>
        <Button onClick={() => router.push('/projects/create')}>
          <Plus className="w-4 h-4 mr-2" />
          สร้างโครงการใหม่
        </Button>
      </div>

      {/* สถิติ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โครงการทั้งหมด</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              โครงการที่ลงทะเบียนในระบบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โครงการใหม่ (30 วัน)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentProjects}</div>
            <p className="text-xs text-muted-foreground">
              โครงการที่สร้างใน 30 วันที่ผ่านมา
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority SLA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityProjects}</div>
            <p className="text-xs text-muted-foreground">
              โครงการที่มี SLA High ≤ 4 ชั่วโมง
            </p>
          </CardContent>
        </Card>
      </div>

      {/* โครงการล่าสุด */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>โครงการล่าสุด</CardTitle>
              <CardDescription>
                โครงการที่ได้ลงทะเบียนเมื่อเร็ว ๆ นี้
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.push('/projects')}>
              ดูทั้งหมด
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-lg font-medium mb-2">ยังไม่มีโครงการ</div>
              <div className="text-muted-foreground mb-4">
                เริ่มต้นด้วยการสร้างโครงการแรกของคุณ
              </div>
              <Button onClick={() => router.push('/projects/create')}>
                <Plus className="w-4 h-4 mr-2" />
                สร้างโครงการแรก
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div 
                  key={project.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{project.projectName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {project.projectCode}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ผู้จัดการ: {project.projectManager.name} • 
                      วันที่เซ็น: {formatDate(project.signDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      H:{project.slaLevel.high}h
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      M:{project.slaLevel.medium}h
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      L:{project.slaLevel.low}h
                    </Badge>
                  </div>
                </div>
              ))}
              {projects.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => router.push('/projects')}>
                    ดูโครงการทั้งหมด ({projects.length} โครงการ)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* การดำเนินการอื่น ๆ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>การจัดการโครงการ</CardTitle>
            <CardDescription>
              เครื่องมือสำหรับจัดการโครงการ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/projects')}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              ดูรายการโครงการทั้งหมด
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/projects/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              สร้างโครงการใหม่
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถิติ SLA</CardTitle>
            <CardDescription>
              การกระจายของระดับ SLA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                ไม่มีข้อมูล
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">High Priority (≤ 4h)</span>
                  <Badge variant="destructive">
                    {projects.filter(p => p.slaLevel.high <= 4).length} โครงการ
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Medium Priority (5-12h)</span>
                  <Badge variant="secondary">
                    {projects.filter(p => p.slaLevel.medium >= 5 && p.slaLevel.medium <= 12).length} โครงการ
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Low Priority (&gt;12h)</span>
                  <Badge variant="outline">
                    {projects.filter(p => p.slaLevel.low > 12).length} โครงการ
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
