import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import Header from '@/components/Header'
import robertoAvatar from '@/assets/roberto-avatar.png'

type AccordionItem = { title: string; content: ReactNode }

const howItWorksItems: AccordionItem[] = [
  {
    title: "Chat with Roberto",
    content: "Every month, Roberto gets briefed on a new topic. He has a lot of feelings about it and many questions. You'll explore it with him before anything happens in real life, so by the time you walk into an event, you've already had the conversation a few times."
  },
  {
    title: "Come to the event",
    content: "In the end, language is for connection - with real humans! So come along, get some new perspectives and new friends. (Please note, there will be no event in December. After November, the next one will be January)."
  },
  {
    title: "The topic cycle",
    content: "Topics rotate every month. Previous event attendees get to decide what comes next, which is the closest thing Roberto has to democracy. He'll go with whatever you decide. He just wants to be included."
  },
  {
    title: "Who it's for",
    content: "Spanish learners in London who want to get better at listening and speaking, make all those verbs and vocab you've learnt really stick. You might also be a little bit scared. That's ok. We're all scared too."
  }
]

const faqItems: AccordionItem[] = [
  {
    title: "What level of Spanish do I need?",
    content: "You need to be able to speak and understand Spanish to the level of a toddler. You can conjugate a few verbs in present tense. Yes, Roberto will still push you (he has to, he doesn't really speak English, but he is still desperate to be your friend). You're going to be in the deep end, where you need to be!"
  },
  {
    title: "How does Roberto help me learn?",
    content: (
      <>
        <p>
          Through conversational practice with a patient, always-available friend. There's something about scrambling to find the words to get your message across that makes them stick. Plus, listening is hard! You need to practise! Try and avoid looking at the written responses sometimes.
        </p>
        <p>
          Roberto probably isn't all you need - although he wishes he was. You might need some lessons on the side to help you learn verbs, gender agreement and tenses. But he'll be able to get a sense of what you're saying to him. Pretend he's the only person in the world you can talk to and don't give up.
        </p>
      </>
    )
  },
  {
    title: "Can Roberto translate everything for me?",
    content: "He can speak 5 words in English at a time, if you ask him. The goal is immersion - you'll have to think for yourself most of the time, like you would if you were standing right in front of him, in a tiny town in Colombia."
  },
  {
    title: "What if I don't understand something?",
    content: "Just ask! Roberto will repeat, rephrase, or explain it differently. There's no such thing as asking too many questions."
  },
  {
    title: "Does Roberto get impatient or frustrated?",
    content: "Never! He literally has nothing else to do but chat with you. Take all the time you need - he's genuinely happy to be here."
  },
  {
    title: "How do I give feedback or report issues?",
    content: "Please get in touch with Grace. Roberto's just doing his best and he doesn't need to hear criticism from someone who barely knows him."
  },
  {
    title: "How do I get the password Roberto is asking for?",
    content: (
      <>
        Register for an event, or email{' '}
        <a href="mailto:hola@robertocon.me" className="underline underline-offset-2 decoration-accent decoration-2 hover:text-foreground">
          hola@robertocon.me
        </a>
      </>
    )
  }
]

