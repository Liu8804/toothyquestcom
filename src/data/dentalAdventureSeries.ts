// Dental Adventure Mini-Series - "What Happens at the Dentist?" Episodes
// Target age: 4-7 | Tone: friendly, calm, playful, adventurous

import type { Story } from './stories';

// Dental Tool Characters for interactive experiences
export interface DentalToolCharacter {
  id: string;
  name: string;
  nameEs: string;
  emoji: string;
  personality: string;
  personalityEs: string;
  introduction: string;
  introductionEs: string;
  color: string;
}

export const DENTAL_TOOL_CHARACTERS: DentalToolCharacter[] = [
  {
    id: "mr-mirror",
    name: "Mr. Mirror",
    nameEs: "Sr. Espejo",
    emoji: "🪞",
    personality: "Curious, gentle",
    personalityEs: "Curioso, gentil",
    introduction: "I help the dentist see your shiny smile!",
    introductionEs: "¡Ayudo al dentista a ver tu sonrisa brillante!",
    color: "from-sky-400 to-blue-500",
  },
  {
    id: "bubbles-air",
    name: "Bubbles the Air Sprayer",
    nameEs: "Burbujas el Rociador",
    emoji: "💨",
    personality: "Silly, playful",
    personalityEs: "Tontito, juguetón",
    introduction: "Pfffft! Just drying teeth with air!",
    introductionEs: "¡Pfffft! ¡Solo secando dientes con aire!",
    color: "from-cyan-400 to-teal-500",
  },
  {
    id: "sparkle-brush",
    name: "Sparkle Brush",
    nameEs: "Cepillo Brillante",
    emoji: "🪥",
    personality: "Cheerleader, encouraging",
    personalityEs: "Animador, alentador",
    introduction: "Let's make teeth sparkle like stars!",
    introductionEs: "¡Hagamos que los dientes brillen como estrellas!",
    color: "from-pink-400 to-rose-500",
  },
  {
    id: "water-sprout",
    name: "Water Sprout",
    nameEs: "Fuente de Agua",
    emoji: "💧",
    personality: "Calm, soothing",
    personalityEs: "Calmado, tranquilo",
    introduction: "Swish… rinse… all clean!",
    introductionEs: "¡Swish… enjuagar… todo limpio!",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "buzz-cleaner",
    name: "Buzz Cleaner",
    nameEs: "Limpiador Zumbador",
    emoji: "✨",
    personality: "Gentle, helpful",
    personalityEs: "Gentil, servicial",
    introduction: "I tickle away tiny bits gently — nothing scary here!",
    introductionEs: "¡Quito pedacitos con cosquillas suaves — nada de miedo!",
    color: "from-violet-400 to-purple-500",
  },
  {
    id: "suction-sally",
    name: "Suction Sally",
    nameEs: "Sally Succión",
    emoji: "🌀",
    personality: "Quick, friendly",
    personalityEs: "Rápida, amigable",
    introduction: "Slurp! I drink up all the extra water so you stay comfy!",
    introductionEs: "¡Slurp! ¡Bebo toda el agua extra para que estés cómodo!",
    color: "from-emerald-400 to-green-500",
  },
];

// Before Appointment Affirmations
export interface Affirmation {
  text: string;
  textEs: string;
  emoji: string;
}

export const PRE_APPOINTMENT_AFFIRMATIONS: Affirmation[] = [
  {
    text: "I am brave.",
    textEs: "Soy valiente.",
    emoji: "🦁",
  },
  {
    text: "I can ask questions.",
    textEs: "Puedo hacer preguntas.",
    emoji: "❓",
  },
  {
    text: "My dentist helps my smile.",
    textEs: "Mi dentista ayuda a mi sonrisa.",
    emoji: "😊",
  },
  {
    text: "I will try my best.",
    textEs: "Haré mi mejor esfuerzo.",
    emoji: "⭐",
  },
  {
    text: "It's okay to feel nervous.",
    textEs: "Está bien sentir nervios.",
    emoji: "💚",
  },
];

// Post-Appointment Celebration Steps
export interface CelebrationStep {
  id: string;
  question: string;
  questionEs: string;
  emoji: string;
}

