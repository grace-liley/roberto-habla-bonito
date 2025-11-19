import { useEffect } from "react";

// Declare potential global objects from Launch Lemonade
declare global {
  interface Window {
    LaunchLemonade?: any;
    lemonade?: any;
    initLemonadeWidget?: any;
  }
}

const ChatInterface = () => {
  useEffect(() => {
    // Try multiple initialization approaches
    const initWidget = () => {
      console.log("Attempting to initialize Launch Lemonade widget...");
      
      // Approach 1: Check for LaunchLemonade global object
      if (window.LaunchLemonade) {
        console.log("Found window.LaunchLemonade, attempting init...");
        if (typeof window.LaunchLemonade.init === 'function') {
          window.LaunchLemonade.init({ containerId: 'lemonade-chat' });
        } else if (typeof window.LaunchLemonade.render === 'function') {
          window.LaunchLemonade.render('lemonade-chat');
        }
      }
      
      // Approach 2: Check for lemonade global object
      if (window.lemonade) {
        console.log("Found window.lemonade, attempting render...");
        if (typeof window.lemonade.render === 'function') {
          window.lemonade.render('lemonade-chat');
        } else if (typeof window.lemonade.init === 'function') {
          window.lemonade.init('lemonade-chat');
        }
      }
      
      // Approach 3: Check for standalone init function
      if (window.initLemonadeWidget) {
        console.log("Found window.initLemonadeWidget, attempting call...");
        window.initLemonadeWidget('lemonade-chat');
      }
      
      // Log what's available
      console.log("Window.LaunchLemonade:", window.LaunchLemonade);
      console.log("Window.lemonade:", window.lemonade);
      console.log("Window.initLemonadeWidget:", window.initLemonadeWidget);
    };

    // Try immediately
    initWidget();

    // Try again after delays in case script is still loading
    const timer1 = setTimeout(initWidget, 500);
    const timer2 = setTimeout(initWidget, 1500);
    const timer3 = setTimeout(initWidget, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <section 
      id="chat" 
      className="max-w-4xl mx-auto px-4 py-8"
      aria-label="Chat with Roberto"
    >
      {/* Voice Chat Widget Container with data attributes */}
      <div 
        id="lemonade-chat"
        data-lemonade-widget="inline-voice"
        data-widget-id="1763589993142x346823039676579840"
        data-lemonade-type="inline"
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
