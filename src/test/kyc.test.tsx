import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { KycOnboarding } from '@/components/onboarding/KycOnboarding'
import { supabase } from '@/integrations/supabase/client'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('KYC Process Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null
    } as any)
  })

  describe('KYC Form Submission', () => {
    it('should render KYC form with all required fields', () => {
      renderWithRouter(<KycOnboarding />)
      
      expect(screen.getByRole('textbox', { name: /nom complet/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /téléphone/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /adresse/i })).toBeInTheDocument()
      expect(screen.getByText(/télécharger une pièce d'identité/i)).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()
      renderWithRouter(<KycOnboarding />)
      
      const submitButton = screen.getByRole('button', { name: /soumettre/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/nom complet est requis/i)).toBeInTheDocument()
        expect(screen.getByText(/téléphone est requis/i)).toBeInTheDocument()
      })
    })

    it('should handle successful KYC submission', async () => {
      const user = userEvent.setup()
      const mockUpdate = vi.fn().mockResolvedValue({ data: {}, error: null })
      const mockEq = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(mockUpdate) })
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: mockEq })
      } as any)

      renderWithRouter(<KycOnboarding />)
      
      await user.type(screen.getByRole('textbox', { name: /nom complet/i }), 'John Doe')
      await user.type(screen.getByRole('textbox', { name: /téléphone/i }), '+33123456789')
      await user.type(screen.getByRole('textbox', { name: /adresse/i }), '123 Main St, Paris')
      
      const submitButton = screen.getByRole('button', { name: /soumettre/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          full_name: 'John Doe',
          phone: '+33123456789',
          location: '123 Main St, Paris',
          kyc_status: 'pending'
        })
      })
    })

    it('should handle KYC submission errors', async () => {
      const user = userEvent.setup()
      const mockUpdate = vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      })
      const mockEq = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(mockUpdate) })
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: mockEq })
      } as any)

      renderWithRouter(<KycOnboarding />)
      
      await user.type(screen.getByRole('textbox', { name: /nom complet/i }), 'John Doe')
      await user.type(screen.getByRole('textbox', { name: /téléphone/i }), '+33123456789')
      await user.type(screen.getByRole('textbox', { name: /adresse/i }), '123 Main St, Paris')
      
      const submitButton = screen.getByRole('button', { name: /soumettre/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/erreur lors de la soumission/i)).toBeInTheDocument()
      })
    })
  })

  describe('KYC Document Upload', () => {
    it('should handle file upload', async () => {
      const user = userEvent.setup()
      const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'documents/test.pdf' }, error: null })
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://test.com/test.pdf' } })
      } as any)

      renderWithRouter(<KycOnboarding />)
      
      const file = new File(['test content'], 'identity.pdf', { type: 'application/pdf' })
      const fileInput = screen.getByLabelText(/télécharger/i)
      
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(
          expect.stringContaining('identity.pdf'),
          file
        )
      })
    })

    it('should reject invalid file types', async () => {
      const user = userEvent.setup()
      renderWithRouter(<KycOnboarding />)
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const fileInput = screen.getByLabelText(/télécharger/i)
      
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/format de fichier non supporté/i)).toBeInTheDocument()
      })
    })
  })

  describe('KYC Status Management', () => {
    it('should display pending status correctly', () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { kyc_status: 'pending' },
              error: null
            })
          })
        })
      } as any)

      renderWithRouter(<KycOnboarding />)
      
      expect(screen.getByText(/en cours de vérification/i)).toBeInTheDocument()
    })

    it('should display approved status correctly', () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { kyc_status: 'approved' },
              error: null
            })
          })
        })
      } as any)

      renderWithRouter(<KycOnboarding />)
      
      expect(screen.getByText(/vérification approuvée/i)).toBeInTheDocument()
    })

    it('should display rejected status with reason', () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { 
                kyc_status: 'rejected',
                kyc_rejected_reason: 'Document illisible'
              },
              error: null
            })
          })
        })
      } as any)

      renderWithRouter(<KycOnboarding />)
      
      expect(screen.getByText(/vérification rejetée/i)).toBeInTheDocument()
      expect(screen.getByText(/document illisible/i)).toBeInTheDocument()
    })
  })
})