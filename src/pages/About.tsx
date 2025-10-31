import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import robertoAvatar from "@/assets/roberto-avatar.png";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main role="main" className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Section 1: Meet Roberto */}
        <section className="mb-16">
          <h1 className="hand-drawn text-3xl md:text-4xl lg:text-5xl text-foreground text-center mb-6">
            Meet Roberto
          </h1>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full mb-8" aria-hidden="true" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <img 
                src={robertoAvatar} 
                alt="Roberto the Spanish tutor" 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
              />
            </div>
            
            <div className="space-y-4 text-base md:text-lg leading-relaxed">
              <p>
                ¡Hola! I'm Roberto, your patient Spanish friend who has nobody else to talk to. 
                Ready to chat for forever or 30 seconds. Take as long as you need to answer, 
                ask me to repeat what I said (everything I say is also in writing, which helps), 
                I've got all the time in the world for you.
              </p>
              
              <p>
                Just so you know - I can speak five words in English at a time. 
                If you really need something translated, I can give you some basic help, 
                hablo un poco inglese!
              </p>
              
              <p className="text-accent font-semibold">
                Está trabajando en usted español, and I am working on myself. 
                If you have any feedback, please let Grace know and she'll pass it on to me. 
                I won't take it well if you say it to my face.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Things to Know Before You Chat */}
        <section className="mb-16">
          <h2 className="hand-drawn text-3xl md:text-4xl lg:text-5xl text-foreground text-center mb-6">
            Things to Know Before You Chat
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full mb-8" aria-hidden="true" />
          
          <ul className="space-y-4 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">•</span>
              <span>Roberto speaks primarily in Spanish to create an immersive learning experience</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">•</span>
              <span>He can translate up to 5 English words at a time if you get stuck</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">•</span>
              <span>Take your time - there's no pressure to respond quickly</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">•</span>
              <span>Everything Roberto says is also written down so you can read along</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">•</span>
              <span>You can ask for repetition or clarification anytime</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">•</span>
              <span>Mistakes are part of learning - Roberto never judges</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold flex-shrink-0">•</span>
              <span>Voice input feature coming soon (currently text-based)</span>
            </li>
          </ul>
        </section>

        {/* Section 3: FAQ */}
        <section className="mb-16">
          <h2 className="hand-drawn text-3xl md:text-4xl lg:text-5xl text-foreground text-center mb-6">
            Preguntas Frecuentes
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full mb-8" aria-hidden="true" />
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                What level of Spanish do I need?
              </h3>
              <p className="text-muted-foreground">
                You need to be able to speak and understand Spanish to the level of a toddler - around an A2 or B1. Yes, Roberto will still push you (he has to, he doesn't really speak English, but he is still desperate to be your friend). You're going to be in the deep end, where you need to be!
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                How does Roberto help me learn?
              </h3>
              <p className="text-muted-foreground">
                Through conversational practise with a patient, always-available friend. Roberto probably isn't all you need (although he wishes he was) - you'll need to look up words he mentions, you might need some lessons on the side to help you learn verbs, gender agreement and tenses. But he'll be able to get a sense of what you're saying to him. Pretend he's the only person in the world you can talk to and don't give up.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                Can Roberto translate everything for me?
              </h3>
              <p className="text-muted-foreground">
                He'll help with basic words (5 words maximum at a time), but immersion is the goal. 
                The more you try to communicate in Spanish, the faster you'll learn!
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                What if I don't understand something?
              </h3>
              <p className="text-muted-foreground">
                Just ask! Roberto will repeat, rephrase, or explain it differently. 
                There's no such thing as asking too many questions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                Does Roberto get impatient or frustrated?
              </h3>
              <p className="text-muted-foreground">
                Never! He literally has nothing else to do but chat with you. 
                Take all the time you need - he's genuinely happy to be here.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                How do I give feedback or report issues?
              </h3>
              <p className="text-muted-foreground">
                Please get in touch with Grace. Roberto's just doing his best and he doesn't need to hear criticism from someone who barely knows him.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Button */}
        <div className="text-center">
          <Link to="/">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6 h-auto"
            >
              Start Chatting with Roberto
            </Button>
          </Link>
        </div>
      </main>
      
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Practice makes progress. Keep learning with Roberto!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
