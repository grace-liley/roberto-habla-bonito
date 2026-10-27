import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import ChatInterface from "@/components/ChatInterface";
import InstallPrompt from "@/components/InstallPrompt";

const Index = () => {
  return (
    <div>
      <InstallPrompt />
      <Header />

      <main role="main" className="w-[calc(100%-2rem)] max-w-4xl mx-auto my-6 space-y-6">
        <div className="panel">
          <IntroSection />
        </div>
        <ChatInterface />
      </main>

      <footer className="bg-background border-t-2 border-foreground mt-4 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Practice makes progress. Don't leave me!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
