import * as React from 'react'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

type ToastVariant = 'default' | 'success' | 'destructive'

type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  open?: boolean
}

type State = { toasts: Toast[] }

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: { type: string; toast?: Toast; toastId?: string }) {
  switch (action.type) {
    case 'ADD_TOAST':
      memoryState = {
        toasts: [action.toast!, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      }
      break
    case 'UPDATE_TOAST':
      memoryState = {
        toasts: memoryState.toasts.map((t) =>
          t.id === action.toast!.id ? { ...t, ...action.toast } : t
        ),
      }
      break
    case 'DISMISS_TOAST':
      memoryState = {
        toasts: memoryState.toasts.map((t) =>
          t.id === action.toastId ? { ...t, open: false } : t
        ),
      }
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', toastId: action.toastId })
      }, 300)
      break
    case 'REMOVE_TOAST':
      memoryState = {
        toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
      }
      break
  }
  listeners.forEach((l) => l(memoryState))
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

function toast({
  title,
  description,
  variant = 'default',
}: {
  title?: string
  description?: string
  variant?: ToastVariant
}) {
  const id = genId()
  const newToast: Toast = { id, title, description, variant, open: true }
  dispatch({ type: 'ADD_TOAST', toast: newToast })
  setTimeout(() => dispatch({ type: 'DISMISS_TOAST', toastId: id }), TOAST_REMOVE_DELAY)
  return id
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return { toasts: state.toasts, toast }
}

export { useToast, toast }
