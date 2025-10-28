'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface Message {
  id: string | number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  query_type?: string
  sources?: string[]
}

interface ZwadiAIModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ZwadiAIModal({ isOpen, onClose }: ZwadiAIModalProps) {
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens and load initial prompts
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      // Load suggested prompts on first open
      if (messages.length === 0 && suggestedFollowups.length === 0) {
        loadSuggestedPrompts()
      }
    }
  }, [isOpen, messages.length, suggestedFollowups.length])

  const loadSuggestedPrompts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/suggested-prompts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      const data = await response.json()
      if (data.success && data.prompts) {
        setSuggestedFollowups(data.prompts)
      }
    } catch (error) {
      console.error('Failed to load suggested prompts:', error)
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setSuggestedFollowups([]) // Clear suggested followups while loading

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: textToSend
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update conversation ID if this was the first message
        if (!conversationId && data.conversation_id) {
          setConversationId(data.conversation_id)
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          query_type: data.query_type,
          sources: data.sources
        }
        setMessages(prev => [...prev, assistantMessage])

        // Update suggested followups
        if (data.suggested_followups && data.suggested_followups.length > 0) {
          setSuggestedFollowups(data.suggested_followups)
        }
      } else {
        throw new Error(data.detail || 'Failed to get response')
      }
    } catch (error) {
      console.error('Zwadi AI error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedPromptClick = (prompt: string) => {
    handleSendMessage(prompt)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-20 right-6 bottom-6 z-50 max-w-[400px] w-full">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Zawadi AI</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col">
          {messages.length === 0 && !isLoading && (
            <>
              <div className="flex flex-col items-center justify-start pt-12 mb-auto">
                <Image
                  src="/assets/zwadi.svg"
                  alt="Zawadi"
                  width={48}
                  height={48}
                  className="object-contain mb-4"
                />
                <p className="text-center text-gray-900 text-sm leading-relaxed">
                  Hello!<br />
                  I'm Zawadi, your AI investment<br />
                  assistant for frontier markets.
                </p>
              </div>

              {/* Suggested Follow-ups - shown at bottom above input */}
              {suggestedFollowups.length > 0 && (
                <div className="flex flex-col gap-2 mt-auto mb-4">
                  {suggestedFollowups.slice(0, 3).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPromptClick(prompt)}
                      className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && (
                  <div className="flex gap-2 items-start">
                    <div className="flex-shrink-0">
                      <Image
                        src="/assets/zwadi.svg"
                        alt="Zawadi"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[280px]">
                      <p className="text-sm whitespace-pre-wrap text-gray-900">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-xs opacity-70">Sources: {message.sources.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {message.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="bg-black text-white rounded-2xl px-4 py-3 max-w-[280px]">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-start">
                <div className="flex-shrink-0">
                  <Image
                    src="/assets/zwadi.svg"
                    alt="Zawadi"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 border-t border-gray-200">
          <div className="relative">
            <input
              ref={inputRef as any}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your message goes here..."
              className="w-full  pr-12  focus:outline-none  text-gray-900 placeholder-gray-400 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9  rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
               <Image
                  src="/assets/PaperPlaneTilt.svg"
                  alt="Zawadi"
                  width={20}
                  height={20}
                  className="object-contain"
                />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
