const IntroSection = () => {
  return (
    <section 
      id="about" 
      className="max-w-4xl mx-auto px-4 py-12 md:py-16"
      aria-label="About Roberto"
    >
      <div className="text-center space-y-6">
        <h2 className="hand-drawn text-3xl md:text-4xl lg:text-5xl text-foreground">
          Meet Roberto
        </h2>
        
        <div className="w-16 h-1 bg-accent mx-auto rounded-full" aria-hidden="true" />
        
        <div className="max-w-2xl mx-auto space-y-4 text-base md:text-lg leading-relaxed">
          <p>
            ¡Hola! I'm Roberto, your patient and friendly Spanish tutor. 
            I'm here to help you learn Spanish through natural conversation, 
            just like chatting with a friend.
          </p>
          
          <p>
            Whether you're a complete beginner or looking to improve your fluency, 
            I'll meet you where you are. We can practice grammar, vocabulary, 
            pronunciation, or just have a casual conversation in Spanish.
          </p>
          
          <p className="text-accent font-semibold">
            Don't worry about making mistakes—that's how we learn! 
            Let's start our Spanish journey together.
          </p>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
