import { useAuthBootstrap } from '@/hooks/useAuthBootstrap'

interface Props {
  children: React.ReactNode
}

export function AuthBootstrapProvider({ children }: Props) {
  const isReady = useAuthBootstrap()

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    )
  }

  return <>{children}</>
}
