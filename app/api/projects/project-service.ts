import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'
import type { Project, ProjectFormData } from '@/types/project'

const supabase = createClient()

export const projectService = {
  // ดึงข้อมูลโครงการทั้งหมด
  async getAll(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Log error for debugging
        logger.error('Supabase error:', error)
        // ถ้าตารางยังไม่มี หรือ permission ไม่ถูกต้อง ให้ return empty array
        if (error.code === 'PGRST116' || error.message.includes('relation "projects" does not exist')) {
          logger.warn('Projects table does not exist or no data found. Please run the SQL schema first.')
          return []
        }
        throw new Error(`Failed to fetch projects: ${error.message}`)
      }

      return data?.map(item => ({
        id: item.id,
        projectCode: item.project_code,
        projectName: item.project_name,
        contactNumber: item.contact_number,
        signDate: item.sign_date,
        suppliers: item.suppliers || [],
        slaLevel: item.sla_level || { high: 4, medium: 8, low: 24 },
        projectManager: item.project_manager || {},
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || []
    } catch (err) {
      logger.error('Error in getAll:', err)
      // Return empty array as fallback to prevent app crash
      return []
    }
  },

  // ดึงข้อมูลโครงการตาม ID
  async getById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // ไม่พบข้อมูล
        }
        logger.error('Supabase error:', error)
        throw new Error(`Failed to fetch project: ${error.message}`)
      }

      return {
        id: data.id,
        projectCode: data.project_code,
        projectName: data.project_name,
        contactNumber: data.contact_number,
        signDate: data.sign_date,
        suppliers: data.suppliers || [],
        slaLevel: data.sla_level || { high: 4, medium: 8, low: 24 },
        projectManager: data.project_manager || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (err) {
      logger.error('Error in getById:', err)
      return null
    }
  },

  // สร้างโครงการใหม่
  async create(projectData: ProjectFormData): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        project_code: projectData.projectCode,
        project_name: projectData.projectName,
        contact_number: projectData.contactNumber,
        sign_date: projectData.signDate,
        suppliers: projectData.suppliers,
        sla_level: projectData.slaLevel,
        project_manager: projectData.projectManager,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    return {
      id: data.id,
      projectCode: data.project_code,
      projectName: data.project_name,
      contactNumber: data.contact_number,
      signDate: data.sign_date,
      suppliers: data.suppliers,
      slaLevel: data.sla_level,
      projectManager: data.project_manager,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  // อัพเดทโครงการ
  async update(id: string, projectData: ProjectFormData): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        project_code: projectData.projectCode,
        project_name: projectData.projectName,
        contact_number: projectData.contactNumber,
        sign_date: projectData.signDate,
        suppliers: projectData.suppliers,
        sla_level: projectData.slaLevel,
        project_manager: projectData.projectManager,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`)
    }

    return {
      id: data.id,
      projectCode: data.project_code,
      projectName: data.project_name,
      contactNumber: data.contact_number,
      signDate: data.sign_date,
      suppliers: data.suppliers,
      slaLevel: data.sla_level,
      projectManager: data.project_manager,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  // ลบโครงการ
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }
  },

  // ค้นหาโครงการ
  async search(query: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`project_code.ilike.%${query}%,project_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Supabase error:', error)
        if (error.message.includes('relation "projects" does not exist')) {
          logger.warn('Projects table does not exist. Please run the SQL schema first.')
          return []
        }
        throw new Error(`Failed to search projects: ${error.message}`)
      }

      return data?.map(item => ({
        id: item.id,
        projectCode: item.project_code,
        projectName: item.project_name,
        contactNumber: item.contact_number,
        signDate: item.sign_date,
        suppliers: item.suppliers || [],
        slaLevel: item.sla_level || { high: 4, medium: 8, low: 24 },
        projectManager: item.project_manager || {},
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || []
    } catch (err) {
      logger.error('Error in search:', err)
      return []
    }
  },
}
