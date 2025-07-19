'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectDetailModal } from '@/components/ProjectDetailModal'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { projectService } from '@/lib/project-service'
import type { Project } from '@/types/project'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // โหลดข้อมูลโครงการ
  const loadProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await projectService.getAll()
      setProjects(data)
      setFilteredProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
      console.error('Failed to load projects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadProjects()
  }, [])

  // ค้นหาโครงการ
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(project => 
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectManager.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProjects(filtered)
    }
  }, [searchQuery, projects])

  // ดูรายละเอียดโครงการ
  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    setIsDetailModalOpen(true)
  }

  // แก้ไขโครงการ
  const handleEditProject = (project: Project) => {
    router.push(`/projects/${project.id}/edit`)
  }

  // ลบโครงการ
  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`คุณต้องการลบโครงการ "${project.projectName}" ใช่หรือไม่?`)) {
      return
    }

    try {
      await projectService.delete(project.id!)
      await loadProjects() // โหลดข้อมูลใหม่
      alert('ลบโครงการเรียบร้อยแล้ว')
    } catch (err) {
      console.error('Failed to delete project:', err)
      alert('เกิดข้อผิดพลาดในการลบโครงการ')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-600">เกิดข้อผิดพลาด: {error}</div>
          <Button onClick={loadProjects}>
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองใหม่
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* หัวเรื่องและปุ่มสร้างโครงการ */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการโครงการ</h1>
          <p className="text-muted-foreground mt-1">
            รายการโครงการทั้งหมด ({filteredProjects.length} โครงการ)
          </p>
        </div>
        <Button onClick={() => router.push('/projects/create')}>
          <Plus className="w-4 h-4 mr-2" />
          สร้างโครงการใหม่
        </Button>
      </div>

      {/* แถบค้นหา */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="ค้นหาโครงการ (ชื่อ, รหัส, หรือผู้จัดการ)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={loadProjects}>
          <RefreshCw className="w-4 h-4 mr-2" />
          รีเฟรช
        </Button>
      </div>

      {/* รายการโครงการ */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchQuery ? 'ไม่พบโครงการที่ค้นหา' : 'ยังไม่มีโครงการ'}
          </div>
          {!searchQuery && (
            <Button onClick={() => router.push('/projects/create')}>
              <Plus className="w-4 h-4 mr-2" />
              สร้างโครงการแรก
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={handleViewProject}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Modal แสดงรายละเอียด */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedProject(null)
        }}
      />
    </div>
  )
}
