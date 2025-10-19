import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService from '@/lib/services/authService'
import type { UserProfile } from '@/lib/supabase'

interface LoginCredentials {
  email: string
  password: string
  totpCode?: string
  rememberMe?: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface AuthState {
  // State
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<UserProfile>) => Promise<void>
  clearError: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const authData = await authService.login(credentials)
          set({ 
            user: authData.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null
          })
          throw error
        }
      },

      // Register action
      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const authData = await authService.register(userData)
          set({ 
            user: authData.user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
            isAuthenticated: false,
            user: null
          })
          throw error
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true })
        
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
          // Continue with local logout even if API call fails
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          })
        }
      },

      // Update user action
      updateUser: async (updates: Partial<UserProfile>) => {
        const currentUser = get().user
        if (!currentUser) return

        set({ isLoading: true, error: null })
        
        try {
          const updatedUser = await authService.updateProfile(updates)
          set({ 
            user: updatedUser, 
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false
          })
          throw error
        }
      },

      // Clear error action
      clearError: () => {
        set({ error: null })
      },

      // Initialize auth state from Supabase session
      initialize: async () => {
        set({ isLoading: true })
        
        try {
          const isAuth = await authService.isAuthenticated()
          const storedUser = await authService.getStoredUser()
          
          if (isAuth && storedUser) {
            set({ 
              user: storedUser, 
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({ 
              user: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to initialize auth state'
          })
        }
      },
    }),
    {
      name: 'dhanaillytics-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize on store creation (async)
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize()
}
