import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Auth from '@/pages/Auth'
import { supabase } from '@/integrations/supabase/client'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Sign Up Flow', () => {
    it('should render sign up form with required fields', () => {
      renderWithRouter(<Auth />)
      
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer un compte/i })).toBeInTheDocument()
    })

    it('should handle successful sign up', async () => {
      const user = userEvent.setup()
      const mockSignUp = vi.mocked(supabase.auth.signUp)
      mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: null })

      renderWithRouter(<Auth />)
      
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123')
      await user.click(screen.getByRole('button', { name: /créer un compte/i }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            emailRedirectTo: expect.stringContaining(window.location.origin)
          }
        })
      })
    })

    it('should handle sign up errors', async () => {
      const user = userEvent.setup()
      const mockSignUp = vi.mocked(supabase.auth.signUp)
      mockSignUp.mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: { message: 'Invalid email format' } as any
      })

      renderWithRouter(<Auth />)
      
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'invalid-email')
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123')
      await user.click(screen.getByRole('button', { name: /créer un compte/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Auth />)
      
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
      })
    })

    it('should validate password requirements', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Auth />)
      
      const passwordInput = screen.getByLabelText(/mot de passe/i)
      await user.type(passwordInput, '123')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/mot de passe doit contenir au moins 6 caractères/i)).toBeInTheDocument()
      })
    })
  })

  describe('Sign In Flow', () => {
    it('should handle successful sign in', async () => {
      const user = userEvent.setup()
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword)
      mockSignIn.mockResolvedValue({ 
        data: { user: { id: '123', email: 'test@example.com' }, session: {} }, 
        error: null 
      } as any)

      renderWithRouter(<Auth />)
      
      await user.click(screen.getByText(/se connecter/i))
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123')
      await user.click(screen.getByRole('button', { name: /se connecter/i }))

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    it('should handle sign in errors', async () => {
      const user = userEvent.setup()
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword)
      mockSignIn.mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: { message: 'Invalid login credentials' } as any
      })

      renderWithRouter(<Auth />)
      
      await user.click(screen.getByText(/se connecter/i))
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
      await user.type(screen.getByLabelText(/mot de passe/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /se connecter/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
      })
    })
  })

  describe('User Role Selection', () => {
    it('should allow selecting entrepreneur role', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Auth />)
      
      const entrepreneurRadio = screen.getByRole('radio', { name: /entrepreneur/i })
      await user.click(entrepreneurRadio)

      expect(entrepreneurRadio).toBeChecked()
    })

    it('should allow selecting investor role', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Auth />)
      
      const investorRadio = screen.getByRole('radio', { name: /investisseur/i })
      await user.click(investorRadio)

      expect(investorRadio).toBeChecked()
    })
  })
})