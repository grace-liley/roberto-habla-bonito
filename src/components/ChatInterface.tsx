const ChatInterface = () => {
  return (
    <section 
      id="chat" 
      className="max-w-4xl mx-auto px-4 py-8"
      aria-label="Chat with Roberto"
    >
      {/* Voice Chat Widget Container - trying multiple IDs for Launch Lemonade */}
      <div 
        id="lemonade-chat"
        className="w-full min-h-[60vh] flex items-center justify-center"
        aria-label="Voice chat with Roberto"
      >
        <p className="text-center text-muted-foreground">
          Loading voice chat widget...
        </p>
      </div>
    </section>
  );
};

export default ChatInterface;
