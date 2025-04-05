// Simplified version of the toast hook
import { useState } from "react"

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = (props) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])
    
    // For simplicity, we'll just log the toast to console
    console.log(`Toast: ${props.title} - ${props.description}`)
    
    // In a real implementation, this would add the toast to a state
    // and then remove it after a timeout
    return id
  }

  return { toast, toasts }
}
