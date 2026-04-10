import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Header from '@/components/Header'

const howItWorksItems = [
  {
    title: "Talk to Roberto",
    content: "Every fortnight, Roberto gets briefed on a new topic — and he has a lot of feelings about it and many questions. You'll explore it with him before anything happens in real life, so by the time you walk into an event, you've already had the conversation once. Just with someone who technically doesn't exist. Shh, don't say that too loud."
  },
  {
    title: "Come to the event",
    content: "Real humans, real room, real Spanish. Roberto can't come (he's been asked not to), but the topic you've been practising with him will be there."
  },
  {
    title: "The topic cycle",
    content: "Topics rotate every fortnight. Patreon members get to vote on what comes next — which is the closest thing Roberto has to democracy. He'll go with whatever you decide. He just wants to be included."
  },
  {
    title: "Who it's for",
    content: "Intermediate Spanish speakers in London who understand the language but freeze the moment they actually have to use it. You're not a beginner. You're just a bit scared. Roberto gets it. He's scared too, honestly."
  }
]

const topics = [
  {
    name: "Nightlife",
    nameEs: "La vida nocturna",
    questions: [
      { en: "Do you like to go out at night?", es: "¿Te gusta salir de noche?" },
      { en: "What do you like to do when you're out?", es: "¿Qué te gusta hacer cuando sales?" },
      { en: "What are your favourite places to go to?", es: "¿Cuáles son tus lugares favoritos para salir?" },
      { en: "What time do you think clubs and other venues should stay open until?", es: "¿Hasta qué hora crees que deberían estar abiertos los bares y discotecas?" },
      { en: "Do you prefer the mornings? What do you do in the morning?", es: "¿Prefieres las mañanas? ¿Qué haces por la mañana?" }
    ]
  },
  {
    name: "Neighbourhoods",
    nameEs: "Los barrios",
    questions: [
      { en: "Whereabouts do you live? Do you like it there?", es: "¿Por qué zona vives? ¿Te gusta?" },
      { en: "Do you leave your neighbourhood often, or do you prefer to stay close to home when you can?", es: "¿Sales mucho de tu barrio o prefieres quedarte cerca de casa cuando puedes?" },
      { en: "Does your neighbourhood have any issues that you wish were better?", es: "¿Tu barrio tiene algún problema que desearías que fuera diferente?" },
      { en: "What is your favourite part of London?", es: "¿Cuál es tu parte favorita de Londres?" },
      { en: "If you're not from London, is there a part of the city or place you come from that more people need to know about?", es: "Si no eres de Londres, ¿hay algún lugar de donde vienes que crees que más gente debería conocer?" }
    ]
  },
  {
    name: "Work Life",
    nameEs: "La vida laboral",
    questions: [
      { en: "What do you do for work?", es: "¿A qué te dedicas?" },
      { en: "Do you love what you do?", es: "¿Amas lo que haces?" },
      { en: "What drives you to work? Is it money, passion, something else?", es: "¿Qué te motiva a trabajar? ¿El dinero, la pasión por lo que haces? ¿Otra cosa?" },
      { en: "Do you feel like you have good work-life balance? Is that something you value?", es: "¿Sientes que tienes un buen equilibrio entre el trabajo y la vida personal? ¿Es algo que valoras?" },
      { en: "How did you come to do what you're doing? What steps did you take to get there?", es: "¿Cómo llegaste a hacer lo que haces? ¿Qué pasos seguiste para llegar ahí?" }
    ]
  },
  {
    name: "Food",
    nameEs: "La comida",
    questions: [
      { en: "Where do you actually eat on a weeknight — do you cook, or does London make that feel impossible?", es: "¿Qué comes en una noche entre semana? ¿Cocinas o sientes que Londres hace eso casi imposible?" },
      { en: "What does a proper meal mean to you? Is it about the food, the people, or both?", es: "¿Qué significa para ti una buena comida? ¿Es la comida, la gente o las dos cosas?" },
      { en: "What's the best thing you've eaten in London, and where was it?", es: "¿Cuál es lo mejor que has comido en Londres y dónde fue?" },
      { en: "Do you think London has good food culture, or is it all hype?", es: "¿Crees que Londres tiene una buena cultura gastronómica o es todo hype?" },
      { en: "Is there a dish or a place from where you grew up that you think more people here need to know about?", es: "¿Hay algún plato o lugar de donde creciste que crees que más gente aquí debería conocer?" }
    ]
  }
]

export default function HowItWorks() {
  const [openSection, setOpenSection] = useState<number | null>(null)
  const [openTopic, setOpenTopic] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <h1 className="hand-drawn text-4xl text-center mb-14 text-foreground">
          How it works
        </h1>

        {/* How It Works accordion */}
        <section className="mb-20">
          {howItWorksItems.map((item, index) => (
            <div key={index} className="border-b border-border">
              <button
                className="w-full flex justify-between items-center py-5 text-left"
                onClick={() => setOpenSection(openSection === index ? null : index)}
              >
                <span className="hand-drawn text-xl text-foreground">{item.title}</span>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform duration-200 ${
                    openSection === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSection === index && (
                <p className="pb-5 text-muted-foreground leading-relaxed text-sm">
                  {item.content}
                </p>
              )}
            </div>
          ))}
        </section>

        {/* Topics section */}
        <section>
          <h2 className="hand-drawn text-3xl text-center mb-8 text-foreground">
            The topics
          </h2>
          <div className="mb-10 space-y-4 text-muted-foreground leading-relaxed text-sm">
            <p>
              Every fortnight, Roberto will introduce a new topic — something you'll explore
              in conversation with him before bringing it into the real world.
            </p>
            <p>
              When our in-person meetups begin, these are the topics that will fill the room.
              Your conversations with Roberto will have already warmed you up — so when you
              walk in, you'll have something to say, and someone worth saying it to.
            </p>
            <p>
              These topics are meant to make for engaging conversation — setting you up to
              actually connect with other people and really get something out of the
              conversation, beyond improving your Spanish.
            </p>
            <p className="font-medium text-foreground">
              Here are the topics that will be covered in the next eight weeks:
            </p>
          </div>

          {topics.map((topic, index) => (
            <div key={index} className="border-b border-border">
              <button
                className="w-full flex justify-between items-center py-5 text-left"
                onClick={() => setOpenTopic(openTopic === index ? null : index)}
              >
                <div className="flex items-baseline gap-3">
                  <span className="hand-drawn text-xl text-foreground">{topic.name}</span>
                  <span className="text-muted-foreground italic text-sm">{topic.nameEs}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform duration-200 ${
                    openTopic === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openTopic === index && (
                <div className="pb-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left pb-3 pr-6 text-muted-foreground font-normal w-1/2">
                          English
                        </th>
                        <th className="text-left pb-3 text-muted-foreground font-normal w-1/2">
                          Español
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topic.questions.map((q, qi) => (
                        <tr key={qi} className="border-t border-border/50">
                          <td className="py-2 pr-6 text-foreground align-top leading-relaxed">
                            {q.en}
                          </td>
                          <td className="py-2 text-muted-foreground align-top leading-relaxed">
                            {q.es}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
