import { cn } from "@/lib/utils";
import robertoAvatar from "@/assets/roberto-avatar.png";

interface ChatBubbleProps {
  message: string;
  isRoberto?: boolean;
  timestamp?: string;
}

const ChatBubble = ({ message, isRoberto = false, timestamp }: ChatBubbleProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isRoberto ? "justify-start" : "justify-end"
      )}
    >
      {isRoberto && (
        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12">
          <img
            src={robertoAvatar}
            alt="Roberto avatar"
            className="w-full h-full rounded-full border-2 border-foreground object-cover"
          />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[75%] md:max-w-[65%] rounded-[var(--chat-bubble-radius)] px-4 py-3 border-2 border-foreground",
          isRoberto
            ? "bg-background text-foreground"
            : "bg-foreground text-background"
        )}
        role="article"
        aria-label={isRoberto ? "Roberto's message" : "Your message"}
      >
        <p className="text-sm md:text-base leading-relaxed">{message}</p>
        {timestamp && (
          <span className="text-xs opacity-60 mt-1 block">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
