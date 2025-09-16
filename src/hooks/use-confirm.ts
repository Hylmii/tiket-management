import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'success' | 'info'
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: () => {},
    onCancel: () => {},
    isLoading: false
  })

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        isOpen: true,
        isLoading: false,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isLoading: true }))
          setTimeout(() => {
            setConfirmState(prev => ({ ...prev, isOpen: false, isLoading: false }))
            resolve(true)
          }, 100)
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }, [])

  const closeDialog = useCallback(() => {
    if (!confirmState.isLoading) {
      confirmState.onCancel()
    }
  }, [confirmState])

  return {
    confirm,
    confirmState,
    closeDialog
  }
}
