import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import ChatInterface from "@/components/ChatInterface";
import InstallPrompt from "@/components/InstallPrompt";
import { NEXT_EVENT_URL } from "@/lib/nextEvent";

const Index = () => {
  return (
    <div>
      <InstallPrompt />
      <Header />

      <main role="main" className="w-[calc(100%-2rem)] max-w-4xl mx-auto my-6 space-y-6">
        {/* Temporary (added 2026-11-08): on iPhones the mic stops working after
            Roberto's first reply. Remove once the mic fix is live. */}
        <div role="status" className="bg-secondary border-2 border-foreground rounded-2xl px-4 py-3 text-center text-sm text-foreground">
          We're working on some settings that help Roberto work better on mobile. For now, it's best if you speak to him on a laptop.
        </div>
        <div className="panel">
          <IntroSection />
        </div>
        <ChatInterface />
      </main>

      <footer className="bg-background border-t-2 border-foreground mt-4 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <a
            href={NEXT_EVENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-4 bg-accent text-foreground border-2 border-foreground rounded-2xl px-6 py-2 font-daniel font-bold text-lg hover:scale-105 transition-transform"
          >
            Come to the next event
          </a>
          <p className="text-sm text-muted-foreground">
            Practice makes progress. Don't leave me!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
