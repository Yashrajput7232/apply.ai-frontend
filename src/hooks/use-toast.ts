
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3 // Allow up to 3 toasts at once
const TOAST_REMOVE_DELAY = 5000 // Keep toasts visible for 5 seconds

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string, duration: number = TOAST_REMOVE_DELAY) => {
  if (toastTimeouts.has(toastId)) {
     // Clear existing timeout if the toast is updated or re-added
     clearTimeout(toastTimeouts.get(toastId));
     toastTimeouts.delete(toastId);
  }

  // Only set timeout if duration is positive
  if (duration > 0) {
      const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId)
        dispatch({
          type: "REMOVE_TOAST",
          toastId: toastId,
        })
      }, duration)

      toastTimeouts.set(toastId, timeout)
  }
}

// Function to clear timeout for a specific toast
const clearRemoveQueue = (toastId: string) => {
   if (toastTimeouts.has(toastId)) {
     clearTimeout(toastTimeouts.get(toastId));
     toastTimeouts.delete(toastId);
   }
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
       // Clear timeout for any existing toast with the same ID before adding/updating
      clearRemoveQueue(action.toast.id);
      // Add timeout for the new toast based on its duration prop or default
      addToRemoveQueue(action.toast.id, action.toast.duration);
      return {
        ...state,
        // Add new toast to the beginning, maintain limit
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
       // Clear and re-add timeout if duration might have changed
       if (action.toast.id) {
           clearRemoveQueue(action.toast.id);
           const currentToast = state.toasts.find(t => t.id === action.toast.id);
           const newDuration = action.toast.duration ?? currentToast?.duration ?? TOAST_REMOVE_DELAY;
           addToRemoveQueue(action.toast.id, newDuration);
       }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        // Instead of adding to remove queue, just mark as closed immediately
        // Timeout clearing happens naturally when it's removed later
        clearRemoveQueue(toastId); // Clear scheduled removal if dismissed manually
      } else {
        // Dismiss all toasts
        state.toasts.forEach((toast) => {
           clearRemoveQueue(toast.id);
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Mark as closed
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        // Clear all timeouts before removing all toasts
        state.toasts.forEach(toast => clearRemoveQueue(toast.id));
        return {
          ...state,
          toasts: [],
        }
      }
       // Clear timeout just in case before removing
       clearRemoveQueue(action.toastId);
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ duration = TOAST_REMOVE_DELAY, ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      duration, // Pass duration to the state
      onOpenChange: (open) => {
        if (!open) {
           // Trigger removal immediately when closed via UI (X button)
           clearRemoveQueue(id); // Make sure timeout is cleared
           dispatch({ type: "REMOVE_TOAST", toastId: id });
        }
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