export const POST_APPOINTMENT_STEPS: CelebrationStep[] = [
  {
    id: "sat-in-chair",
    question: "Did you sit in the magic chair?",
    questionEs: "¿Te sentaste en la silla mágica?",
    emoji: "🪑",
  },
  {
    id: "opened-mouth",
    question: "Did you open your mouth wide?",
    questionEs: "¿Abriste la boca bien grande?",
    emoji: "😮",
  },
  {
    id: "counted-teeth",
    question: "Did the dentist count your teeth?",
    questionEs: "¿El dentista contó tus dientes?",
    emoji: "🔢",
  },
  {
    id: "stayed-still",
    question: "Did you stay nice and still?",
    questionEs: "¿Te quedaste quieto?",
    emoji: "🧘",
  },
];

// Series-specific badges
export interface SeriesBadge {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  emoji: string;
  requirement: string;
}

export const DENTAL_ADVENTURE_BADGES: SeriesBadge[] = [
  {
    id: "brave-explorer",
    name: "Brave Explorer",
    nameEs: "Explorador Valiente",
    description: "Completed the 'Welcome to Dental Castle' episode",
    descriptionEs: "Completó el episodio 'Bienvenido al Castillo Dental'",
    emoji: "🦁",
    requirement: "dental-castle-welcome",
  },
  {
    id: "sparkle-smile",
    name: "Sparkle Smile",
    nameEs: "Sonrisa Brillante",
    description: "Completed the 'Counting & Cleaning' episode",
    descriptionEs: "Completó el episodio 'Contando y Limpiando'",
    emoji: "🪥",
    requirement: "counting-cleaning",
  },
  {
    id: "dental-castle-hero",
    name: "Dental Castle Hero",
    nameEs: "Héroe del Castillo Dental",
    description: "Completed all 4 episodes of the mini-series",
    descriptionEs: "Completó los 4 episodios de la mini-serie",
    emoji: "🏰",
    requirement: "mission-complete-celebration",
  },
  {
    id: "fear-free-champion",
    name: "Fear-Free Champion",
    nameEs: "Campeón Sin Miedo",
    description: "Completed the 'After Your Appointment' celebration",
    descriptionEs: "Completó la celebración 'Después de tu Cita'",
    emoji: "⭐",
    requirement: "after-appointment-celebration",
  },
  {
    id: "tool-friend",
    name: "Tool Friend",
    nameEs: "Amigo de las Herramientas",
    description: "Met all the friendly dental tools",
    descriptionEs: "Conoció todas las herramientas dentales amigables",
    emoji: "🛠️",
    requirement: "meet-dental-tools",
  },
];

