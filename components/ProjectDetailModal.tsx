'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import type { Project } from '@/types/project'
import { formatDateForUI } from '@/lib/date-utils'

interface ProjectDetailModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!project) return null

  const getSlaColor = (hours: number) => {
    if (hours <= 4) return 'bg-red-500 text-white'
    if (hours <= 8) return 'bg-yellow-500 text-white'
    return 'bg-green-500 text-white'
  }

  // Avoid hydration mismatch by only rendering dates on client
  const formatDate = (dateString: string, includeTime = false) => {
    if (!mounted) return '...'
    try {
      return formatDateForUI(dateString, { includeTime })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {project.projectCode} - {project.projectName}
          </DialogTitle>
          <DialogDescription>
            รายละเอียดโครงการ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ข้อมูลโครงการ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">รหัสโครงการ</Label>
              <p className="text-gray-900">{project.projectCode}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">ชื่อโครงการ</Label>
              <p className="text-gray-900">{project.projectName}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">เบอร์ติดต่อ</Label>
              <p className="text-gray-900">{project.contactNumber}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-500">วันที่เซ็นสัญญา</Label>
              <p className="text-gray-900">
                {formatDate(project.signDate)}
              </p>
            </div>
          </div>

          {/* ผู้จัดการโครงการ */}
          <div>
            <Label className="text-sm font-medium text-gray-500 mb-2 block">ผู้จัดการโครงการ</Label>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">ชื่อ</p>
                  <p className="text-gray-900">{project.projectManager.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">อีเมล</p>
                  <p className="text-gray-900">{project.projectManager.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">โทรศัพท์</p>
                  <p className="text-gray-900">{project.projectManager.telephone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ผู้ให้บริการ */}
          <div>
            <Label className="text-sm font-medium text-gray-500 mb-2 block">ผู้ให้บริการ</Label>
            <div className="space-y-3">
              {project.suppliers.map((supplier, index) => (
                <div key={supplier.id || index} className="p-4 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">ชื่อบริษัท</p>
                      <p className="text-gray-900">{supplier.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">อีเมล</p>
                      <p className="text-gray-900">{supplier.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">โทรศัพท์</p>
                      <p className="text-gray-900">{supplier.telephone}</p>
                    </div>
                  </div>
                </div>
              ))}
              {project.suppliers.length === 0 && (
                <p className="text-gray-500 py-4">ยังไม่มีข้อมูลผู้ให้บริการ</p>
              )}
            </div>
          </div>

          {/* ระดับ SLA */}
          <div>
            <Label className="text-sm font-medium text-gray-500 mb-2 block">ระดับ SLA</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-red-50 rounded-md border border-red-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">สูง (High)</span>
                  <Badge className={getSlaColor(project.slaLevel.high)}>
                    {project.slaLevel.high} ชั่วโมง
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-800">กลาง (Medium)</span>
                  <Badge className={getSlaColor(project.slaLevel.medium)}>
                    {project.slaLevel.medium} ชั่วโมง
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-md border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">ต่ำ (Low)</span>
                  <Badge className={getSlaColor(project.slaLevel.low)}>
                    {project.slaLevel.low} ชั่วโมง
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* วันที่สร้างและอัปเดต */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm font-medium text-gray-500">วันที่สร้าง</Label>
              <p className="text-gray-900">
                {project.createdAt && formatDate(project.createdAt, true)}
              </p>
            </div>
            {project.updatedAt && (
              <div>
                <Label className="text-sm font-medium text-gray-500">วันที่อัปเดตล่าสุด</Label>
                <p className="text-gray-900">
                  {formatDate(project.updatedAt, true)}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
