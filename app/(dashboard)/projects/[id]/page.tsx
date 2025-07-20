'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Calendar, Phone, Mail, User, Building, RefreshCw } from 'lucide-react'
import { projectService } from '@/app/api/projects/project-service'
import type { Project } from '@/types/project'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = params.id as string

  // โหลดข้อมูลโครงการ
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await projectService.getById(projectId)
        if (!data) {
          setError('ไม่พบโครงการที่ต้องการดู')
          return
        }
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
        console.error('Failed to load project:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const handleEdit = () => {
    router.push(`/projects/${projectId}/edit`)
  }

  const handleDelete = async () => {
    if (!project || !confirm(`คุณต้องการลบโครงการ "${project.projectName}" ใช่หรือไม่?`)) {
      return
    }

    try {
      await projectService.delete(projectId)
      alert('ลบโครงการเรียบร้อยแล้ว')
      router.push('/projects')
    } catch (err) {
      console.error('Failed to delete project:', err)
      alert('เกิดข้อผิดพลาดในการลบโครงการ')
    }
  }

  const handleBack = () => {
    router.push('/projects')
  }

  const formatDate = (dateString: string) => {
    // ป้องกัน hydration mismatch โดยใช้ client-side rendering สำหรับ date
    if (typeof window === 'undefined') {
      // Server-side: return simple format
      return new Date(dateString).toISOString().split('T')[0]
    }
    // Client-side: return localized format
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // กำลังโหลดข้อมูล
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>กำลังโหลดข้อมูลโครงการ...</span>
        </div>
      </div>
    )
  }

  // เกิดข้อผิดพลาด
  if (error || !project) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg">
            {error || 'ไม่พบโครงการที่ต้องการดู'}
          </div>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้ารายการโครงการ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {project.projectName}
              <Badge variant="outline">{project.projectCode}</Badge>
            </h1>
            <p className="text-muted-foreground">รายละเอียดโครงการ</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            แก้ไข
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            ลบ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ข้อมูลพื้นฐาน */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลโครงการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">เลขที่สัญญา</div>
              <div className="text-base">{project.projectCode}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">ชื่อโครงการ</div>
              <div className="text-base">{project.projectName}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="w-4 h-4" />
                เบอร์ติดต่อ
              </div>
              <div className="text-base">{project.contactNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                วันที่เซ็นสัญญา
              </div>
              <div className="text-base">{formatDate(project.signDate)}</div>
            </div>
          </CardContent>
        </Card>

        {/* ผู้จัดการโครงการ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              ผู้จัดการโครงการ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">ชื่อ</div>
              <div className="text-base">{project.projectManager.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="w-4 h-4" />
                อีเมล
              </div>
              <div className="text-base">{project.projectManager.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="w-4 h-4" />
                เบอร์โทรศัพท์
              </div>
              <div className="text-base">{project.projectManager.telephone}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ระดับ SLA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ระดับ SLA (เวลาการแก้ไข)</CardTitle>
          <CardDescription>
            ระยะเวลาในการแก้ไขปัญหา (หน่วย: ชั่วโมง)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 border rounded-lg">
              <Badge variant="destructive" className="mb-3">
                High Priority
              </Badge>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {project.slaLevel.high}
              </div>
              <div className="text-sm text-muted-foreground">ชั่วโมง</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <Badge variant="secondary" className="mb-3">
                Medium Priority
              </Badge>
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {project.slaLevel.medium}
              </div>
              <div className="text-sm text-muted-foreground">ชั่วโมง</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <Badge variant="outline" className="mb-3">
                Low Priority
              </Badge>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {project.slaLevel.low}
              </div>
              <div className="text-sm text-muted-foreground">ชั่วโมง</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* บริษัทผู้ดูแลโครงการ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="w-5 h-5" />
            บริษัทผู้ดูแลโครงการ ({project.suppliers.length} ราย)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.suppliers.map((supplier, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Supplier {index + 1}</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">ชื่อบริษัท</div>
                    <div className="text-base">{supplier.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      อีเมล
                    </div>
                    <div className="text-base">{supplier.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      เบอร์โทรศัพท์
                    </div>
                    <div className="text-base">{supplier.telephone}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ข้อมูลระบบ */}
      {(project.createdAt || project.updatedAt) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลระบบ</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {project.createdAt && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">วันที่สร้าง</div>
                <div className="text-base">{formatDate(project.createdAt)}</div>
              </div>
            )}
            {project.updatedAt && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">วันที่แก้ไขล่าสุด</div>
                <div className="text-base">{formatDate(project.updatedAt)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
