"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Mic, MicOff, MapPin, Upload, Users, Copy } from "lucide-react"
import { io, type Socket } from "socket.io-client"

interface User {
  id: string
  name: string
  location?: { lat: number; lng: number }
}

interface FileShare {
  id: string
  name: string
  size: number
  type: string
  url: string
  sender: string
}

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomCode = params.code as string
  const userName = searchParams.get("name") || "Anonymous"

  const [socket, setSocket] = useState<Socket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [isLocationSharing, setIsLocationSharing] = useState(false)
  const [sharedFiles, setSharedFiles] = useState<FileShare[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io("/api/socket", {
      path: "/api/socket/io",
    })

    newSocket.on("connect", () => {
      setIsConnected(true)
      newSocket.emit("join-room", { roomCode, userName })
    })

    newSocket.on("user-joined", (user: User) => {
      setUsers((prev) => [...prev, user])
    })

    newSocket.on("user-left", (userId: string) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    })

    newSocket.on("users-in-room", (roomUsers: User[]) => {
      setUsers(roomUsers)
    })

    newSocket.on("location-update", ({ userId, location }) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, location } : u)))
    })

    newSocket.on("file-shared", (file: FileShare) => {
      setSharedFiles((prev) => [...prev, file])
    })

    newSocket.on("webrtc-offer", async (offer) => {
      await handleWebRTCOffer(offer)
    })

    newSocket.on("webrtc-answer", async (answer) => {
      await handleWebRTCAnswer(answer)
    })

    newSocket.on("webrtc-ice-candidate", async (candidate) => {
      await handleICECandidate(candidate)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [roomCode, userName])

  const initializeWebRTC = async () => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    }

    peerConnectionRef.current = new RTCPeerConnection(configuration)

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("webrtc-ice-candidate", {
          roomCode,
          candidate: event.candidate,
        })
      }
    }

    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }
  }

  const handleWebRTCOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) await initializeWebRTC()

    await peerConnectionRef.current!.setRemoteDescription(offer)
    const answer = await peerConnectionRef.current!.createAnswer()
    await peerConnectionRef.current!.setLocalDescription(answer)

    if (socket) {
      socket.emit("webrtc-answer", { roomCode, answer })
    }
  }

  const handleWebRTCAnswer = async (answer: RTCSessionDescriptionInit) => {
    await peerConnectionRef.current?.setRemoteDescription(answer)
  }

  const handleICECandidate = async (candidate: RTCIceCandidate) => {
    await peerConnectionRef.current?.addIceCandidate(candidate)
  }

  const toggleVideo = async () => {
    try {
      if (!isVideoOn) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isAudioOn,
        })

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        localStreamRef.current = stream

        if (!peerConnectionRef.current) {
          await initializeWebRTC()
        }

        stream.getTracks().forEach((track) => {
          peerConnectionRef.current!.addTrack(track, stream)
        })

        // Create and send offer
        const offer = await peerConnectionRef.current!.createOffer()
        await peerConnectionRef.current!.setLocalDescription(offer)

        if (socket) {
          socket.emit("webrtc-offer", { roomCode, offer })
        }

        setIsVideoOn(true)
      } else {
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach((track) => track.stop())
        }
        setIsVideoOn(false)
      }
    } catch (error) {
      console.error("Error toggling video:", error)
      alert("Could not access camera. Please check permissions.")
    }
  }

  const toggleAudio = async () => {
    try {
      if (!isAudioOn) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideoOn,
        })

        if (isVideoOn && localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        localStreamRef.current = stream
        setIsAudioOn(true)
      } else {
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach((track) => track.stop())
        }
        setIsAudioOn(false)
      }
    } catch (error) {
      console.error("Error toggling audio:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const shareLocation = () => {
    if (!isLocationSharing) {
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }

            if (socket) {
              socket.emit("share-location", { roomCode, location })
            }
          },
          (error) => {
            console.error("Error getting location:", error)
            alert("Could not access location. Please check permissions.")
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 },
        )

        setIsLocationSharing(true)
      } else {
        alert("Geolocation is not supported by this browser.")
      }
    } else {
      setIsLocationSharing(false)
    }
  }

  const handleFileShare = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && socket) {
      const reader = new FileReader()
      reader.onload = () => {
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result,
          sender: userName,
        }

        socket.emit("share-file", { roomCode, file: fileData })
      }
      reader.readAsDataURL(file)
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    alert("Room code copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Room: {roomCode}</h1>
            <p className="text-sm text-gray-500">{isConnected ? "Connected" : "Connecting..."}</p>
          </div>
          <Button
            onClick={copyRoomCode}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors bg-transparent"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>
        </div>

        {/* Users */}
        <Card className="mb-4 border-none shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users ({users.length + 1})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                {userName} (You)
              </Badge>
              {users.map((user) => (
                <Badge
                  key={user.id}
                  variant="secondary"
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {user.name}
                  {user.location && <MapPin className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Video Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card className="border-none shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle>Your Video</CardTitle>
            </CardHeader>
            <CardContent>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-48 bg-gray-900 rounded-lg object-cover border border-gray-700 shadow-inner"
              />
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle>Remote Video</CardTitle>
            </CardHeader>
            <CardContent>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-48 bg-gray-900 rounded-lg object-cover border border-gray-700 shadow-inner"
              />
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-4 border-none shadow-lg rounded-xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={toggleVideo}
                className={`w-full py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 ${
                  isVideoOn
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                }`}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                Video
              </Button>

              <Button
                onClick={toggleAudio}
                className={`w-full py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 ${
                  isAudioOn
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                }`}
              >
                {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                Audio
              </Button>

              <Button
                onClick={shareLocation}
                className={`w-full py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 ${
                  isLocationSharing
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                }`}
              >
                <MapPin className="w-4 h-4" />
                Location
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Upload className="w-4 h-4" />
                Share File
              </Button>
            </div>

            <input ref={fileInputRef} type="file" onChange={handleFileShare} className="hidden" />
          </CardContent>
        </Card>

        {/* Shared Files */}
        <Card className="border-none shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Shared Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sharedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.sender}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    asChild
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-3 py-1.5 text-sm"
                  >
                    <a href={file.url} download={file.name}>
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
