import create from 'zustand'
import type { User } from '@/types'

interface UserStoreProps {
  user: User | undefined
  setUser: (user: User | undefined) => void
}

const useUserStore = create<UserStoreProps>((set) => ({
  user: undefined,
  setUser: (user) => set({ user })
}))

export { useUserStore }
