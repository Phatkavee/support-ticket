'use client'

import { useParams, useRouter } from 'next/navigation'
import { projectService } from '@/app/api/projects/project-service'
import type { Project, ProjectFormData } from '@/types/project'
import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { ProjectForm } from './CreateProjectForm'

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = params.id as string

  // โหลดข้อมูลโครงการ
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoadingProject(true)
        setError(null)
        const data = await projectService.getById(projectId)
        if (!data) {
          setError('ไม่พบโครงการที่ต้องการแก้ไข')
          return
        }
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
        console.error('Failed to load project:', err)
      } finally {
        setIsLoadingProject(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      setIsLoading(true)
      await projectService.update(projectId, data)
      alert('แก้ไขโครงการเรียบร้อยแล้ว')
      router.push('/projects')
    } catch (err) {
      console.error('Failed to update project:', err)
      alert('เกิดข้อผิดพลาดในการแก้ไขโครงการ: ' + (err instanceof Error ? err.message : 'ข้อผิดพลาดไม่ทราบสาเหตุ'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/projects')
  }

  // กำลังโหลดข้อมูล
  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg">
            {error || 'ไม่พบโครงการที่ต้องการแก้ไข'}
          </div>
          <button 
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            กลับไปหน้ารายการโครงการ
          </button>
        </div>
      </div>
    )
  }

  // แปลงข้อมูลโครงการเป็น form data
  const initialData: ProjectFormData = {
    projectCode: project.projectCode,
    projectName: project.projectName,
    contactNumber: project.contactNumber,
    signDate: project.signDate,
    suppliers: project.suppliers,
    slaLevel: project.slaLevel,
    projectManager: project.projectManager,
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ProjectForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  )
}
