import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { InvestmentForm } from '@/components/transactions/InvestmentForm'
import { usePaystackPayment } from '@/hooks/usePaystackPayment'
import { supabase } from '@/integrations/supabase/client'

// Mock the Paystack hook
vi.mock('@/hooks/usePaystackPayment')

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Payment System Tests', () => {
  const mockInitializePayment = vi.fn()
  const mockRedirectToPayment = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock the Paystack hook
    vi.mocked(usePaystackPayment).mockReturnValue({
      initializePayment: mockInitializePayment,
      redirectToPayment: mockRedirectToPayment,
      loading: false
    })

    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null
    } as any)
  })

  describe('Investment Form', () => {
    const mockProps = {
      projectId: 'project-1',
      projectTitle: 'Test Project',
      minInvestment: 1000,
      maxInvestment: 50000,
      onSuccess: vi.fn()
    }

    it('should render investment form with all fields', () => {
      renderWithRouter(<InvestmentForm {...mockProps} />)
      
      expect(screen.getByRole('spinbutton', { name: /montant d'investissement/i })).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /devise/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /mobile money/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /conditions/i })).toBeInTheDocument()
    })

    it('should validate minimum investment amount', async () => {
      const user = userEvent.setup()
      renderWithRouter(<InvestmentForm {...mockProps} />)
      
      const amountInput = screen.getByRole('spinbutton', { name: /montant/i })
      await user.type(amountInput, '500')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/montant minimum/i)).toBeInTheDocument()
      })
    })

    it('should validate maximum investment amount', async () => {
      const user = userEvent.setup()
      renderWithRouter(<InvestmentForm {...mockProps} />)
      
      const amountInput = screen.getByRole('spinbutton', { name: /montant/i })
      await user.clear(amountInput)
      await user.type(amountInput, '75000')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/montant maximum/i)).toBeInTheDocument()
      })
    })

    it('should require terms agreement', async () => {
      const user = userEvent.setup()
      renderWithRouter(<InvestmentForm {...mockProps} />)
      
      const amountInput = screen.getByRole('spinbutton', { name: /montant/i })
      await user.type(amountInput, '5000')
      
      const investButton = screen.getByRole('button', { name: /investir/i })
      await user.click(investButton)

      await waitFor(() => {
        expect(screen.getByText(/accepter les conditions/i)).toBeInTheDocument()
      })
    })

    it('should calculate commission correctly', async () => {
      const user = userEvent.setup()
      renderWithRouter(<InvestmentForm {...mockProps} />)
      
      const amountInput = screen.getByRole('spinbutton', { name: /montant/i })
      await user.type(amountInput, '10000')

      await waitFor(() => {
        expect(screen.getByText('500')).toBeInTheDocument() // 5% commission
        expect(screen.getByText('10 500')).toBeInTheDocument() // Total with commission
      })
    })

    it('should handle successful payment initialization', async () => {
      const user = userEvent.setup()
      mockInitializePayment.mockResolvedValue({
        success: true,
        authorization_url: 'https://checkout.paystack.com/test',
        reference: 'test-ref-123'
      })

      renderWithRouter(<InvestmentForm {...mockProps} />)
      
      const amountInput = screen.getByRole('spinbutton', { name: /montant/i })
      await user.type(amountInput, '5000')
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /conditions/i })
      await user.click(termsCheckbox)
      
      const investButton = screen.getByRole('button', { name: /investir/i })
      await user.click(investButton)

      await waitFor(() => {
        expect(mockInitializePayment).toHaveBeenCalledWith({
          email: 'test@example.com',
          amount: 5250, // 5000 + 250 commission
          plan: 'investment',
          projectId: 'project-1',
          metadata: expect.objectContaining({
            project_title: 'Test Project',
            investment_amount: 5000
          })
        })
        expect(mockRedirectToPayment).toHaveBeenCalledWith('https://checkout.paystack.com/test')
      })
    })

    it('should handle payment initialization errors', async () => {
      const user = userEvent.setup()
      mockInitializePayment.mockResolvedValue({
        success: false,
        error: 'Payment service unavailable'
      })

      renderWithRouter(<InvestmentForm {...mockProps} />)
      
      const amountInput = screen.getByRole('spinbutton', { name: /montant/i })
      await user.type(amountInput, '5000')
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /conditions/i })
      await user.click(termsCheckbox)
      
      const investButton = screen.getByRole('button', { name: /investir/i })
      await user.click(investButton)

      await waitFor(() => {
        expect(screen.getByText(/payment service unavailable/i)).toBeInTheDocument()
      })
    })
  })

  describe('Currency Support', () => {
    it('should support multiple currencies', async () => {
      const user = userEvent.setup()
      renderWithRouter(<InvestmentForm {...{
        projectId: 'project-1',
        projectTitle: 'Test Project',
        minInvestment: 1000,
        maxInvestment: 50000,
        onSuccess: vi.fn()
      }} />)
      
      const currencySelect = screen.getByRole('combobox', { name: /devise/i })
      await user.selectOptions(currencySelect, 'EUR')

      expect(currencySelect).toHaveValue('EUR')
      expect(screen.getByText(/total à payer.*EUR/i)).toBeInTheDocument()
    })

    it('should handle USD currency', async () => {
      const user = userEvent.setup()
      renderWithRouter(<InvestmentForm {...{
        projectId: 'project-1',
        projectTitle: 'Test Project',
        minInvestment: 1000,
        maxInvestment: 50000,
        onSuccess: vi.fn()
      }} />)
      
      const currencySelect = screen.getByRole('combobox', { name: /devise/i })
      await user.selectOptions(currencySelect, 'USD')

      expect(currencySelect).toHaveValue('USD')
      expect(screen.getByText(/total à payer.*USD/i)).toBeInTheDocument()
    })
  })

  describe('Mobile Money Integration', () => {
    it('should show mobile money option', async () => {
      const user = userEvent.setup()
      renderWithRouter(<InvestmentForm {...{
        projectId: 'project-1',
        projectTitle: 'Test Project',
        minInvestment: 1000,
        maxInvestment: 50000,
        onSuccess: vi.fn()
      }} />)
      
      const mobileMoneyCheckbox = screen.getByRole('checkbox', { name: /mobile money/i })
      await user.click(mobileMoneyCheckbox)

      expect(mobileMoneyCheckbox).toBeChecked()
      expect(screen.getByText(/payer avec mobile money/i)).toBeInTheDocument()
    })

    it('should change payment button text for mobile money', async () => {
      const user = userEvent.setup()
      renderWithRouter(<InvestmentForm {...{
        projectId: 'project-1',
        projectTitle: 'Test Project',
        minInvestment: 1000,
        maxInvestment: 50000,
        onSuccess: vi.fn()
      }} />)
      
      const mobileMoneyCheckbox = screen.getByRole('checkbox', { name: /mobile money/i })
      await user.click(mobileMoneyCheckbox)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /payer avec mobile money/i })).toBeInTheDocument()
      })
    })
  })

  describe('Payment Error Scenarios', () => {
    it('should handle network errors during payment', async () => {
      const user = userEvent.setup()
      mockInitializePayment.mockRejectedValue(new Error('Network error'))

      renderWithRouter(<InvestmentForm {...{
        projectId: 'project-1',
        projectTitle: 'Test Project',
        minInvestment: 1000,
        maxInvestment: 50000,
        onSuccess: vi.fn()
      }} />)
      
      const amountInput = screen.getByRole('spinbutton', { name: /montant/i })
      await user.type(amountInput, '5000')
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /conditions/i })
      await user.click(termsCheckbox)
      
      const investButton = screen.getByRole('button', { name: /investir/i })
      await user.click(investButton)

      await waitFor(() => {
        expect(screen.getByText(/erreur de réseau/i)).toBeInTheDocument()
      })
    })

    it('should handle insufficient funds error', async () => {
      const user = userEvent.setup()
      mockInitializePayment.mockResolvedValue({
        success: false,
        error: 'Insufficient funds'
      })

      renderWithRouter(<InvestmentForm {...{
        projectId: 'project-1',
        projectTitle: 'Test Project',
        minInvestment: 1000,
        maxInvestment: 50000,
        onSuccess: vi.fn()
      }} />)
      
      const amountInput = screen.getByRole('spinbutton', { name: /montant/i })
      await user.type(amountInput, '5000')
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /conditions/i })
      await user.click(termsCheckbox)
      
      const investButton = screen.getByRole('button', { name: /investir/i })
      await user.click(investButton)

      await waitFor(() => {
        expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument()
      })
    })

    it('should handle card declined error', async () => {
      const user = userEvent.setup()
      mockInitializePayment.mockResolvedValue({
        success: false,
        error: 'Your card was declined'
      })

      renderWithRouter(<InvestmentForm {...{
        projectId: 'project-1',
        projectTitle: 'Test Project',
        minInvestment: 1000,
        maxInvestment: 50000,
        onSuccess: vi.fn()
      }} />)
      
      const amountInput = screen.getByRole('spinbutton', { name: /montant/i })
      await user.type(amountInput, '5000')
      
      const termsCheckbox = screen.getByRole('checkbox', { name: /conditions/i })
      await user.click(termsCheckbox)
      
      const investButton = screen.getByRole('button', { name: /investir/i })
      await user.click(investButton)

      await waitFor(() => {
        expect(screen.getByText(/your card was declined/i)).toBeInTheDocument()
      })
    })
  })
})