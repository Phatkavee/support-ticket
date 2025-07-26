'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectListPage } from './components/ProjectListPage'
import { projectService } from '@/app/api/projects/project-service'
import type { Project } from '@/types/project'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const data = await projectService.getAll()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleEdit = (id: string) => {
    router.push(`/projects/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบโครงการนี้หรือไม่?')) {
      return
    }

    try {
      await projectService.delete(id)
      alert('ลบโครงการเรียบร้อยแล้ว')
      await loadProjects() // Reload projects
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('เกิดข้อผิดพลาดในการลบโครงการ')
    }
  }

  return (
    <ProjectListPage
      projects={projects}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={loadProjects}
      isLoading={isLoading}
    />
  )
}