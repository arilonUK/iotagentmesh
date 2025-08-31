
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useState, useEffect, useMemo } from "react"

export function Toaster() {
  const { toasts } = useToast();
  const [idToasts, setIdToasts] = useState([]);
  
  const toastList = useMemo(() => toasts || [], [toasts]);

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
