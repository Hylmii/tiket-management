'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useConfirm } from '@/hooks/use-confirm'

interface ProvidersProps {
  children: ReactNode
}

function ConfirmProvider({ children }: { children: ReactNode }) {
  const { confirmState, closeDialog } = useConfirm()

  return (
    <>
      {children}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeDialog}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        isLoading={confirmState.isLoading}
      />
    </>
  )
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ConfirmProvider>
        {children}
      </ConfirmProvider>
    </SessionProvider>
  )
}
