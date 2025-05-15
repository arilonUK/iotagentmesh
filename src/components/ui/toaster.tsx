
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useState, useEffect } from "react"

export function Toaster() {
  // Safely access the toast context
  let toastList = [];
  try {
    const { toasts } = useToast();
    toastList = toasts || [];
  } catch (error) {
    console.warn('Toast context not available yet');
  }

  const [idToasts, setIdToasts] = useState([]);

  // Add unique ids to toasts if they don't have one
  useEffect(() => {
    if (toastList && toastList.length > 0) {
      const updatedToasts = toastList.map(toast => {
        if (!toast.id) {
          return { ...toast, id: crypto.randomUUID() }
        }
        return toast
      })
      setIdToasts(updatedToasts)
    } else {
      setIdToasts([])
    }
  }, [toastList])

  return (
    <ToastProvider>
      {idToasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
