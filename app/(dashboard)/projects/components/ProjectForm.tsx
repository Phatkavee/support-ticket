'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import type { ProjectFormData, Supplier } from '@/types/project'

interface ProjectFormProps {
  initialData?: ProjectFormData
  onSubmit: (data: ProjectFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export function ProjectForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode 
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>(initialData || {
    projectCode: '',
    projectName: '',
    contactNumber: '',
    signDate: '',
    suppliers: [{
      name: '',
      email: '',
      telephone: ''
    }],
    slaLevel: {
      high: 4,
      medium: 8,
      low: 24
    },
    projectManager: {
      name: '',
      email: '',
      telephone: ''
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const addSupplier = () => {
    setFormData(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, { name: '', email: '', telephone: '' }]
    }))
  }

  const removeSupplier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter((_, i) => i !== index)
    }))
  }

  const updateSupplier = (index: number, field: keyof Supplier, value: string) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map((supplier, i) => 
        i === index ? { ...supplier, [field]: value } : supplier
      )
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'ลงทะเบียนโครงการใหม่' : 'แก้ไขข้อมูลโครงการ'}
          </CardTitle>
          <CardDescription>
            กรอกข้อมูลโครงการและผู้ดูแลโครงการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ข้อมูลโครงการ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ข้อมูลโครงการ</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectCode">เลขที่สัญญา *</Label>
                  <Input
                    id="projectCode"
                    value={formData.projectCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectCode: e.target.value }))}
                    required
                    placeholder="เช่น PRJ-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectName">ชื่อโครงการ *</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    required
                    placeholder="ชื่อโครงการ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">เบอร์ติดต่อ *</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    required
                    placeholder="0XX-XXX-XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signDate">วันที่เซ็นสัญญา *</Label>
                  <Input
                    id="signDate"
                    type="date"
                    value={formData.signDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, signDate: e.target.value }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* ข้อมูลบริษัทผู้ดูแลโครงการ */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">บริษัทผู้ดูแลโครงการ (Suppliers)</CardTitle>
                    <CardDescription>สามารถระบุได้มากกว่า 1 ราย</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSupplier}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่ม Supplier
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.suppliers.map((supplier, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">Supplier {index + 1}</Badge>
                      {formData.suppliers.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSupplier(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`supplier-name-${index}`}>ชื่อ *</Label>
                        <Input
                          id={`supplier-name-${index}`}
                          value={supplier.name}
                          onChange={(e) => updateSupplier(index, 'name', e.target.value)}
                          required
                          placeholder="ชื่อบริษัท"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`supplier-email-${index}`}>อีเมล *</Label>
                        <Input
                          id={`supplier-email-${index}`}
                          type="email"
                          value={supplier.email}
                          onChange={(e) => updateSupplier(index, 'email', e.target.value)}
                          required
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`supplier-telephone-${index}`}>เบอร์โทรศัพท์ *</Label>
                        <Input
                          id={`supplier-telephone-${index}`}
                          value={supplier.telephone}
                          onChange={(e) => updateSupplier(index, 'telephone', e.target.value)}
                          required
                          placeholder="0XX-XXX-XXXX"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ระดับ SLA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ระดับ SLA (เวลาการแก้ไข)</CardTitle>
                <CardDescription>กำหนดระยะเวลาในการแก้ไขปัญหา (หน่วย: ชั่วโมง)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sla-high">High Priority (ชม.) *</Label>
                  <Input
                    id="sla-high"
                    type="number"
                    min="1"
                    value={formData.slaLevel.high}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      slaLevel: { ...prev.slaLevel, high: parseInt(e.target.value) || 0 }
                    }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sla-medium">Medium Priority (ชม.) *</Label>
                  <Input
                    id="sla-medium"
                    type="number"
                    min="1"
                    value={formData.slaLevel.medium}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      slaLevel: { ...prev.slaLevel, medium: parseInt(e.target.value) || 0 }
                    }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sla-low">Low Priority (ชม.) *</Label>
                  <Input
                    id="sla-low"
                    type="number"
                    min="1"
                    value={formData.slaLevel.low}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      slaLevel: { ...prev.slaLevel, low: parseInt(e.target.value) || 0 }
                    }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* ผู้จัดการโครงการ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ผู้จัดการโครงการหรือผู้รับผิดชอบ</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pm-name">ชื่อ *</Label>
                  <Input
                    id="pm-name"
                    value={formData.projectManager.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectManager: { ...prev.projectManager, name: e.target.value }
                    }))}
                    required
                    placeholder="ชื่อ-สกุล"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pm-email">อีเมล *</Label>
                  <Input
                    id="pm-email"
                    type="email"
                    value={formData.projectManager.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectManager: { ...prev.projectManager, email: e.target.value }
                    }))}
                    required
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pm-telephone">เบอร์โทรศัพท์ *</Label>
                  <Input
                    id="pm-telephone"
                    value={formData.projectManager.telephone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectManager: { ...prev.projectManager, telephone: e.target.value }
                    }))}
                    required
                    placeholder="0XX-XXX-XXXX"
                  />
                </div>
              </CardContent>
            </Card>

            {/* ปุ่มควบคุม */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'กำลังบันทึก...' : mode === 'create' ? 'สร้างโครงการ' : 'บันทึกการแก้ไข'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
