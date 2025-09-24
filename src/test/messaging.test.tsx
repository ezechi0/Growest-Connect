import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ChatInterface } from '@/components/messaging/ChatInterface'
import { supabase } from '@/integrations/supabase/client'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Messaging System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null
    } as any)
  })

  describe('Chat Interface', () => {
    const mockConversation = {
      id: 'conversation-1',
      investor_id: 'investor-1',
      entrepreneur_id: 'entrepreneur-1',
      project_id: 'project-1'
    }

    it('should render chat interface with message input', () => {
      renderWithRouter(<ChatInterface userId="test-user-id" />)
      
      expect(screen.getByRole('textbox', { name: /tapez votre message/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument()
    })

    it('should load and display conversation messages', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'Bonjour, je suis intéressé par votre projet',
          sender_id: 'investor-1',
          created_at: new Date().toISOString(),
          is_read: true
        },
        {
          id: 'msg-2', 
          content: 'Merci pour votre intérêt!',
          sender_id: 'entrepreneur-1',
          created_at: new Date().toISOString(),
          is_read: false
        }
      ]

      const mockSelect = vi.fn().mockResolvedValue({
        data: mockMessages,
        error: null
      })
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue(mockSelect)
          })
        })
      } as any)

      renderWithRouter(<ChatInterface userId="test-user-id" />)
      
      await waitFor(() => {
        expect(screen.getByText('Bonjour, je suis intéressé par votre projet')).toBeInTheDocument()
        expect(screen.getByText('Merci pour votre intérêt!')).toBeInTheDocument()
      })
    })

    it('should send a message successfully', async () => {
      const user = userEvent.setup()
      const mockInsert = vi.fn().mockResolvedValue({ data: {}, error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsert),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: [],
              error: null
            })
          })
        })
      } as any)

      renderWithRouter(<ChatInterface userId="test-user-id" />)
      
      const messageInput = screen.getByRole('textbox', { name: /tapez votre message/i })
      await user.type(messageInput, 'Nouveau message de test')
      
      const sendButton = screen.getByRole('button', { name: /envoyer/i })
      await user.click(sendButton)

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith({
          conversation_id: 'conversation-1',
          sender_id: 'test-user-id',
          content: 'Nouveau message de test'
        })
      })
    })

    it('should handle message sending errors', async () => {
      const user = userEvent.setup()
      const mockInsert = vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Network error' } 
      })
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsert),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: [],
              error: null
            })
          })
        })
      } as any)

      renderWithRouter(<ChatInterface userId="test-user-id" />)
      
      const messageInput = screen.getByRole('textbox', { name: /tapez votre message/i })
      await user.type(messageInput, 'Message qui va échouer')
      
      const sendButton = screen.getByRole('button', { name: /envoyer/i })
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/erreur lors de l'envoi/i)).toBeInTheDocument()
      })
    })

    it('should clear input after successful send', async () => {
      const user = userEvent.setup()
      const mockInsert = vi.fn().mockResolvedValue({ data: {}, error: null })
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsert),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: [],
              error: null
            })
          })
        })
      } as any)

      renderWithRouter(<ChatInterface userId="test-user-id" />)
      
      const messageInput = screen.getByRole('textbox', { name: /tapez votre message/i })
      await user.type(messageInput, 'Message à effacer')
      
      const sendButton = screen.getByRole('button', { name: /envoyer/i })
      await user.click(sendButton)

      await waitFor(() => {
        expect(messageInput).toHaveValue('')
      })
    })
  })

  describe('File Attachments', () => {
    it('should handle file upload in chat', async () => {
      const user = userEvent.setup()
      const mockUpload = vi.fn().mockResolvedValue({ 
        data: { path: 'attachments/test.pdf' }, 
        error: null 
      })
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: vi.fn().mockReturnValue({ 
          data: { publicUrl: 'http://test.com/attachment.pdf' } 
        })
      } as any)

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: [],
              error: null
            })
          })
        })
      } as any)

      renderWithRouter(<ChatInterface userId="test-user-id" />)
      
      const file = new File(['document content'], 'document.pdf', { type: 'application/pdf' })
      const fileInput = screen.getByLabelText(/joindre un fichier/i)
      
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(
          expect.stringContaining('document.pdf'),
          file
        )
      })
    })

    it('should reject oversized files', async () => {
      const user = userEvent.setup()
      renderWithRouter(<ChatInterface userId="test-user-id" />)
      
      // Create a file larger than 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
      const fileInput = screen.getByLabelText(/joindre un fichier/i)
      
      await user.upload(fileInput, largeFile)

      await waitFor(() => {
        expect(screen.getByText(/fichier trop volumineux/i)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Features', () => {
    it('should set up real-time subscription for new messages', () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn()
      }
      const mockSupabaseChannel = vi.fn().mockReturnValue(mockChannel)
      vi.mocked(supabase).channel = mockSupabaseChannel

      renderWithRouter(<ChatInterface userId="test-user-id" />)

      expect(mockSupabaseChannel).toHaveBeenCalledWith('messages')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }),
        expect.any(Function)
      )
    })

    it('should mark messages as read when viewed', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ data: {}, error: null })
      const mockEq = vi.fn().mockReturnValue(mockUpdate)
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: mockEq }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: [
                {
                  id: 'msg-1',
                  content: 'Message non lu',
                  sender_id: 'other-user',
                  is_read: false
                }
              ],
              error: null
            })
          })
        })
      } as any)

      renderWithRouter(<ChatInterface userId="test-user-id" />)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({ is_read: true })
      })
    })
  })

  describe('Offline Messaging', () => {
    it('should handle offline state gracefully', async () => {
      // Mock network offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      const user = userEvent.setup()
      renderWithRouter(<ChatInterface userId="test-user-id" />)
      
      expect(screen.getByText(/mode hors ligne/i)).toBeInTheDocument()
      
      const messageInput = screen.getByRole('textbox', { name: /tapez votre message/i })
      const sendButton = screen.getByRole('button', { name: /envoyer/i })
      
      expect(sendButton).toBeDisabled()
      expect(messageInput).toHaveProperty('placeholder', expect.stringContaining('hors ligne'))
    })

    it('should queue messages when offline and send when back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      const user = userEvent.setup()
      renderWithRouter(<ChatInterface userId="test-user-id" />)
      
      // Go back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })
      
      // Trigger online event
      window.dispatchEvent(new Event('online'))

      await waitFor(() => {
        expect(screen.queryByText(/mode hors ligne/i)).not.toBeInTheDocument()
      })
    })
  })
})