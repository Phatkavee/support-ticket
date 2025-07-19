'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Phone, Mail, User, Building } from 'lucide-react'
import type { Project } from '@/types/project'

interface ProjectDetailModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  if (!project) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {project.projectName}
            <Badge variant="outline">{project.projectCode}</Badge>
          </DialogTitle>
          <DialogDescription>
            รายละเอียดข้อมูลโครงการ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ข้อมูลพื้นฐาน */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลโครงการ</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
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
                ผู้จัดการโครงการหรือผู้รับผิดชอบ
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="destructive" className="mb-2">
                    High Priority
                  </Badge>
                  <div className="text-2xl font-bold text-red-600">
                    {project.slaLevel.high}
                  </div>
                  <div className="text-sm text-muted-foreground">ชั่วโมง</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="secondary" className="mb-2">
                    Medium Priority
                  </Badge>
                  <div className="text-2xl font-bold text-yellow-600">
                    {project.slaLevel.medium}
                  </div>
                  <div className="text-sm text-muted-foreground">ชั่วโมง</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Badge variant="outline" className="mb-2">
                    Low Priority
                  </Badge>
                  <div className="text-2xl font-bold text-green-600">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.suppliers.map((supplier, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Supplier {index + 1}</Badge>
                    </div>
                    <div className="space-y-2">
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
      </DialogContent>
    </Dialog>
  )
}
