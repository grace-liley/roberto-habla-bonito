import { useEffect } from "react";

const ChatInterface = () => {
  useEffect(() => {
    // Inject the Launch Lemonade script directly into the container
    const script = document.createElement('script');
    script.src = 'https://chat.launchlemonade.app/inline-voice/1763589993142x346823039676579840';
    script.async = true;
    
    const container = document.getElementById('lemonade-chat');
    
    if (container) {
      container.appendChild(script);
    }
    
    return () => {
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <section 
      id="chat" 
      className="max-w-4xl mx-auto px-4 py-8"
      aria-label="Chat with Roberto"
    >
      {/* Voice Chat Widget - Script injected here */}
      <div 
        id="lemonade-chat"
        className="w-full min-h-[60vh]"
        aria-label="Voice chat with Roberto"
      />
    </section>
  );
};

export default ChatInterface;
