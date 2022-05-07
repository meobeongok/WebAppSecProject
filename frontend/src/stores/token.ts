import create from 'zustand'

interface TokenStoreProps {
  accessToken: string | undefined
  setAccessToken: (accessToken: string | undefined) => void
}

const useTokenStore = create<TokenStoreProps>((set) => ({
  accessToken: undefined,
  setAccessToken: (accessToken) =>
    set({
      accessToken
    })
}))

export { useTokenStore }
