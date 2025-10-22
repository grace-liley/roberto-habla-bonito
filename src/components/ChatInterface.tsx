import { useState, useRef, useEffect } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ChatBubble from "./ChatBubble";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isRoberto: boolean;
  timestamp: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! I'm Roberto, your friendly Spanish tutor. Let's practice together! How can I help you today?",
      isRoberto: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isRoberto: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate Roberto's response
    setTimeout(() => {
      const responses = [
        "¡Muy bien! That's a great question. Let me help you with that...",
        "¡Excelente! I see what you're trying to say. In Spanish, we would say...",
        "That's a good start! Let's practice the pronunciation together.",
        "¡Perfecto! You're making great progress. Let me explain...",
      ];
      
      const robertoMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isRoberto: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, robertoMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    toast({
      title: "Voice input",
      description: "Voice input feature coming soon!",
    });
  };

  return (
    <section 
      id="chat" 
      className="max-w-4xl mx-auto px-4 py-8"
      aria-label="Chat with Roberto"
    >
      {/* Messages container */}
      <div 
        className="bg-secondary/30 rounded-2xl border-2 border-border p-4 mb-4 h-[60vh] overflow-y-auto smooth-scroll"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            isRoberto={message.isRoberto}
            timestamp={message.timestamp}
          />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Press Enter to send)"
          className="min-h-[60px] resize-none border-2 border-foreground focus-visible:ring-accent rounded-xl"
          aria-label="Message input"
        />
        
        <Button
          onClick={handleVoiceInput}
          variant="outline"
          size="icon"
          className={cn(
            "touch-target h-[60px] w-[60px] border-2 border-foreground rounded-xl hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all",
            isListening && "bg-accent text-accent-foreground"
          )}
          aria-label="Voice input"
        >
          <Mic className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={handleSend}
          size="icon"
          className="touch-target h-[60px] w-[60px] bg-accent hover:bg-accent/90 rounded-xl"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

// Inline cn utility to avoid circular dependency
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default ChatInterface;
