"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

interface Message {
  id: number
  sender: string
  message: string
  timestamp: string
}

const API_URL = " https://book-bazaar-backend-nem0.onrender.com/api/messages"

export default function BookBazaarChat() {
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sender, setSender] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_URL}/hello`)
        
        if (!response.ok) {
          throw new Error(`Failed to load messages: ${response.status}`)
        }
        
        const data = await response.json()
        setMessages(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  // Animate new messages
  useEffect(() => {
    if (!chatContainerRef.current) return

    const messages = chatContainerRef.current.querySelectorAll(".message-item")
    gsap.from(messages, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    })

    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sender.trim() || !message.trim()) {
      setError("Please enter both your name and a message")
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: sender.trim(),
          message: message.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }

      const { data: newMessage } = await response.json()
      setMessages(prev => [...prev, newMessage])
      setMessage("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">BookBazaar Community</h1>
        <p className="text-gray-600">Share your thoughts with fellow book lovers</p>
      </header>

      {/* Chat Container */}
      <div className="border rounded-lg overflow-hidden">
        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="h-96 p-4 overflow-y-auto bg-gray-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages yet. Be the first to share!
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className="message-item mb-4 last:mb-0"
              >
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-blue-600">
                      {msg.sender}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-800">{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Form */}
        <form 
          onSubmit={handleSubmit}
          className="border-t p-4 bg-white"
        >
          {error && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded">
              {error}
            </div>
          )}

          <div className="mb-3">
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
            />
          </div>

          <div className="flex space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your book thoughts..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <button
              type="submit"
              disabled={isSending || !sender.trim() || !message.trim()}
              className={`px-6 py-2 rounded-lg font-medium text-white ${
                isSending || !sender.trim() || !message.trim()
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSending ? 'Sending...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Community Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold text-blue-800 mb-2">Community Guidelines</h2>
        <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>Be respectful to all members</li>
          <li>Keep discussions book-related</li>
          <li>No spam or self-promotion</li>
        </ul>
      </div>
    </div>
  )
}