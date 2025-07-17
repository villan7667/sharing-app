"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Video, MapPin, Share, Mic } from "lucide-react"

export default function HomePage() {
  const [roomCode, setRoomCode] = useState("")
  const [userName, setUserName] = useState("")
  const router = useRouter()

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = () => {
    if (!userName.trim()) {
      alert("Please enter your name")
      return
    }
    const newRoomCode = generateRoomCode()
    router.push(`/room/${newRoomCode}?name=${encodeURIComponent(userName)}`)
  }

  const joinRoom = () => {
    if (!userName.trim()) {
      alert("Please enter your name")
      return
    }
    if (!roomCode.trim()) {
      alert("Please enter room code")
      return
    }
    router.push(`/room/${roomCode.toUpperCase()}?name=${encodeURIComponent(userName)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-8 animate-fade-in">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">LiveShare</h1>
          <p className="text-lg text-gray-500">Connect, Share, Experience Together</p>
        </div>

        <Card className="mb-6 border-none shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Join the Experience
            </CardTitle>
            <CardDescription>Enter your name to start sharing live content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-none shadow-lg rounded-xl">
            <CardContent className="pt-6">
              <Button
                onClick={createRoom}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                size="lg"
              >
                Create New Room
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-xl">
            <CardContent className="pt-6 space-y-4">
              <Input
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full"
              />
              <Button
                onClick={joinRoom}
                variant="outline"
                className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg shadow-sm transition-all duration-300 ease-in-out transform hover:scale-105 hover:border-blue-500 hover:text-blue-600 bg-transparent"
                size="lg"
              >
                Join Room
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <Video className="w-9 h-9 mx-auto mb-3 text-blue-600" />
            <p className="text-base font-medium text-gray-700">Live Video</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <Mic className="w-9 h-9 mx-auto mb-3 text-green-600" />
            <p className="text-base font-medium text-gray-700">Live Audio</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <MapPin className="w-9 h-9 mx-auto mb-3 text-red-600" />
            <p className="text-base font-medium text-gray-700">Live Location</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <Share className="w-9 h-9 mx-auto mb-3 text-purple-600" />
            <p className="text-base font-medium text-gray-700">File Sharing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
