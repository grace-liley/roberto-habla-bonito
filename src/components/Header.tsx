import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="hand-drawn text-2xl md:text-3xl text-foreground">
          Roberto
          <span className="block text-base md:text-lg text-muted-foreground">Spanish Tutor</span>
        </h1>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="touch-target hover:bg-accent/10"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" strokeWidth={2.5} />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="hand-drawn text-2xl">Menu</SheetTitle>
              <SheetDescription>
                Learn Spanish with Roberto
              </SheetDescription>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4" role="navigation" aria-label="Main navigation">
              <Link 
                to="/about" 
                className="text-lg hover:text-accent transition-colors py-2"
              >
                About Roberto
              </Link>
              <a 
                href="/#chat" 
                className="text-lg hover:text-accent transition-colors py-2"
              >
                Start Chatting
              </a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
