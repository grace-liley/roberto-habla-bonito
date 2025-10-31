import Header from "@/components/Header";
import IntroSection from "@/components/IntroSection";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main role="main">
        <IntroSection />
        <ChatInterface />
      </main>
      
      <footer className="border-t border-border mt-16 py-8">
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
