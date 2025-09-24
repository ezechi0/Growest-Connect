import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AdvancedMatching } from '@/components/matching/AdvancedMatching'
import { supabase } from '@/integrations/supabase/client'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Matching System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null
    } as any)
  })

  describe('AI Matching Algorithm', () => {
    it('should render matching preferences form', () => {
      renderWithRouter(<AdvancedMatching userType="investor" />)
      
      expect(screen.getByText(/préférences d'investissement/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /secteurs préférés/i })).toBeInTheDocument()
      expect(screen.getByRole('spinbutton', { name: /montant minimum/i })).toBeInTheDocument()
    })

    it('should handle successful matching request', async () => {
      const user = userEvent.setup()
      const mockInvoke = vi.fn().mockResolvedValue({
        data: {
          matches: [
            {
              project_id: 'project-1',
              score: 0.85,
              reasons: ['Secteur correspondant', 'Montant dans la fourchette']
            }
          ]
        },
        error: null
      })
      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke)

      renderWithRouter(<AdvancedMatching userType="investor" />)
      
      const findMatchesButton = screen.getByRole('button', { name: /trouver des correspondances/i })
      await user.click(findMatchesButton)

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('advanced-matching', {
          body: expect.objectContaining({
            user_id: 'test-user-id'
          })
        })
      })
    })

    it('should display matching results', async () => {
      const user = userEvent.setup()
      const mockInvoke = vi.fn().mockResolvedValue({
        data: {
          matches: [
            {
              project_id: 'project-1',
              title: 'Projet Tech',
              score: 0.85,
              reasons: ['Secteur technologie', 'Montant 50K€']
            }
          ]
        },
        error: null
      })
      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke)

      renderWithRouter(<AdvancedMatching userType="investor" />)
      
      const findMatchesButton = screen.getByRole('button', { name: /trouver des correspondances/i })
      await user.click(findMatchesButton)

      await waitFor(() => {
        expect(screen.getByText('Projet Tech')).toBeInTheDocument()
        expect(screen.getByText('85%')).toBeInTheDocument()
        expect(screen.getByText('Secteur technologie')).toBeInTheDocument()
      })
    })

    it('should handle matching errors', async () => {
      const user = userEvent.setup()
      const mockInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'AI service unavailable' }
      })
      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke)

      renderWithRouter(<AdvancedMatching userType="investor" />)
      
      const findMatchesButton = screen.getByRole('button', { name: /trouver des correspondances/i })
      await user.click(findMatchesButton)

      await waitFor(() => {
        expect(screen.getByText(/erreur lors du matching/i)).toBeInTheDocument()
      })
    })
  })

  describe('Match Preferences', () => {
    it('should save user preferences', async () => {
      const user = userEvent.setup()
      const mockUpdate = vi.fn().mockResolvedValue({ data: {}, error: null })
      const mockEq = vi.fn().mockReturnValue(mockUpdate)
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: mockEq })
      } as any)

      renderWithRouter(<AdvancedMatching userType="investor" />)
      
      await user.selectOptions(screen.getByRole('combobox', { name: /secteurs/i }), 'technology')
      await user.type(screen.getByRole('spinbutton', { name: /montant minimum/i }), '10000')
      
      const saveButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            matching_preferences: expect.objectContaining({
              preferred_sectors: ['technology'],
              min_investment: 10000
            })
          })
        )
      })
    })

    it('should load existing preferences', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: {
          matching_preferences: {
            preferred_sectors: ['healthcare'],
            min_investment: 5000,
            max_investment: 50000
          }
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

      renderWithRouter(<AdvancedMatching userType="investor" />)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('5000')).toBeInTheDocument()
        expect(screen.getByDisplayValue('50000')).toBeInTheDocument()
      })
    })
  })

  describe('Match Actions', () => {
    it('should allow connecting with matched project', async () => {
      const user = userEvent.setup()
      const mockInsert = vi.fn().mockResolvedValue({ data: {}, error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsert)
      } as any)

      // Mock initial matches display
      const mockInvoke = vi.fn().mockResolvedValue({
        data: {
          matches: [
            {
              project_id: 'project-1',
              title: 'Projet Tech',
              score: 0.85,
              entrepreneur_id: 'entrepreneur-1'
            }
          ]
        },
        error: null
      })
      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke)

      renderWithRouter(<AdvancedMatching userType="investor" />)
      
      const findButton = screen.getByRole('button', { name: /trouver des correspondances/i })
      await user.click(findButton)

      await waitFor(() => {
        expect(screen.getByText('Projet Tech')).toBeInTheDocument()
      })

      const connectButton = screen.getByRole('button', { name: /se connecter/i })
      await user.click(connectButton)

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            investor_id: 'test-user-id',
            project_id: 'project-1',
            entrepreneur_id: 'entrepreneur-1'
          })
        )
      })
    })

    it('should allow saving project to favorites', async () => {
      const user = userEvent.setup()
      const mockInsert = vi.fn().mockResolvedValue({ data: {}, error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsert)
      } as any)

      // Mock matches display
      const mockInvoke = vi.fn().mockResolvedValue({
        data: {
          matches: [
            {
              project_id: 'project-1',
              title: 'Projet Tech',
              score: 0.85
            }
          ]
        },
        error: null
      })
      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke)

      renderWithRouter(<AdvancedMatching userType="investor" />)
      
      const findButton = screen.getByRole('button', { name: /trouver des correspondances/i })
      await user.click(findButton)

      await waitFor(() => {
        expect(screen.getByText('Projet Tech')).toBeInTheDocument()
      })

      const favoriteButton = screen.getByRole('button', { name: /ajouter aux favoris/i })
      await user.click(favoriteButton)

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith({
          user_id: 'test-user-id',
          project_id: 'project-1'
        })
      })
    })
  })
})