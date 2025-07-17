import type { NextRequest } from "next/server"

interface User {
  id: string
  name: string
  location?: { lat: number; lng: number }
}

interface Room {
  users: Map<string, User>
}

const rooms = new Map<string, Room>()

export async function GET(req: NextRequest) {
  return new Response("Socket.IO server is running", { status: 200 })
}

// This will be handled by the Socket.IO server in the middleware
export const dynamic = "force-dynamic"
