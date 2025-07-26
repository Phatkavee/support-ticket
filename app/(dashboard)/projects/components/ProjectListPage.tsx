'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/types/project'
import { formatDateForUI } from '@/lib/date-utils'

interface ProjectListPageProps {
  projects: Project[]
  onEdit: (id: string) => void
  onDelete: (id: string) => Promise<void>
  onRefresh: () => Promise<void>
  isLoading?: boolean
}

export function ProjectListPage({ 
  projects, 
  onEdit, 
  onDelete, 
  isLoading = false 
}: ProjectListPageProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">โครงการทั้งหมด</h1>
            <p className="text-muted-foreground">จัดการข้อมูลโครงการและผู้ดูแลโครงการ</p>
          </div>
          <div className="h-9 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectManager.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetail = (project: Project) => {
    router.push(`/projects/${project.id}`)
  }

  const formatDate = (dateString: string) => {
    if (!mounted) return '...' // แสดง placeholder แทน empty string
    try {
      // ใช้ formatDateForUI เพื่อความสอดคล้องและป้องกัน hydration mismatch
      return formatDateForUI(dateString)
    } catch {
      return dateString // fallback to original string if parsing fails
    }
  }

  const getSLABadgeColor = (hours: number) => {
    if (hours <= 4) return 'destructive'
    if (hours <= 8) return 'default'
    return 'secondary'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">โครงการทั้งหมด</h1>
          <p className="text-muted-foreground">จัดการข้อมูลโครงการและผู้ดูแลโครงการ</p>
        </div>
        <Button onClick={() => router.push('/projects/create')} suppressHydrationWarning>
          <Plus className="w-4 h-4 mr-2" />
          สร้างโครงการใหม่
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="ค้นหาโครงการ (ชื่อโครงการ, เลขที่สัญญา, ผู้จัดการโครงการ)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                suppressHydrationWarning
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm ? 'ไม่พบโครงการที่ตรงกับการค้นหา' : 'ยังไม่มีโครงการ'}
            </p>
            {!searchTerm && (
              <Button 
                className="mt-4" 
                onClick={() => router.push('/projects/create')}
                suppressHydrationWarning
              >
                <Plus className="w-4 h-4 mr-2" />
                สร้างโครงการแรก
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{project.projectName}</CardTitle>
                    <CardDescription className="font-mono">{project.projectCode}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">วันที่เซ็นสัญญา:</span>
                    <span>{formatDate(project.signDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">เบอร์ติดต่อ:</span>
                    <span>{project.contactNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ผู้จัดการโครงการ:</span>
                    <span className="truncate max-w-32">{project.projectManager.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">จำนวน Suppliers:</span>
                    <span>{project.suppliers.length} ราย</span>
                  </div>
                </div>

                {/* SLA Levels */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">ระดับ SLA (ชม.):</span>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={getSLABadgeColor(project.slaLevel.high)} className="text-xs">
                      High: {project.slaLevel.high}ชม.
                    </Badge>
                    <Badge variant={getSLABadgeColor(project.slaLevel.medium)} className="text-xs">
                      Medium: {project.slaLevel.medium}ชม.
                    </Badge>
                    <Badge variant={getSLABadgeColor(project.slaLevel.low)} className="text-xs">
                      Low: {project.slaLevel.low}ชม.
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetail(project)}
                    suppressHydrationWarning
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    ดูรายละเอียด
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(project.id!)}
                      suppressHydrationWarning
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDelete(project.id!)}
                      suppressHydrationWarning
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