const topics = [
  {
    name: "Neighbourhoods",
    nameEs: "Los barrios",
    questions: [
      { en: "Whereabouts do you live? Do you like it there?", es: "¿Por qué zona vives? ¿Te gusta?" },
      { en: "Do you leave your neighbourhood often, or do you prefer to stay close to home when you can?", es: "¿Sales mucho de tu barrio o prefieres quedarte cerca de casa cuando puedes?" },
      { en: "Does your neighbourhood have any issues that you wish were better?", es: "¿Tu barrio tiene algún problema que desearías que fuera diferente?" },
      { en: "What is your favourite part of London?", es: "¿Cuál es tu parte favorita de Londres?" },
      { en: "If you're not from London, is there a place you come from that more people need to know about?", es: "Si no eres de Londres, ¿hay algún lugar de donde vienes que más gente debería conocer?" },
      { en: "What is your favourite thing about your neighbourhood and what is your least favourite thing?", es: "¿Qué es lo que más te gusta de tu barrio y qué es lo que menos te gusta?" }
    ]
  },
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
    name: "Work Life",
    nameEs: "La vida laboral",
    questions: [
      { en: "What do you do for work?", es: "¿A qué te dedicas?" },
      { en: "Do you love what you do?", es: "¿Amas lo que haces?" },
      { en: "What drives you to work? Is it money, the mission, or something else?", es: "¿Qué te motiva a trabajar? ¿El dinero, la misión u otra cosa?" },
      { en: "Do you feel like you have good work-life balance? Is that something you value?", es: "¿Sientes que tienes un buen equilibrio entre el trabajo y la vida personal? ¿Es algo que valoras?" },
      { en: "How did you come to do what you're doing? What steps did you take to get there?", es: "¿Cómo llegaste a hacer lo que haces? ¿Qué pasos seguiste para llegar ahí?" }
    ]
  },
  {
    name: "Food",
    nameEs: "La comida",
    questions: [
      { en: "Where do you eat on week nights? Do you cook, or does London make that feel impossible?", es: "¿Dónde comes las noches entre semana? ¿Cocinas, o Londres hace que eso parezca imposible?" },
      { en: "What does a proper meal mean to you? Is it about the food, the people, or both?", es: "¿Qué significa para ti una buena comida? ¿Es la comida, la gente o las dos cosas?" },
      { en: "What's the best thing you've eaten in London, and where was it?", es: "¿Cuál es lo mejor que has comido en Londres y dónde fue?" },
      { en: "Do you think London food culture is missing anything?", es: "¿Crees que a la cultura gastronómica de Londres le falta algo?" },
      { en: "Is there a dish you had growing up, or where you're from, that more people need to know about?", es: "¿Hay algún plato de tu infancia, o de donde eres, que más gente debería conocer?" }
    ]
  }
]

function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      {items.map((item, index) => (
        <div key={index} className="border-b border-border">
          <button
            className="w-full flex justify-between items-center py-5 text-left"
            onClick={() => setOpen(open === index ? null : index)}
          >
            <span className="hand-drawn text-xl text-foreground">{item.title}</span>
            <ChevronDown
              size={18}
              className={`flex-shrink-0 ml-3 text-muted-foreground transition-transform duration-200 ${
                open === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {open === index && (
            <div className="pb-5 space-y-3 text-muted-foreground leading-relaxed text-sm">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </>
  )
}

export default function HowItWorks() {
  const [openTopic, setOpenTopic] = useState<number | null>(null)

  return (
    <div className="min-h-screen">
      <Header />

      <main role="main" className="w-[calc(100%-2rem)] max-w-2xl mx-auto my-6 space-y-6">
        {/* Meet Roberto (moved here from the old About page) */}
        <section className="panel px-6 py-12">
          <h1 className="hand-drawn text-4xl text-center mb-6 text-foreground">
            Meet Roberto
          </h1>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full mb-8" aria-hidden="true" />

          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <img
                src={robertoAvatar}
                alt="Roberto the Colombian tutor"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 border-foreground bg-secondary"
              />
            </div>

            <div className="space-y-4 text-base leading-relaxed">
              <p>
                ¡Hola! Soy Roberto, your patient Colombian friend who has nobody else to talk to.
                Ready to chat for forever or 30 seconds. Take as long as you need to answer,
                ask me to repeat what I said (everything I say is also in writing, which helps),
                I've got all the time in the world for you.
              </p>

              <p>
                Just so you know - I can speak five words in English at a time.
                If you really need something translated, I can give you some basic help,
                hablo un poco inglese!
              </p>

              <p className="text-foreground font-semibold">
                Está trabajando en tu español, and I am working on myself.
                If you have any feedback, please let Grace know and she'll pass it on to me.
                I won't take it well if you say it to my face.
              </p>
            </div>
          </div>
        </section>

        <div className="panel px-6 py-16">
          <h2 className="hand-drawn text-4xl text-center mb-14 text-foreground">
            How it works
          </h2>

          <section className="mb-20">
            <Accordion items={howItWorksItems} />
          </section>

          <section className="mb-20">
            <h2 className="hand-drawn text-3xl text-center mb-8 text-foreground">
              Preguntas frecuentes
            </h2>
            <Accordion items={faqItems} />
          </section>

          {/* Topics section */}
          <section>
            <h2 className="hand-drawn text-3xl text-center mb-8 text-foreground">
              The topics
            </h2>
            <div className="mb-10 space-y-4 text-muted-foreground leading-relaxed text-sm">
              <p>
                These topics and questions are meant to make for engaging conversation - setting
                you up to actually connect with other people and really get something out of the
                conversation, beyond improving your Spanish.
              </p>
              <p className="font-medium text-foreground">
                Here are the topics that are coming up next:
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
      </main>
    </div>
  )
}
