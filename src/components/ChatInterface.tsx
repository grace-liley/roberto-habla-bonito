import { useEffect, useRef, useCallback, useState } from "react";
import { Mic } from "lucide-react";
import robertoAvatar from "@/assets/roberto-avatar.png";

const ChatInterface = () => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isConversationActiveRef = useRef(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      console.log('Wake Lock API not supported');
      return;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      console.log('Wake lock acquired');
      
      wakeLockRef.current.addEventListener('release', () => {
        console.log('Wake lock released');
      });
    } catch (err) {
      console.log('Wake lock request failed:', err);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.log('Wake lock release failed:', err);
      }
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && isConversationActiveRef.current) {
      requestWakeLock();
    }
  }, [requestWakeLock]);

  const handleUserInteraction = useCallback(() => {
    if (!isConversationActiveRef.current) {
      isConversationActiveRef.current = true;
      requestWakeLock();
    }
  }, [requestWakeLock]);

  useEffect(() => {
    // Inject the Launch Lemonade script directly into the container
    const script = document.createElement('script');
    script.src = 'https://chat.launchlemonade.app/inline-voice/1763589993142x346823039676579840';
    script.async = true;
    
    const container = document.getElementById('lemonade-chat');
    
    if (container) {
      container.appendChild(script);
    }

    // Check if widget loads content
    const checkWidgetLoaded = setInterval(() => {
      if (container && container.children.length > 1) {
        setWidgetLoaded(true);
        clearInterval(checkWidgetLoaded);
      }
    }, 500);

    // Stop checking after 5 seconds
    setTimeout(() => clearInterval(checkWidgetLoaded), 5000);

    // Add visibility change listener for wake lock re-acquisition
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add interaction listener to start wake lock on user engagement
    const chatSection = document.getElementById('chat');
    if (chatSection) {
      chatSection.addEventListener('click', handleUserInteraction);
      chatSection.addEventListener('touchstart', handleUserInteraction);
    }
    
    return () => {
      clearInterval(checkWidgetLoaded);
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (chatSection) {
        chatSection.removeEventListener('click', handleUserInteraction);
        chatSection.removeEventListener('touchstart', handleUserInteraction);
      }
      releaseWakeLock();
      isConversationActiveRef.current = false;
    };
  }, [handleVisibilityChange, handleUserInteraction, releaseWakeLock]);

  return (
    <section 
      id="chat" 
      className="max-w-4xl mx-auto px-4 py-4"
      aria-label="Chat with Roberto"
    >
      {/* Placeholder shown when widget doesn't load (preview/development) */}
      {!widgetLoaded && (
        <div className="flex flex-col items-center gap-4 py-8">
          <img 
            src={robertoAvatar} 
            alt="Roberto"
            className="w-16 h-16 rounded-full border-2 border-foreground object-cover"
          />
          
          <div className="w-16 h-16 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center">
            <Mic className="w-8 h-8 text-foreground" />
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            🎤 Voice widget preview<br/>
            <span className="text-[10px]">(Only loads on live site)</span>
          </p>
        </div>
      )}

      {/* Voice Chat Widget - Script injected here */}
      <div 
        id="lemonade-chat"
        className="w-full"
        aria-label="Voice chat with Roberto"
      />
    </section>
  );
};

export default ChatInterface;
