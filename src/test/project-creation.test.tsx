import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { supabase } from '@/integrations/supabase/client'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Project Creation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null
    } as any)
  })

  describe('Project Form Validation', () => {
    it('should render project creation form with all fields', () => {
      renderWithRouter(<ProjectForm onSuccess={vi.fn()} onCancel={vi.fn()} />)
      
      expect(screen.getByRole('textbox', { name: /titre du projet/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument()
      expect(screen.getByRole('spinbutton', { name: /objectif de financement/i })).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /secteur/i })).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()
      renderWithRouter(<ProjectForm onSuccess={vi.fn()} onCancel={vi.fn()} />)
      
      const submitButton = screen.getByRole('button', { name: /créer le projet/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/titre est requis/i)).toBeInTheDocument()
        expect(screen.getByText(/description est requise/i)).toBeInTheDocument()
      })
    })

    it('should validate funding goal minimum', async () => {
      const user = userEvent.setup()
      renderWithRouter(<ProjectForm onSuccess={vi.fn()} onCancel={vi.fn()} />)
      
      const fundingInput = screen.getByRole('spinbutton', { name: /objectif de financement/i })
      await user.type(fundingInput, '500')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/minimum 1000/i)).toBeInTheDocument()
      })
    })

    it('should validate min/max investment relationship', async () => {
      const user = userEvent.setup()
      renderWithRouter(<ProjectForm onSuccess={vi.fn()} onCancel={vi.fn()} />)
      
      const minInput = screen.getByRole('spinbutton', { name: /investissement minimum/i })
      const maxInput = screen.getByRole('spinbutton', { name: /investissement maximum/i })
      
      await user.type(minInput, '5000')
      await user.type(maxInput, '3000')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/maximum doit être supérieur au minimum/i)).toBeInTheDocument()
      })
    })
  })

  describe('Project Submission', () => {
    it('should handle successful project creation', async () => {
      const user = userEvent.setup()
      const onSuccessMock = vi.fn()
      
      const mockInsert = vi.fn().mockResolvedValue({ 
        data: [{ id: 'new-project-id' }], 
        error: null 
      })
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(mockInsert) })
      } as any)

      renderWithRouter(<ProjectForm onSuccess={onSuccessMock} onCancel={vi.fn()} />)
      
      await user.type(screen.getByRole('textbox', { name: /titre du projet/i }), 'Mon Super Projet')
      await user.type(screen.getByRole('textbox', { name: /description/i }), 'Description du projet')
      await user.type(screen.getByRole('spinbutton', { name: /objectif de financement/i }), '50000')
      await user.selectOptions(screen.getByRole('combobox', { name: /secteur/i }), 'technology')
      await user.type(screen.getByRole('textbox', { name: /localisation/i }), 'Paris, France')
      
      const submitButton = screen.getByRole('button', { name: /créer le projet/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Mon Super Projet',
          description: 'Description du projet',
          funding_goal: 50000,
          sector: 'technology',
          location: 'Paris, France',
          owner_id: 'test-user-id'
        }))
        expect(onSuccessMock).toHaveBeenCalledWith('new-project-id')
      })
    })

    it('should handle project creation errors', async () => {
      const user = userEvent.setup()
      
      const mockInsert = vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database constraint violation' } 
      })
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(mockInsert) })
      } as any)

      renderWithRouter(<ProjectForm onSuccess={vi.fn()} onCancel={vi.fn()} />)
      
      await user.type(screen.getByRole('textbox', { name: /titre du projet/i }), 'Mon Super Projet')
      await user.type(screen.getByRole('textbox', { name: /description/i }), 'Description du projet')
      await user.type(screen.getByRole('spinbutton', { name: /objectif de financement/i }), '50000')
      
      const submitButton = screen.getByRole('button', { name: /créer le projet/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/erreur lors de la création/i)).toBeInTheDocument()
      })
    })
  })

  describe('File Upload Features', () => {
    it('should handle pitch deck upload', async () => {
      const user = userEvent.setup()
      const mockUpload = vi.fn().mockResolvedValue({ 
        data: { path: 'pitch-decks/test.pdf' }, 
        error: null 
      })
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: vi.fn().mockReturnValue({ 
          data: { publicUrl: 'http://test.com/pitch.pdf' } 
        })
      } as any)

      renderWithRouter(<ProjectForm onSuccess={vi.fn()} onCancel={vi.fn()} />)
      
      const file = new File(['pitch deck content'], 'pitch.pdf', { type: 'application/pdf' })
      const fileInput = screen.getByLabelText(/pitch deck/i)
      
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled()
      })
    })

    it('should handle image upload', async () => {
      const user = userEvent.setup()
      const mockUpload = vi.fn().mockResolvedValue({ 
        data: { path: 'project-images/test.jpg' }, 
        error: null 
      })
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: vi.fn().mockReturnValue({ 
          data: { publicUrl: 'http://test.com/image.jpg' } 
        })
      } as any)

      renderWithRouter(<ProjectForm onSuccess={vi.fn()} onCancel={vi.fn()} />)
      
      const file = new File(['image content'], 'project.jpg', { type: 'image/jpeg' })
      const fileInput = screen.getByLabelText(/images/i)
      
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled()
      })
    })
  })

  describe('Project Editing', () => {
    it('should load existing project data for editing', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: {
          id: 'existing-project-id',
          title: 'Existing Project',
          description: 'Existing description',
          funding_goal: 25000,
          sector: 'healthcare'
        },
        error: null
      })
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(mockSelect)
          })
        })
      } as any)

      renderWithRouter(
        <ProjectForm 
          projectId="existing-project-id"
          onSuccess={vi.fn()} 
          onCancel={vi.fn()} 
        />
      )
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
        expect(screen.getByDisplayValue('25000')).toBeInTheDocument()
      })
    })
  })
})