const IntroSection = () => {
  return <section id="about" className="max-w-4xl mx-auto px-4 py-12 md:py-16" aria-label="About Roberto">
      <div className="text-center space-y-6">
        <h2 className="hand-drawn text-3xl md:text-4xl lg:text-5xl text-foreground">
          Meet Roberto
        </h2>
        
        <div className="w-16 h-1 bg-accent mx-auto rounded-full" aria-hidden="true" />
        
        <div className="max-w-2xl mx-auto space-y-4 text-base md:text-lg leading-relaxed">
          <p>¡Hola! I'm Roberto, your patient Spanish friend who has nobody else to talk to. Ready to chat for forever or 30 seconds. Take as long as you need to answer, ask me to repeat what I said (everything I say is also in writing, which helps), I've got all the time in the world for you. </p>
          
          <p>Just so you know - I can speak five words in English at a time. If you really need something translated, I can give you some basic help, hablo un poco inglese! </p>
          
          <p className="text-accent font-semibold">Está trabajando en usted español, and I am working on myself. If you have any feedback, please let Grace know and she'll pass it on to me. I won't take it well if you say it to my face.</p>
        </div>
      </div>
    </section>;
};
export default IntroSection;