// Mini-Series Episodes (Stories)
export const DENTAL_ADVENTURE_STORIES: Story[] = [
  // Episode 1: Welcome to the Dental Castle
  {
    id: "dental-castle-welcome",
    title: "Episode 1 – Welcome to the Dental Castle",
    toothyIntro: "Welcome, Explorer! Today you're visiting a very special place!",
    story: "Welcome, brave Explorer! Today you're visiting the Dental Castle, where friendly helpers keep teeth strong and shiny! The waiting room is like a fun game room with toys and books. The dentist is a tooth hero who wears a cool cape (okay, it's a coat, but it's just as cool!). And the chair? It's a magic chair that goes up and down like a spaceship! \"Nothing happens without me telling you first,\" smiled the tooth hero. \"We're a team!\"",
    lesson: "The dentist is a helper, not scary! Nothing happens without explanation.",
    questEnding: "You've discovered the Dental Castle!",
    illustrationPath: "/stories/friendly-dentist.png",
    emoji: "🏰",
    isFree: true,
    quiz: {
      question: "What is the dentist? 🦷✨",
      options: ["A TOOTH HERO! 🦸", "A scary monster 👾", "Just someone in a coat 🧥"],
      correctIndex: 0,
      hint: "YAY! The dentist is a TOOTH HERO who helps your smile! 🎉🦷✨",
      parentTip: "Before the appointment, role-play 'dentist' at home. Let your child be the dentist first, checking your teeth. This builds familiarity.",
    },
    quiz2: {
      question: "What's the waiting room like?",
      options: ["A FUN game room! 🎮", "A dark dungeon 🕸️", "A boring place 😴"],
      correctIndex: 0,
      hint: "AWESOME! The waiting room has toys and books! It's actually fun! 🎉📚🧸",
      parentTip: "Arrive early so your child can explore the waiting room calmly. Familiarity reduces anxiety.",
    },
  },
  // Episode 2: The Magic Chair Ride
  {
    id: "magic-chair-ride",
    title: "Episode 2 – The Magic Chair Ride",
    toothyIntro: "This special chair has superpowers! Ready to see?",
    story: "\"Hop on!\" said the tooth hero. The dental chair looked like a spaceship captain's seat! With a push of a button, the chair went UP! \"We're taking off!\" Then it went DOWN. \"Landing safely!\" The chair could even lean back so the tooth hero could see all the teeth. \"You're in control,\" the hero said. \"Just say 'stop' anytime!\" The explorer giggled — this was actually fun!",
    lesson: "The chair movement is fun and YOU are in control!",
    questEnding: "You've mastered the magic chair!",
    illustrationPath: "/stories/explore-office-tour.png",
    emoji: "🪑",
    isFree: false,
    quiz: {
      question: "What does the magic chair do? 🪑✨",
      options: ["Goes UP and DOWN! 🚀", "Runs away 🏃", "Nothing at all 😐"],
      correctIndex: 0,
      hint: "WHEEE! Up and down like a spaceship! 🚀✨ You're the captain! 👨‍🚀",
      parentTip: "If your child is nervous about the chair, ask the dentist to let them control the buttons. Autonomy reduces fear.",
    },
    quiz2: {
      question: "What can you say if you need a break?",
      options: ["STOP! ✋", "Nothing, just cry 😢", "Run away 🏃"],
      correctIndex: 0,
      hint: "YES! You can always say STOP and the hero will pause! You're in charge! ✋💪",
      parentTip: "Practice a 'stop signal' with your child — like raising a hand. The dentist will pause immediately.",
    },
  },
  // Episode 3: Counting & Cleaning Teeth
  {
    id: "counting-cleaning",
    title: "Episode 3 – Counting & Cleaning Teeth",
    toothyIntro: "Time for a gentle tooth adventure!",
    story: "\"Open wide!\" said the tooth hero gently. Mr. Mirror peeked inside to see all the teeth. \"One, two, three...\" the hero counted each tooth. \"You have beautiful teeth!\" Then came Sparkle Brush with a tickle-clean for each tooth. It felt like tiny butterflies! Water Sprout came next — swish, rinse, all clean! \"Amazing job staying still,\" the hero smiled. Every tooth sparkled like a star!",
    lesson: "Cleaning doesn't hurt — the dentist checks, not hurts!",
    questEnding: "Your teeth are counted and sparkling!",
    illustrationPath: "/stories/sparkle-shower.png",
    emoji: "🧼",
    isFree: false,
    quiz: {
      question: "Does the counting and cleaning hurt? 🦷",
      options: ["NO! It TICKLES! 🤭", "Yes, it's scary 😰", "Maybe a little 🤔"],
      correctIndex: 0,
      hint: "TICKLE TICKLE! 🤭 It's like tiny butterflies on your teeth! ✨🦋",
      parentTip: "Use the word 'tickle' instead of 'clean' when preparing your child. It reframes the experience positively.",
    },
    quiz2: {
      question: "Who helped see inside the mouth?",
      options: ["Mr. Mirror! 🪞", "A flashlight 🔦", "Magic glasses 👓"],
      correctIndex: 0,
      hint: "PEEK-A-BOO! 🪞 Mr. Mirror helps see your shiny smile! He's so curious and gentle! 💫",
      parentTip: "Let your child hold a small mirror during brushing at home. Familiarity with mirrors reduces dental anxiety.",
    },
  },
  // Episode 4: Mission Complete!
  {
    id: "mission-complete-celebration",
    title: "Episode 4 – Mission Complete!",
    toothyIntro: "You did something AMAZING today!",
    story: "\"You did it, Explorer!\" cheered the tooth hero. Confetti rained down (well, in our imagination!). \"Your smile is stronger than ever!\" A golden badge appeared — the Brave Explorer badge! All the dental tools clapped and cheered: Mr. Mirror twinkled, Sparkle Brush did a happy dance, and Water Sprout made rainbow splashes. \"You were so brave,\" the hero said. \"See you next time for another adventure!\"",
    lesson: "Dental visits make you STRONGER, not scared!",
    questEnding: "You're a true Dental Castle Hero!",
    illustrationPath: "/stories/moonlight-parade.png",
    emoji: "🎉",
    isFree: false,
    quiz: {
      question: "What badge did you earn? 🏆",
      options: ["BRAVE EXPLORER! 🦁", "Scared cat 🐱", "Just a visitor 🚶"],
      correctIndex: 0,
      hint: "ROAR! 🦁 You're a BRAVE EXPLORER! The bravest of them all! 🎉👑",
      parentTip: "Create a physical 'Brave Explorer' certificate after the real appointment. Tangible rewards reinforce positive memories.",
    },
    quiz2: {
      question: "How do you feel after your adventure?",
      options: ["PROUD and HAPPY! 🌟", "Sad 😢", "Nothing special 😐"],
      correctIndex: 0,
      hint: "SO PROUD! 🌟 You did AMAZING! Your smile is a superhero smile now! 💪😁",
      parentTip: "After the appointment, celebrate with a special activity (not sugar!). Park visit, sticker shopping, or extra story time work great.",
    },
  },
  // Meet the Dental Tools (Interactive Story)
  {
    id: "meet-dental-tools",
    title: "Meet the Dental Tools",
    toothyIntro: "Let's meet some friendly helpers!",
    story: "The Dental Castle has amazing helpers! First, meet Mr. Mirror — he's curious and gentle, helping the dentist see your shiny smile. Next is Bubbles the Air Sprayer — silly and playful, going 'Pfffft!' to dry teeth with air! Sparkle Brush is the cheerleader, making teeth sparkle like stars! And Water Sprout is calm and soothing — swish, rinse, all clean! There's also Buzz Cleaner who tickles away tiny bits gently. They're all here to help, not scare!",
    lesson: "Dental tools are friendly helpers with fun personalities!",
    questEnding: "You've made friends with all the tools!",
    illustrationPath: "/stories/dentist-day.png",
    emoji: "🛠️",
    isFree: false,
    quiz: {
      question: "What does Mr. Mirror do? 🪞",
      options: ["Helps SEE your smile! 👀", "Makes loud noises 📢", "Nothing 🤷"],
      correctIndex: 0,
      hint: "PEEK! 👀 Mr. Mirror helps the tooth hero see your beautiful smile! 🪞✨",
      parentTip: "Name the tools when your child sees them at the dentist: 'Look, there's Mr. Mirror!' Personification reduces fear.",
    },
    quiz2: {
      question: "Is Buzz Cleaner scary?",
      options: ["NO! Just tickly! 🤭", "Yes, very scary 😱", "I don't know 🤔"],
      correctIndex: 0,
      hint: "TICKLE TICKLE! 🤭 Buzz Cleaner just tickles away tiny bits! Nothing scary! 💫",
      parentTip: "If your child is afraid of certain tools, ask the dentist to demonstrate on a stuffed animal first.",
    },
  },
  // Before Your Appointment - Guided Story
  {
    id: "before-appointment-calm",
    title: "Before Your Appointment",
    toothyIntro: "Tomorrow is your Tooth Quest Day! Let's get ready!",
    story: "Close your eyes and take a deep breath with me. In... and out... Good! Tomorrow you're going on an adventure. Remember: the dentist is a helper who keeps your smile healthy. The magic chair goes up and down — you're in control! The tools are friendly with fun names. If you feel nervous, that's okay! Just breathe and remember: you are BRAVE. Say with me: 'I am brave. I can ask questions. My dentist helps my smile.' Tomorrow is going to be great!",
    lesson: "Preparation and calm breathing help you feel ready!",
    questEnding: "You're ready for your Tooth Quest Day!",
    illustrationPath: "/stories/dreamland-adventure.png",
    emoji: "🌈",
    isFree: false,
    quiz: {
      question: "What should you do if you feel nervous? 💚",
      options: ["Breathe and remember you're BRAVE! 🦁", "Run away 🏃", "Cry really loud 😭"],
      correctIndex: 0,
      hint: "BREATHE! 🌬️ In and out... You are SO brave! Nervousness is okay! 💚🦁",
      parentTip: "Practice breathing exercises together: breathe in for 4 counts, hold for 4, out for 4. This activates the calming nervous system.",
    },
    quiz2: {
      question: "Who is the dentist?",
      options: ["A HELPER for my smile! 😊", "Someone scary 😨", "Just a person 🧍"],
      correctIndex: 0,
      hint: "YES! 😊 The dentist is YOUR HELPER! They want your smile to be healthy and happy! 🦷💕",
      parentTip: "Read this story the night before the appointment. Familiarity reduces fear of the unknown.",
    },
  },
  // After Your Appointment - Celebration Quest
  {
    id: "after-appointment-celebration",
    title: "After Your Appointment",
    toothyIntro: "Welcome back, HERO! Let's celebrate!",
    story: "You're BACK! Let's see what you accomplished today. Did you sit in the magic chair? ✅ Amazing! Did you open your mouth for the tooth hero? ✅ Incredible! Did you stay nice and still? ✅ You're a SUPERSTAR! Confetti rains down, stars sparkle, and all your teeth are doing a happy dance! You faced your adventure and came out a CHAMPION. Here's your special Certificate of Bravery — you earned it!",
    lesson: "Celebrating after the visit creates positive memories!",
    questEnding: "You're a certified Dental Castle Hero!",
    illustrationPath: "/stories/moonlight-parade.png",
    emoji: "🎊",
    isFree: false,
    quiz: {
      question: "What are you after your dental visit? 🌟",
      options: ["A HERO! 🦸", "Just okay 😐", "Scared 😰"],
      correctIndex: 0,
      hint: "HERO HERO HERO! 🦸✨ You faced your adventure and WON! 🏆🎉",
      parentTip: "Let your child tell YOU about their experience. Active recall of positive moments strengthens good memories.",
    },
    quiz2: {
      question: "What special thing did you earn?",
      options: ["Certificate of Bravery! 📜", "Nothing 🤷", "A scolding 😔"],
      correctIndex: 0,
      hint: "CERTIFICATE TIME! 📜🏆 You are OFFICIALLY brave! Frame it and show everyone! 🌟",
      parentTip: "Print a certificate (we have one!) and display it proudly. Tangible recognition reinforces the positive experience.",
    },
  },
];

