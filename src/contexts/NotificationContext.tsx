import {
  createContext,
  type JSX,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

export type NotificationType = "info" | "success" | "error"

export interface Notification {
  message: string
  type: NotificationType
}

const NOTIFICATION_DURATION_MS = 5000

interface NotificationContextType {
  notification: Notification | null
  setNotification: (message: string, type?: NotificationType) => void
  notifyInfo: (message: string) => void
  notifySuccess: (message: string) => void
  notifyError: (message: string) => void
  clearNotification: () => void
}

export const NotificationContext = createContext<NotificationContextType>(
  {} as NotificationContextType,
)

const Provider = NotificationContext as unknown as (props: {
  value: NotificationContextType
  children: ReactNode
}) => JSX.Element

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotificationState] = useState<Notification | null>(
    null,
  )
  const timeoutIdRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const clearNotification = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = undefined
    }
    setNotificationState(null)
  }

  const setNotification = (
    message: string,
    type: NotificationType = "info",
  ) => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }

    setNotificationState({ message, type })
    timeoutIdRef.current = setTimeout(() => {
      setNotificationState(null)
      timeoutIdRef.current = undefined
    }, NOTIFICATION_DURATION_MS)
  }

  const notifyInfo = (message: string) => {
    setNotification(message, "info")
  }

  const notifySuccess = (message: string) => {
    setNotification(message, "success")
  }

  const notifyError = (message: string) => {
    setNotification(message, "error")
  }

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
    }
  }, [])

  return (
    <Provider
      value={{
        notification,
        setNotification,
        notifyInfo,
        notifySuccess,
        notifyError,
        clearNotification,
      }}
    >
      {children}
    </Provider>
  )
}
