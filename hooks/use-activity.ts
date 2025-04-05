"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getUserActivity } from "@/lib/db"

interface ActivityLog {
  id: string
  userId: string
  action: string
  projectId?: string
  projectName?: string
  timestamp: any
}

export function useActivity(limit = 10) {
  const { user } = useAuth()
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchActivity() {
      if (!user) {
        setActivity([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userActivity = await getUserActivity(user.uid, limit)
        setActivity(userActivity as ActivityLog[])
        setError(null)
      } catch (err) {
        console.error("Error fetching activity:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch activity"))
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [user, limit])

  return { activity, loading, error }
}