// Spanish translations for the mini-series
export const DENTAL_ADVENTURE_STORIES_ES: Story[] = [
  // Episode 1: Bienvenido al Castillo Dental
  {
    id: "dental-castle-welcome",
    title: "Episodio 1 – Bienvenido al Castillo Dental",
    toothyIntro: "¡Bienvenido, Explorador! ¡Hoy visitarás un lugar muy especial!",
    story: "¡Bienvenido, valiente Explorador! Hoy visitarás el Castillo Dental, donde ayudantes amigables mantienen los dientes fuertes y brillantes. ¡La sala de espera es como una sala de juegos divertida con juguetes y libros! El dentista es un héroe dental que usa una capa genial (bueno, es una bata, ¡pero es igual de genial!). ¿Y la silla? ¡Es una silla mágica que sube y baja como una nave espacial! \"Nada pasa sin que yo te lo explique primero,\" sonrió el héroe dental. \"¡Somos un equipo!\"",
    lesson: "¡El dentista es un ayudante, no da miedo! Nada pasa sin explicación.",
    questEnding: "¡Has descubierto el Castillo Dental!",
    illustrationPath: "/stories/friendly-dentist.png",
    emoji: "🏰",
    isFree: true,
    quiz: {
      question: "¿Qué es el dentista? 🦷✨",
      options: ["¡Un HÉROE DENTAL! 🦸", "Un monstruo aterrador 👾", "Solo alguien con bata 🧥"],
      correctIndex: 0,
      hint: "¡SÍ! ¡El dentista es un HÉROE DENTAL que ayuda a tu sonrisa! 🎉🦷✨",
      parentTip: "Antes de la cita, jueguen al 'dentista' en casa. Deja que tu hijo sea el dentista primero. Esto crea familiaridad.",
    },
    quiz2: {
      question: "¿Cómo es la sala de espera?",
      options: ["¡Una sala de juegos DIVERTIDA! 🎮", "Un calabozo oscuro 🕸️", "Un lugar aburrido 😴"],
      correctIndex: 0,
      hint: "¡GENIAL! ¡La sala de espera tiene juguetes y libros! ¡Es divertida! 🎉📚🧸",
      parentTip: "Lleguen temprano para que tu hijo explore la sala de espera tranquilamente. La familiaridad reduce la ansiedad.",
    },
  },
  // Episode 2: El Paseo en la Silla Mágica
  {
    id: "magic-chair-ride",
    title: "Episodio 2 – El Paseo en la Silla Mágica",
    toothyIntro: "¡Esta silla especial tiene superpoderes! ¿Listo para ver?",
    story: "\"¡Sube!\" dijo el héroe dental. ¡La silla dental parecía el asiento de un capitán de nave espacial! Con un botón, la silla subió. \"¡Despegamos!\" Luego bajó. \"¡Aterrizaje seguro!\" La silla también podía reclinarse para que el héroe dental pudiera ver todos los dientes. \"Tú tienes el control,\" dijo el héroe. \"¡Solo di 'para' cuando quieras!\" El explorador se rió — ¡esto era divertido!",
    lesson: "¡El movimiento de la silla es divertido y TÚ tienes el control!",
    questEnding: "¡Has dominado la silla mágica!",
    illustrationPath: "/stories/explore-office-tour.png",
    emoji: "🪑",
    isFree: false,
    quiz: {
      question: "¿Qué hace la silla mágica? 🪑✨",
      options: ["¡SUBE y BAJA! 🚀", "Se escapa 🏃", "Nada 😐"],
      correctIndex: 0,
      hint: "¡WIIIII! ¡Sube y baja como una nave espacial! 🚀✨ ¡Tú eres el capitán! 👨‍🚀",
      parentTip: "Si tu hijo está nervioso por la silla, pide al dentista que lo deje controlar los botones. La autonomía reduce el miedo.",
    },
    quiz2: {
      question: "¿Qué puedes decir si necesitas un descanso?",
      options: ["¡PARA! ✋", "Nada, solo llorar 😢", "Escapar 🏃"],
      correctIndex: 0,
      hint: "¡SÍ! ¡Siempre puedes decir PARA y el héroe pausará! ¡Tú mandas! ✋💪",
      parentTip: "Practiquen una 'señal de stop' — como levantar la mano. El dentista pausará inmediatamente.",
    },
  },
  // Episode 3: Contando y Limpiando Dientes
  {
    id: "counting-cleaning",
    title: "Episodio 3 – Contando y Limpiando Dientes",
    toothyIntro: "¡Hora de una aventura dental suave!",
    story: "\"¡Abre grande!\" dijo el héroe dental suavemente. El Sr. Espejo miró adentro para ver todos los dientes. \"Uno, dos, tres...\" el héroe contó cada diente. \"¡Tienes dientes hermosos!\" Luego vino el Cepillo Brillante con cosquillas para cada diente. ¡Se sentía como mariposas pequeñitas! Después vino la Fuente de Agua — ¡swish, enjuagar, todo limpio! \"Increíble cómo te quedaste quieto,\" sonrió el héroe. ¡Cada diente brilló como una estrella!",
    lesson: "¡Limpiar no duele — el dentista revisa, no lastima!",
    questEnding: "¡Tus dientes están contados y brillando!",
    illustrationPath: "/stories/sparkle-shower.png",
    emoji: "🧼",
    isFree: false,
    quiz: {
      question: "¿Duele contar y limpiar? 🦷",
      options: ["¡NO! ¡Hace COSQUILLAS! 🤭", "Sí, da miedo 😰", "Tal vez un poco 🤔"],
      correctIndex: 0,
      hint: "¡COSQUILLAS COSQUILLAS! 🤭 ¡Es como maripositas en tus dientes! ✨🦋",
      parentTip: "Usa la palabra 'cosquillas' en lugar de 'limpiar' al preparar a tu hijo. Esto reenmarca la experiencia positivamente.",
    },
    quiz2: {
      question: "¿Quién ayudó a ver dentro de la boca?",
      options: ["¡Sr. Espejo! 🪞", "Una linterna 🔦", "Gafas mágicas 👓"],
      correctIndex: 0,
      hint: "¡CU-CÚ! 🪞 ¡El Sr. Espejo ayuda a ver tu sonrisa brillante! ¡Es curioso y gentil! 💫",
      parentTip: "Deja que tu hijo sostenga un espejito al cepillarse en casa. Familiaridad con espejos reduce la ansiedad dental.",
    },
  },
  // Episode 4: ¡Misión Cumplida!
  {
    id: "mission-complete-celebration",
    title: "Episodio 4 – ¡Misión Cumplida!",
    toothyIntro: "¡Hiciste algo INCREÍBLE hoy!",
    story: "\"¡Lo lograste, Explorador!\" celebró el héroe dental. ¡Llovió confeti (bueno, en nuestra imaginación!)! \"¡Tu sonrisa es más fuerte que nunca!\" Apareció una medalla dorada — ¡la medalla de Explorador Valiente! Todas las herramientas dentales aplaudieron: el Sr. Espejo brilló, el Cepillo Brillante bailó feliz, y la Fuente de Agua hizo arcoíris. \"Fuiste muy valiente,\" dijo el héroe. \"¡Nos vemos la próxima para otra aventura!\"",
    lesson: "¡Las visitas dentales te hacen MÁS FUERTE, no asustado!",
    questEnding: "¡Eres un verdadero Héroe del Castillo Dental!",
    illustrationPath: "/stories/moonlight-parade.png",
    emoji: "🎉",
    isFree: false,
    quiz: {
      question: "¿Qué medalla ganaste? 🏆",
      options: ["¡EXPLORADOR VALIENTE! 🦁", "Gato asustado 🐱", "Solo un visitante 🚶"],
      correctIndex: 0,
      hint: "¡ROAR! 🦁 ¡Eres un EXPLORADOR VALIENTE! ¡El más valiente! 🎉👑",
      parentTip: "Crea un certificado físico de 'Explorador Valiente' después de la cita real. Recompensas tangibles refuerzan memorias positivas.",
    },
    quiz2: {
      question: "¿Cómo te sientes después de tu aventura?",
      options: ["¡ORGULLOSO y FELIZ! 🌟", "Triste 😢", "Nada especial 😐"],
      correctIndex: 0,
      hint: "¡TAN ORGULLOSO! 🌟 ¡Lo hiciste INCREÍBLE! ¡Tu sonrisa es de superhéroe ahora! 💪😁",
      parentTip: "Después de la cita, celebren con una actividad especial (¡sin azúcar!). Visita al parque, comprar stickers, o más tiempo de cuentos funcionan bien.",
    },
  },
  // Conoce las Herramientas Dentales
  {
    id: "meet-dental-tools",
    title: "Conoce las Herramientas Dentales",
    toothyIntro: "¡Conozcamos a unos ayudantes amigables!",
    story: "¡El Castillo Dental tiene ayudantes increíbles! Primero, conoce al Sr. Espejo — es curioso y gentil, ayuda al dentista a ver tu sonrisa brillante. ¡Luego está Burbujas el Rociador — tontito y juguetón, haciendo 'Pfffft!' para secar dientes con aire! ¡El Cepillo Brillante es animador, haciendo dientes brillar como estrellas! Y la Fuente de Agua es calmada — ¡swish, enjuagar, todo limpio! También está el Limpiador Zumbador que quita pedacitos con cosquillas suaves. ¡Todos están aquí para ayudar, no asustar!",
    lesson: "¡Las herramientas dentales son ayudantes amigables con personalidades divertidas!",
    questEnding: "¡Has hecho amigos con todas las herramientas!",
    illustrationPath: "/stories/dentist-day.png",
    emoji: "🛠️",
    isFree: false,
    quiz: {
      question: "¿Qué hace el Sr. Espejo? 🪞",
      options: ["¡Ayuda a VER tu sonrisa! 👀", "Hace ruidos fuertes 📢", "Nada 🤷"],
      correctIndex: 0,
      hint: "¡MIRA! 👀 ¡El Sr. Espejo ayuda al héroe dental a ver tu hermosa sonrisa! 🪞✨",
      parentTip: "Nombra las herramientas cuando tu hijo las vea en el dentista: '¡Mira, ahí está el Sr. Espejo!' La personificación reduce el miedo.",
    },
    quiz2: {
      question: "¿El Limpiador Zumbador da miedo?",
      options: ["¡NO! ¡Solo cosquillas! 🤭", "Sí, mucho miedo 😱", "No sé 🤔"],
      correctIndex: 0,
      hint: "¡COSQUILLAS! 🤭 ¡El Limpiador Zumbador solo hace cosquillas suaves! ¡Nada de miedo! 💫",
      parentTip: "Si tu hijo tiene miedo de ciertas herramientas, pide al dentista que las demuestre primero en un peluche.",
    },
  },
  // Antes de tu Cita
  {
    id: "before-appointment-calm",
    title: "Antes de tu Cita",
    toothyIntro: "¡Mañana es tu Día de Aventura Dental! ¡Preparémonos!",
    story: "Cierra los ojos y respira profundo conmigo. Adentro... y afuera... ¡Bien! Mañana vas a una aventura. Recuerda: el dentista es un ayudante que mantiene tu sonrisa saludable. La silla mágica sube y baja — ¡tú tienes el control! Las herramientas son amigables con nombres divertidos. Si sientes nervios, ¡está bien! Solo respira y recuerda: eres VALIENTE. Repite conmigo: 'Soy valiente. Puedo hacer preguntas. Mi dentista ayuda a mi sonrisa.' ¡Mañana será genial!",
    lesson: "¡La preparación y respiración calmada te ayudan a estar listo!",
    questEnding: "¡Estás listo para tu Día de Aventura Dental!",
    illustrationPath: "/stories/dreamland-adventure.png",
    emoji: "🌈",
    isFree: false,
    quiz: {
      question: "¿Qué debes hacer si sientes nervios? 💚",
      options: ["¡Respirar y recordar que soy VALIENTE! 🦁", "Escapar 🏃", "Llorar muy fuerte 😭"],
      correctIndex: 0,
      hint: "¡RESPIRA! 🌬️ Adentro y afuera... ¡Eres MUY valiente! ¡Los nervios están bien! 💚🦁",
      parentTip: "Practiquen ejercicios de respiración juntos: inhala 4 tiempos, sostén 4, exhala 4. Esto activa el sistema nervioso calmante.",
    },
    quiz2: {
      question: "¿Quién es el dentista?",
      options: ["¡Un AYUDANTE para mi sonrisa! 😊", "Alguien aterrador 😨", "Solo una persona 🧍"],
      correctIndex: 0,
      hint: "¡SÍ! 😊 ¡El dentista es TU AYUDANTE! ¡Quieren que tu sonrisa sea saludable y feliz! 🦷💕",
      parentTip: "Lee esta historia la noche antes de la cita. La familiaridad reduce el miedo a lo desconocido.",
    },
  },
  // Después de tu Cita
  {
    id: "after-appointment-celebration",
    title: "Después de tu Cita",
    toothyIntro: "¡Bienvenido de vuelta, HÉROE! ¡Celebremos!",
    story: "¡REGRESASTE! Veamos qué lograste hoy. ¿Te sentaste en la silla mágica? ✅ ¡Increíble! ¿Abriste la boca para el héroe dental? ✅ ¡Asombroso! ¿Te quedaste quieto? ✅ ¡Eres una SUPERESTRELLA! ¡Llueve confeti, brillan estrellas, y todos tus dientes bailan felices! Enfrentaste tu aventura y saliste CAMPEÓN. ¡Aquí está tu Certificado de Valentía especial — te lo ganaste!",
    lesson: "¡Celebrar después de la visita crea memorias positivas!",
    questEnding: "¡Eres un Héroe del Castillo Dental certificado!",
    illustrationPath: "/stories/moonlight-parade.png",
    emoji: "🎊",
    isFree: false,
    quiz: {
      question: "¿Qué eres después de tu visita dental? 🌟",
      options: ["¡Un HÉROE! 🦸", "Solo normal 😐", "Asustado 😰"],
      correctIndex: 0,
      hint: "¡HÉROE HÉROE HÉROE! 🦸✨ ¡Enfrentaste tu aventura y GANASTE! 🏆🎉",
      parentTip: "Deja que tu hijo TE cuente sobre su experiencia. Recordar activamente momentos positivos fortalece buenas memorias.",
    },
    quiz2: {
      question: "¿Qué cosa especial ganaste?",
      options: ["¡Certificado de Valentía! 📜", "Nada 🤷", "Un regaño 😔"],
      correctIndex: 0,
      hint: "¡HORA DEL CERTIFICADO! 📜🏆 ¡Eres OFICIALMENTE valiente! ¡Enmárcalo y muéstralo a todos! 🌟",
      parentTip: "Imprime un certificado (¡tenemos uno!) y muéstralo orgullosamente. Reconocimiento tangible refuerza la experiencia positiva.",
    },
  },
];
