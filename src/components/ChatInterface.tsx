import { useEffect, useRef } from "react";

const ChatInterface = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically inject the Launch Lemonade script into the container
    if (containerRef.current) {
      const script = document.createElement('script');
      script.src = 'https://chat.launchlemonade.app/inline-voice/1763589993142x346823039676579840';
      script.async = true;
      containerRef.current.appendChild(script);

      return () => {
        // Cleanup script on unmount
        if (containerRef.current && script.parentNode === containerRef.current) {
          containerRef.current.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <section 
      id="chat" 
      className="max-w-4xl mx-auto px-4 py-8"
      aria-label="Chat with Roberto"
    >
      {/* Voice Chat Widget Container */}
      <div 
        ref={containerRef}
        id="voice-chat-container"
        className="w-full min-h-[60vh]"
        aria-label="Voice chat with Roberto"
      />
    </section>
  );
};

export default ChatInterface;
