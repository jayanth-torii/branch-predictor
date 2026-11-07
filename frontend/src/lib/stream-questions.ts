import type { Stream, StreamQuestion, StreamQuizResult } from "./types";

/**
 * STAGE 2 — stream-specific questions that DO have a correct answer.
 *
 * Rules for anything added here (see development-rules.md):
 *  - Exactly 15 questions per stream: THREE PU subjects × FIVE questions each.
 *    Ids are `<streamKey>-<subjectKey>-1` … `-5`, e.g. `pcm-phy-3`, `arts-pol-1`.
 *  - Subject split: PCM and PCMB → Physics, Chemistry, Mathematics.
 *    PCMC → Physics, Mathematics, Computer Science.
 *    Commerce → Accountancy, Business Studies, Economics.
 *    Arts/Humanities → History, Political Science, Economics.
 *  - PCMB is deliberately tested on the Physics/Chemistry/Maths core it shares
 *    with PCM. The course catalogue has no biology track, so quizzing that
 *    subject would promise a path the product cannot follow through on.
 *  - 4 options each, one `correctId`, every option carries an emoji. The answer
 *    key is spread roughly evenly across A/B/C/D within each stream.
 *  - Answerable by reasoning from the prompt, not by recalling a textbook line.
 *    Each one is anchored in something a PU student actually sees — a bus, a
 *    phone battery, a canteen bill, a monsoon, a cash book, an election.
 *  - `explanation` teaches and is shown whether the answer was right or wrong.
 *    Never scold, never imply the student is behind.
 *  - Nothing here feeds the interest profile or the course ranking.
 */

const PCM: StreamQuestion[] = [
  {
    id: "pcm-phy-1",
    stream: "PCM",
    subject: "Physics",
    kicker: "Everyday Physics",
    title: "Your bus brakes hard and everyone lurches forward. Why?",
    prompt: "The bus slowed down, but your body did not get the message as quickly.",
    options: [
      { id: "A", label: "Inertia — your body keeps moving", emoji: "🚌" },
      { id: "B", label: "Gravity pulled you forward", emoji: "🌍" },
      { id: "C", label: "The floor pushed you", emoji: "⬆️" },
      { id: "D", label: "Air pressure inside the bus", emoji: "💨" },
    ],
    correctId: "A",
    explanation:
      "Newton's first law. The brakes applied a force to the bus, not to you, so you carried on at the old speed until the seat in front stopped you.",
  },
  {
    id: "pcm-phy-2",
    stream: "PCM",
    subject: "Physics",
    kicker: "Sound & Light",
    title: "Lightning flashes, and the thunder arrives four seconds later. Why the delay?",
    prompt: "Both left the same cloud at the same moment.",
    options: [
      { id: "A", label: "Thunder actually starts later", emoji: "⏱️" },
      { id: "B", label: "Clouds hold the sound back", emoji: "☁️" },
      { id: "C", label: "Light travels far faster than sound", emoji: "⚡" },
      { id: "D", label: "Ears react slower than eyes", emoji: "👂" },
    ],
    correctId: "C",
    explanation:
      "Sound covers about 330 metres a second; light covers the same gap almost instantly. Counting the seconds and multiplying by roughly 330 gives you the distance to the strike.",
  },
  {
    id: "pcm-phy-3",
    stream: "PCM",
    subject: "Physics",
    kicker: "Heat At Home",
    title: "Dal cooks in 15 minutes in a pressure cooker but takes an hour in an open vessel. Why?",
    prompt: "The same stove, the same flame — only the lid is different.",
    options: [
      { id: "A", label: "Steam is hotter than flame", emoji: "🔥" },
      { id: "B", label: "Higher pressure raises water's boiling point", emoji: "🍲" },
      { id: "C", label: "The weight presses the dal soft", emoji: "⚖️" },
      { id: "D", label: "Less water means faster cooking", emoji: "💧" },
    ],
    correctId: "B",
    explanation:
      "Trapped steam raises the pressure, so water boils near 120 °C instead of 100 °C. Hotter water cooks faster, which is also why food takes longer to cook in the hills.",
  },
  {
    id: "pcm-phy-4",
    stream: "PCM",
    subject: "Physics",
    kicker: "Motion Sense",
    title: "You switch the ceiling fan off and it keeps turning for half a minute. Why?",
    prompt: "The current stopped instantly. The blades did not.",
    options: [
      { id: "A", label: "The blades store electricity", emoji: "🔋" },
      { id: "B", label: "Room air keeps pushing them", emoji: "💨" },
      { id: "C", label: "The regulator leaks current slowly", emoji: "🎛️" },
      { id: "D", label: "Momentum carries them until friction wins", emoji: "🌀" },
    ],
    correctId: "D",
    explanation:
      "A spinning body keeps spinning until something slows it. Friction at the bearings and drag from the air drain that energy gradually, so the fan coasts to a stop.",
  },
  {
    id: "pcm-phy-5",
    stream: "PCM",
    subject: "Physics",
    kicker: "Energy Trail",
    title: "Your charger brick is warm after an hour of charging. Where did that heat come from?",
    prompt: "Energy is never lost — it only changes form.",
    options: [
      { id: "A", label: "The battery is leaking", emoji: "🪫" },
      { id: "B", label: "Some electrical energy becomes heat", emoji: "🌡️" },
      { id: "C", label: "Heat is what charges the phone", emoji: "🔌" },
      { id: "D", label: "The wire is too short", emoji: "📏" },
    ],
    correctId: "B",
    explanation:
      "Resistance in the components converts part of the electrical energy into heat. No charger is 100% efficient, and that lost fraction is exactly what you feel.",
  },
  {
    id: "pcm-chem-1",
    stream: "PCM",
    subject: "Chemistry",
    kicker: "Kitchen Chemistry",
    title: "A cut apple on the plate turns brown in twenty minutes. What happened?",
    prompt: "Nothing was added to it. Something in the air got involved.",
    options: [
      { id: "A", label: "It lost water and dried", emoji: "💧" },
      { id: "B", label: "Light bleached the surface", emoji: "☀️" },
      { id: "C", label: "Oxygen in the air reacted with it", emoji: "🍎" },
      { id: "D", label: "Bacteria ate the sugar", emoji: "🦠" },
    ],
    correctId: "C",
    explanation:
      "Oxygen reacts with enzymes in the exposed flesh — plain oxidation. Lemon juice slows it because the acid interferes with that reaction.",
  },
  {
    id: "pcm-chem-2",
    stream: "PCM",
    subject: "Chemistry",
    kicker: "Acids & Bases",
    title: "A pinch of baking soda dropped into lemon juice fizzes furiously. What is the fizz?",
    prompt: "One ingredient is an acid, the other is a base.",
    options: [
      { id: "A", label: "Carbon dioxide from an acid-base reaction", emoji: "🫧" },
      { id: "B", label: "The soda melting in liquid", emoji: "🥄" },
      { id: "C", label: "The lemon juice boiling", emoji: "🔥" },
      { id: "D", label: "Air that was trapped in the powder", emoji: "💨" },
    ],
    correctId: "A",
    explanation:
      "Citric acid meets sodium bicarbonate and the reaction releases carbon dioxide gas. The same reaction is what makes cakes and idli batter rise.",
  },
  {
    id: "pcm-chem-3",
    stream: "PCM",
    subject: "Chemistry",
    kicker: "Corrosion",
    title: "An iron gate rusts within a year in coastal Mangaluru but lasts years in dry inland air. Why?",
    prompt: "Rusting needs two things from the surroundings, and the coast supplies both generously.",
    options: [
      { id: "A", label: "Sea air is colder", emoji: "❄️" },
      { id: "B", label: "Salt makes iron softer", emoji: "🧂" },
      { id: "C", label: "Coastal paint is thinner", emoji: "🖌️" },
      { id: "D", label: "Moist, salty air speeds up rusting", emoji: "🌊" },
    ],
    correctId: "D",
    explanation:
      "Rust forms when iron meets oxygen and water, and dissolved salt makes that reaction run much faster. Paint and grease work by keeping both away from the metal.",
  },
  {
    id: "pcm-chem-4",
    stream: "PCM",
    subject: "Chemistry",
    kicker: "Solutions",
    title: "Sugar vanishes in hot tea almost at once but sits at the bottom of cold tea. Why?",
    prompt: "The sugar and the tea are the same in both cups. Only the temperature changed.",
    options: [
      { id: "A", label: "Hot tea has more empty space", emoji: "🫖" },
      { id: "B", label: "Faster-moving particles mix it quicker", emoji: "🔥" },
      { id: "C", label: "Heat turns sugar into a liquid", emoji: "🍯" },
      { id: "D", label: "Cold tea is denser than sugar", emoji: "🧊" },
    ],
    correctId: "B",
    explanation:
      "Higher temperature means faster-moving molecules, so they knock sugar crystals apart and carry them away sooner. Stirring helps for the same reason.",
  },
  {
    id: "pcm-chem-5",
    stream: "PCM",
    subject: "Chemistry",
    kicker: "Combustion",
    title: "A gas stove burns with a clean blue flame; a candle burns yellow and leaves soot. Why?",
    prompt: "One flame is getting all the oxygen it needs. The other is not.",
    options: [
      { id: "A", label: "Cooking gas is naturally blue", emoji: "🔷" },
      { id: "B", label: "Wax contains no carbon", emoji: "🕯️" },
      { id: "C", label: "Blue means complete combustion; yellow means incomplete", emoji: "🔥" },
      { id: "D", label: "The candle flame is hotter", emoji: "🌡️" },
    ],
    correctId: "C",
    explanation:
      "The stove mixes air with the gas before it burns, so combustion is complete. A candle burns short of oxygen, leaving glowing carbon particles — the yellow light and the soot.",
  },
  {
    id: "pcm-math-1",
    stream: "PCM",
    subject: "Mathematics",
    kicker: "Percentage Sense",
    title: "A shop offers 20% off, then another 10% off the reduced price. Total discount?",
    prompt: "Two discounts applied one after the other, not added together.",
    options: [
      { id: "A", label: "30%", emoji: "➕" },
      { id: "B", label: "28%", emoji: "🎯" },
      { id: "C", label: "25%", emoji: "🤔" },
      { id: "D", label: "32%", emoji: "📉" },
    ],
    correctId: "B",
    explanation:
      "0.8 × 0.9 = 0.72, so you pay 72% and save 28%. Successive percentages multiply — they never simply add.",
  },
  {
    id: "pcm-math-2",
    stream: "PCM",
    subject: "Mathematics",
    kicker: "Geometry Eye",
    title: "A 12-inch pizza costs twice a 6-inch one. Are you getting twice the pizza?",
    prompt: "Area depends on the radius in a particular way.",
    options: [
      { id: "A", label: "Yes, exactly twice", emoji: "✌️" },
      { id: "B", label: "A little more than twice", emoji: "📈" },
      { id: "C", label: "Slightly less than twice", emoji: "📉" },
      { id: "D", label: "No, about four times as much", emoji: "🍕" },
    ],
    correctId: "D",
    explanation:
      "Area is πr², so doubling the diameter squares the factor: 2² = 4. The big pizza is the better deal whenever it costs less than four times the small one.",
  },
  {
    id: "pcm-math-3",
    stream: "PCM",
    subject: "Mathematics",
    kicker: "Pattern Logic",
    title: "2, 6, 12, 20, 30, … what comes next?",
    prompt: "Look at the gaps between the numbers, not the numbers themselves.",
    options: [
      { id: "A", label: "42", emoji: "🎯" },
      { id: "B", label: "38", emoji: "🔢" },
      { id: "C", label: "40", emoji: "✨" },
      { id: "D", label: "36", emoji: "🤷" },
    ],
    correctId: "A",
    explanation:
      "The gaps run 4, 6, 8, 10, so the next gap is 12 and the term is 42. Each term is also n(n+1), which is a quicker way to see it.",
  },
  {
    id: "pcm-math-4",
    stream: "PCM",
    subject: "Mathematics",
    kicker: "Applied Maths",
    title: "A phone drops from 100% to 80% in 30 minutes. At this rate, how long from full until 20%?",
    prompt: "Assume it keeps draining at the same steady rate.",
    options: [
      { id: "A", label: "About 1 hour", emoji: "🕐" },
      { id: "B", label: "About 90 minutes", emoji: "⏳" },
      { id: "C", label: "About 2 hours", emoji: "🔋" },
      { id: "D", label: "About 3 hours", emoji: "😴" },
    ],
    correctId: "C",
    explanation:
      "20% per 30 minutes is 40% per hour. Dropping 80 percentage points at that rate takes two hours — a straight-line rate question, the kind that hides inside most word problems.",
  },
  {
    id: "pcm-math-5",
    stream: "PCM",
    subject: "Mathematics",
    kicker: "Probability Instinct",
    title: "At the toss, a captain calls heads and wins four matches in a row. Chance of heads on the fifth toss?",
    prompt: "The coin has no memory of the first four tosses.",
    options: [
      { id: "A", label: "Still 1/2", emoji: "🪙" },
      { id: "B", label: "Higher than 1/2", emoji: "📈" },
      { id: "C", label: "Lower than 1/2", emoji: "📉" },
      { id: "D", label: "It has to be tails now", emoji: "🙅" },
    ],
    correctId: "A",
    explanation:
      "Each toss is independent, so the probability stays 1/2 every single time. Expecting a correction after a streak is the gambler's fallacy.",
  },
];

const PCMB: StreamQuestion[] = [
  {
    id: "pcmb-phy-1",
    stream: "PCMB",
    subject: "Physics",
    kicker: "Everyday Physics",
    title: "Your cold water bottle is wet on the outside on a humid day. Did it leak?",
    prompt: "The water on the outside did not come from inside.",
    options: [
      { id: "A", label: "Yes, plastic leaks when cold", emoji: "🧴" },
      { id: "B", label: "No — vapour in the air condensed on it", emoji: "💦" },
      { id: "C", label: "Yes, ice pushed water through", emoji: "🧊" },
      { id: "D", label: "Yes, air pressure forced it out", emoji: "🎈" },
    ],
    correctId: "B",
    explanation:
      "The cold surface cools nearby air below its dew point, so vapour already in the air turns to liquid on the bottle. Dry winter air gives much less of it.",
  },
  {
    id: "pcmb-phy-2",
    stream: "PCMB",
    subject: "Physics",
    kicker: "Heat Transfer",
    title: "Sweating in the afternoon sun actually cools you down. How?",
    prompt: "The cooling happens as the sweat disappears, not while it sits there.",
    options: [
      { id: "A", label: "Sweat blocks sunlight", emoji: "🛡️" },
      { id: "B", label: "Sweat leaves the body already cold", emoji: "❄️" },
      { id: "C", label: "Sweat thickens the air near the skin", emoji: "🌫️" },
      { id: "D", label: "Evaporating sweat carries heat away", emoji: "💨" },
    ],
    correctId: "D",
    explanation:
      "Turning liquid into vapour needs energy, and it takes that energy from your skin. A fan cools you by speeding up that evaporation, not by chilling the room.",
  },
  {
    id: "pcmb-phy-3",
    stream: "PCMB",
    subject: "Physics",
    kicker: "Circuits",
    title: "One bulb in a string of festival lights fails and the whole string goes dark. Wired how?",
    prompt: "The failure of one broke the path for all of them.",
    options: [
      { id: "A", label: "In series", emoji: "🔗" },
      { id: "B", label: "In parallel", emoji: "🪜" },
      { id: "C", label: "The plug failed", emoji: "🔌" },
      { id: "D", label: "All bulbs share one filament", emoji: "💡" },
    ],
    correctId: "A",
    explanation:
      "A series circuit is one single loop, so any break stops the current everywhere. House wiring uses parallel branches so one failed bulb does not take the room with it.",
  },
  {
    id: "pcmb-phy-4",
    stream: "PCMB",
    subject: "Physics",
    kicker: "Light Behaviour",
    title: "A straw in a glass of water looks snapped at the water line. What is going on?",
    prompt: "The straw is straight. The light coming from it is not.",
    options: [
      { id: "A", label: "Water magnifies the lower half", emoji: "🔍" },
      { id: "B", label: "The straw softens in water", emoji: "🥤" },
      { id: "C", label: "Light bends moving from water to air", emoji: "🌈" },
      { id: "D", label: "Your eyes are confused by colour", emoji: "👁️" },
    ],
    correctId: "C",
    explanation:
      "Light changes speed and direction at the boundary between two media — refraction. The same effect makes a coin in a bucket look shallower than it is.",
  },
  {
    id: "pcmb-phy-5",
    stream: "PCMB",
    subject: "Physics",
    kicker: "Materials",
    title: "Flyovers are built with small gaps between the concrete slabs. Why leave them?",
    prompt: "Something about the material changes between a May afternoon and a December night.",
    options: [
      { id: "A", label: "To allow for thermal expansion", emoji: "🌡️" },
      { id: "B", label: "To let rainwater drain", emoji: "🌧️" },
      { id: "C", label: "To save on material", emoji: "💰" },
      { id: "D", label: "To make the bridge lighter", emoji: "🪶" },
    ],
    correctId: "A",
    explanation:
      "Concrete and steel expand when heated. Without expansion joints the slabs push hard against each other and crack, so the gap is deliberate engineering.",
  },
  {
    id: "pcmb-chem-1",
    stream: "PCMB",
    subject: "Chemistry",
    kicker: "Gas Test",
    title: "You blow through a straw into clear lime water and it turns milky. What did your breath supply?",
    prompt: "Exhaled air carries much more of one gas than the air you took in.",
    options: [
      { id: "A", label: "Acid strong enough to dissolve the lime", emoji: "🍋" },
      { id: "B", label: "Water vapour that clouded the glass", emoji: "💧" },
      { id: "C", label: "Soap left in the glass", emoji: "🧼" },
      { id: "D", label: "Carbon dioxide, forming insoluble calcium carbonate", emoji: "🫧" },
    ],
    correctId: "D",
    explanation:
      "Carbon dioxide reacts with calcium hydroxide to make calcium carbonate, which does not dissolve — hence the milkiness. This is the standard school test for the gas.",
  },
  {
    id: "pcmb-chem-2",
    stream: "PCMB",
    subject: "Chemistry",
    kicker: "Acids & Bases",
    title: "An antacid tablet settles acidity after a heavy meal. What is it chemically doing?",
    prompt: "The problem is too much of one thing, so you add its opposite.",
    options: [
      { id: "A", label: "Killing bacteria in the stomach", emoji: "🦠" },
      { id: "B", label: "Neutralising the excess acid", emoji: "⚗️" },
      { id: "C", label: "Soaking up the food", emoji: "🍚" },
      { id: "D", label: "Cooling the stomach lining", emoji: "🧊" },
    ],
    correctId: "B",
    explanation:
      "Antacids are mild bases such as magnesium hydroxide, and they react with excess hydrochloric acid to form salt and water. Neutralisation, straight out of the acid-base chapter.",
  },
  {
    id: "pcmb-chem-3",
    stream: "PCMB",
    subject: "Chemistry",
    kicker: "Tarnish",
    title: "A silver chain kept in a box for a year comes out dull and blackened. What happened?",
    prompt: "Nothing touched it, but the air around it was not pure.",
    options: [
      { id: "A", label: "Silver absorbed water and swelled", emoji: "💧" },
      { id: "B", label: "Dust simply settled on it", emoji: "🧹" },
      { id: "C", label: "It reacted with sulphur compounds in the air", emoji: "🖤" },
      { id: "D", label: "Sunlight burnt the surface", emoji: "☀️" },
    ],
    correctId: "C",
    explanation:
      "Silver reacts with traces of sulphur in air to form a thin layer of silver sulphide. Tarnishing is corrosion, the same family of reaction as rusting, just a different metal.",
  },
  {
    id: "pcmb-chem-4",
    stream: "PCMB",
    subject: "Chemistry",
    kicker: "States Of Matter",
    title: "Ice cubes float in a glass of water, unlike most solids in their own liquid. Why?",
    prompt: "Freezing changed the spacing of the molecules, not their number.",
    options: [
      { id: "A", label: "Water expands on freezing, so ice is less dense", emoji: "🧊" },
      { id: "B", label: "Colder things are always lighter", emoji: "❄️" },
      { id: "C", label: "Trapped air bubbles hold it up", emoji: "🫧" },
      { id: "D", label: "Ice has almost no mass", emoji: "🪶" },
    ],
    correctId: "A",
    explanation:
      "Hydrogen bonds lock water molecules into an open structure when it freezes, so the same mass takes more volume. That quirk is why lakes freeze from the top down.",
  },
  {
    id: "pcmb-chem-5",
    stream: "PCMB",
    subject: "Chemistry",
    kicker: "pH Sense",
    title: "Lemon juice sits at pH 2 and black coffee at pH 5. Which is more acidic?",
    prompt: "On the pH scale, lower means more acidic — and each step is a factor of ten.",
    options: [
      { id: "A", label: "Coffee, at pH 5", emoji: "☕" },
      { id: "B", label: "Lemon juice, at pH 2", emoji: "🍋" },
      { id: "C", label: "Both are equally acidic", emoji: "⚖️" },
      { id: "D", label: "Neither — both are basic", emoji: "🧼" },
    ],
    correctId: "B",
    explanation:
      "Lemon juice is three pH steps lower, which means about a thousand times the hydrogen ion concentration. The scale is logarithmic, so small numbers hide big differences.",
  },
  {
    id: "pcmb-math-1",
    stream: "PCMB",
    subject: "Mathematics",
    kicker: "Ratio Work",
    title: "A payasam recipe for 4 people needs 300 ml milk. How much for 10 people?",
    prompt: "Keep the proportion the same and scale it up.",
    options: [
      { id: "A", label: "600 ml", emoji: "🥛" },
      { id: "B", label: "700 ml", emoji: "🤔" },
      { id: "C", label: "750 ml", emoji: "🍮" },
      { id: "D", label: "1200 ml", emoji: "🪣" },
    ],
    correctId: "C",
    explanation:
      "300 ÷ 4 = 75 ml per person, and 75 × 10 = 750 ml. Finding the single-unit value first is the quickest route through almost any ratio problem.",
  },
  {
    id: "pcmb-math-2",
    stream: "PCMB",
    subject: "Mathematics",
    kicker: "Average Logic",
    title: "A class of 30 averages 60 marks. One more student joins with 90. What happens to the average?",
    prompt: "One score above the average pulls it up — but only by its share.",
    options: [
      { id: "A", label: "It rises slightly, staying near 61", emoji: "📈" },
      { id: "B", label: "It jumps to 75", emoji: "🚀" },
      { id: "C", label: "It stays exactly 60", emoji: "😐" },
      { id: "D", label: "It falls", emoji: "📉" },
    ],
    correctId: "A",
    explanation:
      "The extra 30 marks above average get shared across 31 students, lifting it by about one mark. A single value moves an average far less once the group is large.",
  },
  {
    id: "pcmb-math-3",
    stream: "PCMB",
    subject: "Mathematics",
    kicker: "Area Sense",
    title: "A square plot's side is increased by 10%. By how much does its area grow?",
    prompt: "Both sides of the square grew, not just one.",
    options: [
      { id: "A", label: "10%", emoji: "➕" },
      { id: "B", label: "20%", emoji: "🤔" },
      { id: "C", label: "11%", emoji: "📐" },
      { id: "D", label: "21%", emoji: "🎯" },
    ],
    correctId: "D",
    explanation:
      "1.1 × 1.1 = 1.21, so the area is 121% of the original. The extra 1% beyond a naive 20% is the small square at the corner where the two additions overlap.",
  },
  {
    id: "pcmb-math-4",
    stream: "PCMB",
    subject: "Mathematics",
    kicker: "Probability Basics",
    title: "A bag holds 3 red and 2 blue marbles. You pick one without looking — chance it is red?",
    prompt: "Count the favourable outcomes against the total.",
    options: [
      { id: "A", label: "2/5", emoji: "🔵" },
      { id: "B", label: "3/5", emoji: "🔴" },
      { id: "C", label: "1/2", emoji: "⚖️" },
      { id: "D", label: "3/2", emoji: "❓" },
    ],
    correctId: "B",
    explanation:
      "3 red out of 5 marbles gives 3/5. A probability can never exceed 1, so an option like 3/2 can be ruled out before you calculate anything.",
  },
  {
    id: "pcmb-math-5",
    stream: "PCMB",
    subject: "Mathematics",
    kicker: "Time Maths",
    title: "A bus leaves at 6:40 am and the journey takes 2 hours 45 minutes. Arrival time?",
    prompt: "Add the hours first, then the minutes, and carry over past 60.",
    options: [
      { id: "A", label: "9:05 am", emoji: "🕘" },
      { id: "B", label: "8:25 am", emoji: "🕗" },
      { id: "C", label: "9:25 am", emoji: "🚌" },
      { id: "D", label: "9:45 am", emoji: "🕤" },
    ],
    correctId: "C",
    explanation:
      "6:40 plus 2 hours is 8:40; another 45 minutes crosses the hour to 9:25. Minutes carry over at 60, not 100 — the usual slip in time arithmetic.",
  },
];

const PCMC: StreamQuestion[] = [
  {
    id: "pcmc-phy-1",
    stream: "PCMC",
    subject: "Physics",
    kicker: "Energy Trail",
    title: "Your phone gets noticeably hot during a long gaming session. Where is the heat from?",
    prompt: "The chip is doing more work, and no component is perfectly efficient.",
    options: [
      { id: "A", label: "The screen reflects sunlight inward", emoji: "☀️" },
      { id: "B", label: "The battery is swelling", emoji: "🪫" },
      { id: "C", label: "Games store heat as data", emoji: "💾" },
      { id: "D", label: "Resistance turns electrical energy into heat", emoji: "🌡️" },
    ],
    correctId: "D",
    explanation:
      "Billions of transistors switching per second lose part of the energy as heat in the circuit's resistance. That is why laptops carry fans and heat sinks.",
  },
  {
    id: "pcmc-phy-2",
    stream: "PCMC",
    subject: "Physics",
    kicker: "Waves Around Us",
    title: "Your mobile signal drops to zero inside a metal lift. Why?",
    prompt: "Think about what the lift is made of and what a signal actually is.",
    options: [
      { id: "A", label: "Metal walls block the radio waves", emoji: "📵" },
      { id: "B", label: "Lifts move too fast for signals", emoji: "🏃" },
      { id: "C", label: "The battery saves power inside", emoji: "🔋" },
      { id: "D", label: "Signals cannot travel upward", emoji: "⬆️" },
    ],
    correctId: "A",
    explanation:
      "A closed metal box acts as a shield and keeps electromagnetic waves out — the same idea as a Faraday cage. The call drops because almost nothing reaches the handset.",
  },
  {
    id: "pcmc-phy-3",
    stream: "PCMC",
    subject: "Physics",
    kicker: "Power & Light",
    title: "A 9 W LED lights a room as well as an old 60 W bulb. Where did the old bulb's 50 W go?",
    prompt: "Touch an old filament bulb after a minute and you have your answer.",
    options: [
      { id: "A", label: "Into sound you cannot hear", emoji: "🔇" },
      { id: "B", label: "Mostly into heat, not light", emoji: "🔥" },
      { id: "C", label: "Back into the mains supply", emoji: "🔌" },
      { id: "D", label: "Into brighter but invisible light", emoji: "👻" },
    ],
    correctId: "B",
    explanation:
      "A filament glows only because it is white hot, so most of its input becomes heat. An LED emits light directly from a semiconductor, which is why it stays cool and cheap to run.",
  },
  {
    id: "pcmc-phy-4",
    stream: "PCMC",
    subject: "Physics",
    kicker: "Energy Accounting",
    title: "A 10000 mAh power bank does not fully charge a 5000 mAh phone twice. Where is the shortfall?",
    prompt: "Charging is a conversion, and every conversion costs something.",
    options: [
      { id: "A", label: "The rating on the power bank is fake", emoji: "🏷️" },
      { id: "B", label: "The phone refuses the last charge", emoji: "🚫" },
      { id: "C", label: "Energy is lost as heat during conversion", emoji: "🌡️" },
      { id: "D", label: "The cable stores the extra charge", emoji: "🔗" },
    ],
    correctId: "C",
    explanation:
      "Stepping voltage up and down, plus resistance in the cable, wastes roughly a quarter of the energy as heat. Real efficiency is usually 60–80%, not 100%.",
  },
  {
    id: "pcmc-phy-5",
    stream: "PCMC",
    subject: "Physics",
    kicker: "Force & Time",
    title: "A fielder pulls his hands back while catching a fast cricket ball. Why does that help?",
    prompt: "The ball has to be stopped either way — the choice is how quickly.",
    options: [
      { id: "A", label: "It makes the ball lighter", emoji: "🪶" },
      { id: "B", label: "It slows the ball before contact", emoji: "🛑" },
      { id: "C", label: "It adds spin to the ball", emoji: "🌀" },
      { id: "D", label: "A longer stop time means a smaller force", emoji: "🏏" },
    ],
    correctId: "D",
    explanation:
      "The change in momentum is fixed, so stretching the stopping time reduces the force on the hands. Airbags, helmets and crumple zones all use the same trick.",
  },
  {
    id: "pcmc-math-1",
    stream: "PCMC",
    subject: "Mathematics",
    kicker: "Match Maths",
    title: "A team needs 72 runs from the last 6 overs. What is the required run rate?",
    prompt: "Rate is simply the total divided by the number of overs.",
    options: [
      { id: "A", label: "12 runs per over", emoji: "🏏" },
      { id: "B", label: "10 runs per over", emoji: "🔢" },
      { id: "C", label: "14 runs per over", emoji: "😅" },
      { id: "D", label: "8 runs per over", emoji: "🤔" },
    ],
    correctId: "A",
    explanation:
      "72 ÷ 6 = 12. Every run rate, speed and price-per-kilo question is the same division — a total shared out over units.",
  },
  {
    id: "pcmc-math-2",
    stream: "PCMC",
    subject: "Mathematics",
    kicker: "Proportion",
    title: "A 2 GB file downloads in 4 minutes. At the same speed, how long for 5 GB?",
    prompt: "Work out the time for one unit first.",
    options: [
      { id: "A", label: "8 minutes", emoji: "⏱️" },
      { id: "B", label: "6 minutes", emoji: "🤔" },
      { id: "C", label: "10 minutes", emoji: "📥" },
      { id: "D", label: "12 minutes", emoji: "🐌" },
    ],
    correctId: "C",
    explanation:
      "4 ÷ 2 = 2 minutes per GB, so 5 GB takes 10 minutes. Direct proportion: double the size, double the time, as long as the speed holds.",
  },
  {
    id: "pcmc-math-3",
    stream: "PCMC",
    subject: "Mathematics",
    kicker: "Counting Ways",
    title: "Three friends stand in a row for a photo. How many different orders are possible?",
    prompt: "Pick who stands first, then who stands second, then the last is decided.",
    options: [
      { id: "A", label: "3", emoji: "👥" },
      { id: "B", label: "6", emoji: "📸" },
      { id: "C", label: "9", emoji: "🔢" },
      { id: "D", label: "12", emoji: "🤷" },
    ],
    correctId: "B",
    explanation:
      "3 × 2 × 1 = 6, which is 3 factorial. The same multiplication principle counts passwords, seating plans and lottery combinations.",
  },
  {
    id: "pcmc-math-4",
    stream: "PCMC",
    subject: "Mathematics",
    kicker: "Growth Rates",
    title: "A forwarded message reaches twice as many people every hour, starting from 1. After 10 hours?",
    prompt: "Doubling ten times is not the same as multiplying by ten.",
    options: [
      { id: "A", label: "About 1,000 people", emoji: "📲" },
      { id: "B", label: "About 100 people", emoji: "👥" },
      { id: "C", label: "About 20 people", emoji: "🤏" },
      { id: "D", label: "About 10,000 people", emoji: "🌍" },
    ],
    correctId: "A",
    explanation:
      "2¹⁰ = 1024. Exponential growth looks slow for the first few steps and then runs away, which is exactly how things go viral.",
  },
  {
    id: "pcmc-math-5",
    stream: "PCMC",
    subject: "Mathematics",
    kicker: "Scale Reading",
    title: "On a map, 1 cm stands for 5 km. Two towns are 7.5 cm apart. Real distance?",
    prompt: "Multiply the map distance by what each centimetre represents.",
    options: [
      { id: "A", label: "12.5 km", emoji: "🤔" },
      { id: "B", label: "35 km", emoji: "🗺️" },
      { id: "C", label: "37.5 km", emoji: "🧭" },
      { id: "D", label: "75 km", emoji: "🚗" },
    ],
    correctId: "C",
    explanation:
      "7.5 × 5 = 37.5 km. A map scale is just a ratio, so the arithmetic is the same as converting any unit.",
  },
  {
    id: "pcmc-cs-1",
    stream: "PCMC",
    subject: "Computer Science",
    kicker: "Search Strategy",
    title: "To find a name in a sorted list of 1000 contacts you keep opening the middle. Roughly how many checks?",
    prompt: "Each look throws away half of whatever is left.",
    options: [
      { id: "A", label: "About 100", emoji: "📋" },
      { id: "B", label: "About 500", emoji: "😓" },
      { id: "C", label: "About 10", emoji: "🎯" },
      { id: "D", label: "About 1000", emoji: "🐌" },
    ],
    correctId: "C",
    explanation:
      "Halving 1000 about ten times leaves one entry — that is binary search. It is also why keeping data sorted is worth the upfront effort.",
  },
  {
    id: "pcmc-cs-2",
    stream: "PCMC",
    subject: "Computer Science",
    kicker: "Binary Sense",
    title: "Three switches, each either on or off. How many different combinations in total?",
    prompt: "Every extra switch doubles the possibilities.",
    options: [
      { id: "A", label: "8", emoji: "💡" },
      { id: "B", label: "6", emoji: "🤔" },
      { id: "C", label: "3", emoji: "🔀" },
      { id: "D", label: "9", emoji: "🔢" },
    ],
    correctId: "A",
    explanation:
      "Each switch has 2 states, so 2 × 2 × 2 = 8. That is exactly why 3 bits store 8 values and 8 bits store 256.",
  },
  {
    id: "pcmc-cs-3",
    stream: "PCMC",
    subject: "Computer Science",
    kicker: "How Internet Works",
    title: "You type a website name into the browser. What does DNS do first?",
    prompt: "Machines on a network find each other by number, not by name.",
    options: [
      { id: "A", label: "Speeds up your connection", emoji: "🚀" },
      { id: "B", label: "Turns the name into an IP address", emoji: "📒" },
      { id: "C", label: "Downloads the whole website", emoji: "📥" },
      { id: "D", label: "Checks whether the site is safe", emoji: "🛡️" },
    ],
    correctId: "B",
    explanation:
      "DNS is the internet's phonebook: it maps a readable name to the server's numeric address so your request knows where to go.",
  },
  {
    id: "pcmc-cs-4",
    stream: "PCMC",
    subject: "Computer Science",
    kicker: "Web Security",
    title: "A shopping site shows a padlock and https. What does that actually guarantee?",
    prompt: "It says something about the journey of your data, not about the seller.",
    options: [
      { id: "A", label: "The seller is honest", emoji: "🤝" },
      { id: "B", label: "Your payment is refundable", emoji: "💸" },
      { id: "C", label: "The site has no bugs", emoji: "🐞" },
      { id: "D", label: "Data is encrypted in transit", emoji: "🔒" },
    ],
    correctId: "D",
    explanation:
      "HTTPS scrambles data between your device and the server so nobody in between can read it. A fraudulent site can also hold a certificate, so the padlock is not proof of trustworthiness.",
  },
  {
    id: "pcmc-cs-5",
    stream: "PCMC",
    subject: "Computer Science",
    kicker: "Debug It",
    title: "A loop meant to print 1 to 10 stops at 9. Most likely cause?",
    prompt: "The logic is nearly right — one boundary is off.",
    options: [
      { id: "A", label: "The computer is too slow", emoji: "🐢" },
      { id: "B", label: "The condition uses < 10 instead of <= 10", emoji: "🔁" },
      { id: "C", label: "10 cannot be printed", emoji: "🚫" },
      { id: "D", label: "The variable must be a decimal", emoji: "🔣" },
    ],
    correctId: "B",
    explanation:
      "A classic off-by-one error: the loop exits just before the last value. With any near-miss bug, the start and end boundaries are the first things to check.",
  },
];

const COMMERCE: StreamQuestion[] = [
  {
    id: "commerce-acc-1",
    stream: "Commerce",
    subject: "Accountancy",
    kicker: "Ledger Logic",
    title: "A bakery buys an oven and also buys a sack of flour. Which one is an asset?",
    prompt: "One will still be earning for the shop next year; the other will not.",
    options: [
      { id: "A", label: "Both equally", emoji: "⚖️" },
      { id: "B", label: "Neither — both are losses", emoji: "❌" },
      { id: "C", label: "The oven", emoji: "🔥" },
      { id: "D", label: "The flour", emoji: "🌾" },
    ],
    correctId: "C",
    explanation:
      "The oven gives benefit over many years, so it sits on the balance sheet as an asset. Flour is consumed in this period's baking, which makes it an expense.",
  },
  {
    id: "commerce-acc-2",
    stream: "Commerce",
    subject: "Accountancy",
    kicker: "Double Entry",
    title: "A shop pays ₹8,000 rent in cash. What are the two effects in its books?",
    prompt: "Every transaction touches exactly two accounts.",
    options: [
      { id: "A", label: "Cash increases, expense increases", emoji: "➕" },
      { id: "B", label: "Only cash decreases", emoji: "1️⃣" },
      { id: "C", label: "Capital increases, cash increases", emoji: "📈" },
      { id: "D", label: "Cash decreases, rent expense increases", emoji: "📘" },
    ],
    correctId: "D",
    explanation:
      "Rent paid is an expense, so it is debited, and the cash going out is credited. The books stay balanced because profit, and therefore capital, falls by the same ₹8,000.",
  },
  {
    id: "commerce-acc-3",
    stream: "Commerce",
    subject: "Accountancy",
    kicker: "Cash Flow",
    title: "A stationery supplier shows a profit on paper but cannot pay salaries. How?",
    prompt: "The sales were made. The money for them has not arrived yet.",
    options: [
      { id: "A", label: "Salaries are not an expense", emoji: "💼" },
      { id: "B", label: "Customers buy on 60-day credit", emoji: "🧾" },
      { id: "C", label: "The profit was calculated wrongly", emoji: "❓" },
      { id: "D", label: "The business has no customers", emoji: "🚪" },
    ],
    correctId: "B",
    explanation:
      "Profit is recorded when a sale happens, but cash arrives only when the customer pays. Credit sales and unsold stock tie up cash, which is how a profitable firm runs dry.",
  },
  {
    id: "commerce-acc-4",
    stream: "Commerce",
    subject: "Accountancy",
    kicker: "Asset Values",
    title: "A delivery van bought for ₹6,00,000 appears at ₹5,40,000 a year later. What was recorded?",
    prompt: "Nothing was sold and nothing was damaged — the van simply aged.",
    options: [
      { id: "A", label: "Depreciation of ₹60,000 for the year", emoji: "📉" },
      { id: "B", label: "A loss on sale of ₹60,000", emoji: "🤝" },
      { id: "C", label: "Repairs worth ₹60,000", emoji: "🔧" },
      { id: "D", label: "A drawing of ₹60,000 by the owner", emoji: "👤" },
    ],
    correctId: "A",
    explanation:
      "Depreciation spreads an asset's cost across the years it is used, so the books show what it is still worth. Charging the whole ₹6,00,000 in year one would distort that year's profit.",
  },
  {
    id: "commerce-acc-5",
    stream: "Commerce",
    subject: "Accountancy",
    kicker: "Owner Vs Firm",
    title: "A shop owner takes ₹5,000 from the till to buy a personal phone. How is it recorded?",
    prompt: "In accounting, the business and its owner are treated as two separate people.",
    options: [
      { id: "A", label: "As a business expense", emoji: "🧾" },
      { id: "B", label: "As salary paid", emoji: "💼" },
      { id: "C", label: "As drawings, reducing capital", emoji: "👤" },
      { id: "D", label: "Not recorded at all", emoji: "🙈" },
    ],
    correctId: "C",
    explanation:
      "Money taken for personal use is drawings, so it reduces the owner's capital rather than the firm's profit. This is the business entity concept doing its job.",
  },
  {
    id: "commerce-bus-1",
    stream: "Commerce",
    subject: "Business Studies",
    kicker: "Profit Sense",
    title: "A canteen's sales doubled this month, yet its profit fell. Is that possible?",
    prompt: "Money coming in is only one half of the picture.",
    options: [
      { id: "A", label: "Yes — costs can rise faster than sales", emoji: "📉" },
      { id: "B", label: "No — more sales always means more profit", emoji: "🙅" },
      { id: "C", label: "Only if customers paid late", emoji: "⏰" },
      { id: "D", label: "Only if the price was raised", emoji: "🏷️" },
    ],
    correctId: "A",
    explanation:
      "Profit is revenue minus every expense. Extra staff, costlier ingredients or wastage can easily grow faster than the sales that caused them.",
  },
  {
    id: "commerce-bus-2",
    stream: "Commerce",
    subject: "Business Studies",
    kicker: "Forms Of Business",
    title: "A tea stall is run by one person who is personally answerable for all its debts. What form is it?",
    prompt: "No separate legal person stands between the owner and the creditors.",
    options: [
      { id: "A", label: "A private limited company", emoji: "🏢" },
      { id: "B", label: "A sole proprietorship, with unlimited liability", emoji: "🍵" },
      { id: "C", label: "A cooperative society", emoji: "🤝" },
      { id: "D", label: "A public limited company", emoji: "📈" },
    ],
    correctId: "B",
    explanation:
      "A sole proprietor and the business are the same legal person, so personal assets are at risk. The trade-off for that risk is full control and very simple setup.",
  },
  {
    id: "commerce-bus-3",
    stream: "Commerce",
    subject: "Business Studies",
    kicker: "Company Basics",
    title: "You hold ₹5,000 of shares in a company that collapses owing huge debts. Your maximum loss?",
    prompt: "A company is a separate legal person from the people who own it.",
    options: [
      { id: "A", label: "Your share of all its debts", emoji: "⚠️" },
      { id: "B", label: "Nothing at all", emoji: "🆓" },
      { id: "C", label: "Double the investment", emoji: "✖️" },
      { id: "D", label: "₹5,000 — the amount invested", emoji: "🛡️" },
    ],
    correctId: "D",
    explanation:
      "Limited liability caps a shareholder's loss at what they put in. That protection is a big reason ordinary people are willing to fund companies at all.",
  },
  {
    id: "commerce-bus-4",
    stream: "Commerce",
    subject: "Business Studies",
    kicker: "Marketing Mix",
    title: "A new snack brand hands out free samples outside a college gate. Which part of the marketing mix is that?",
    prompt: "The four Ps are product, price, place and one more.",
    options: [
      { id: "A", label: "Product", emoji: "🍿" },
      { id: "B", label: "Price", emoji: "🏷️" },
      { id: "C", label: "Promotion", emoji: "📣" },
      { id: "D", label: "Place", emoji: "📍" },
    ],
    correctId: "C",
    explanation:
      "Sampling is promotion: it is spending to make people aware and willing to try. The snack itself is the product, and the college gate is the place.",
  },
  {
    id: "commerce-bus-5",
    stream: "Commerce",
    subject: "Business Studies",
    kicker: "Management Basics",
    title: "A manager hands a task to a junior but is still answerable to the owner for the result. Why?",
    prompt: "Two things move when you delegate — and only one of them travels downward.",
    options: [
      { id: "A", label: "Authority can be delegated; responsibility cannot", emoji: "📋" },
      { id: "B", label: "Juniors can never be trusted", emoji: "🙅" },
      { id: "C", label: "The owner forgot to reassign it", emoji: "❓" },
      { id: "D", label: "Delegation is not allowed in business", emoji: "🚫" },
    ],
    correctId: "A",
    explanation:
      "A manager can pass on the authority to act, but remains accountable for the outcome. That is why good delegation comes with clear instructions and follow-up.",
  },
  {
    id: "commerce-eco-1",
    stream: "Commerce",
    subject: "Economics",
    kicker: "Demand & Supply",
    title: "Unseasonal rain damages the onion crop and prices jump. Which side of the market moved?",
    prompt: "People want the same onions as before. Fewer of them reached the market.",
    options: [
      { id: "A", label: "Demand fell", emoji: "🛒" },
      { id: "B", label: "Supply fell", emoji: "📦" },
      { id: "C", label: "Both rose equally", emoji: "↕️" },
      { id: "D", label: "Neither — only the tax changed", emoji: "🏛️" },
    ],
    correctId: "B",
    explanation:
      "With demand steady and supply reduced, the same buyers compete for less stock and the price rises. Supply shocks are the usual reason vegetable prices spike.",
  },
  {
    id: "commerce-eco-2",
    stream: "Commerce",
    subject: "Economics",
    kicker: "Money Value",
    title: "₹100 bought a full canteen meal two years ago; today it buys half of one. What is this called?",
    prompt: "The note is the same. What it can command has changed.",
    options: [
      { id: "A", label: "Inflation reducing purchasing power", emoji: "📈" },
      { id: "B", label: "Deflation", emoji: "📉" },
      { id: "C", label: "A tax increase", emoji: "🏛️" },
      { id: "D", label: "Currency devaluation abroad", emoji: "🌍" },
    ],
    correctId: "A",
    explanation:
      "Inflation is a general rise in prices, so each rupee commands fewer goods. It is also why savings need a return at least matching the inflation rate.",
  },
  {
    id: "commerce-eco-3",
    stream: "Commerce",
    subject: "Economics",
    kicker: "Choice Costs",
    title: "You spend Saturday morning at a free coding workshop instead of the inter-college match. The match is your what?",
    prompt: "Every choice quietly gives up the next best alternative.",
    options: [
      { id: "A", label: "Fixed cost", emoji: "🏠" },
      { id: "B", label: "Sunk cost", emoji: "⚓" },
      { id: "C", label: "Marginal cost", emoji: "➕" },
      { id: "D", label: "Opportunity cost", emoji: "⚖️" },
    ],
    correctId: "D",
    explanation:
      "Opportunity cost is the value of the best option you gave up. Economics treats time, not just money, as something that gets spent.",
  },
  {
    id: "commerce-eco-4",
    stream: "Commerce",
    subject: "Economics",
    kicker: "Elasticity",
    title: "Petrol prices rise 10%, yet people buy almost the same quantity. Demand here is what?",
    prompt: "Quantity barely responded to a clear change in price.",
    options: [
      { id: "A", label: "Highly elastic", emoji: "🎈" },
      { id: "B", label: "Perfectly elastic", emoji: "📏" },
      { id: "C", label: "Inelastic", emoji: "⛽" },
      { id: "D", label: "Negative", emoji: "➖" },
    ],
    correctId: "C",
    explanation:
      "Demand is inelastic when quantity hardly moves with price, typical of necessities with few substitutes. Cinema tickets behave the opposite way.",
  },
  {
    id: "commerce-eco-5",
    stream: "Commerce",
    subject: "Economics",
    kicker: "Public Finance",
    title: "A state spends more in a year than it collects in revenue. That gap is called what?",
    prompt: "The same idea as spending more than you earn, scaled up to a government.",
    options: [
      { id: "A", label: "A trade surplus", emoji: "🚢" },
      { id: "B", label: "A fiscal deficit", emoji: "🏛️" },
      { id: "C", label: "A balanced budget", emoji: "⚖️" },
      { id: "D", label: "Inflation", emoji: "📈" },
    ],
    correctId: "B",
    explanation:
      "A fiscal deficit is spending minus revenue, and it is usually met by borrowing. Some deficit can fund roads and schools; a persistent large one raises the interest bill.",
  },
];

const ARTS: StreamQuestion[] = [
  {
    id: "arts-his-1",
    stream: "Arts/Humanities",
    subject: "History",
    kicker: "Reading Sources",
    title: "An inscription ordered by a king describes his own victories. How should a historian treat it?",
    prompt: "Being first-hand and being impartial are two different things.",
    options: [
      { id: "A", label: "Fully neutral because it is old", emoji: "⏳" },
      { id: "B", label: "Useless unless a foreigner wrote it", emoji: "🧭" },
      { id: "C", label: "A primary source, but check its bias", emoji: "🪨" },
      { id: "D", label: "A secondary source, so ignore it", emoji: "🗑️" },
    ],
    correctId: "C",
    explanation:
      "It is a primary source from the period, which makes it valuable. Since the king commissioned it, historians read it alongside coins, accounts and travellers' records.",
  },
  {
    id: "arts-his-2",
    stream: "Arts/Humanities",
    subject: "History",
    kicker: "Evidence Types",
    title: "The stone ruins and market streets at Hampi tell us how Vijayanagara lived. What kind of evidence is that?",
    prompt: "Nobody wrote it down for us — it was dug up and surveyed.",
    options: [
      { id: "A", label: "Archaeological evidence from the site", emoji: "🏛️" },
      { id: "B", label: "A folk tale passed down orally", emoji: "🗣️" },
      { id: "C", label: "A modern government report", emoji: "📄" },
      { id: "D", label: "A work of historical fiction", emoji: "📖" },
    ],
    correctId: "A",
    explanation:
      "Buildings, coins, tools and pottery are material remains, and they carry evidence no chronicle bothered to record. Historians combine them with written accounts for a fuller picture.",
  },
  {
    id: "arts-his-3",
    stream: "Arts/Humanities",
    subject: "History",
    kicker: "Early Cities",
    title: "Most early Indian settlements grew along riverbanks. What best explains that?",
    prompt: "Think about what a settlement of a few thousand people needs every single day.",
    options: [
      { id: "A", label: "Rivers kept invaders away", emoji: "🛡️" },
      { id: "B", label: "Riverbanks were considered sacred only", emoji: "🙏" },
      { id: "C", label: "The soil there was rocky and firm", emoji: "🪨" },
      { id: "D", label: "Water for drinking, farming and transport", emoji: "🌊" },
    ],
    correctId: "D",
    explanation:
      "Rivers supplied drinking water, fertile silt for crops and a cheap route for moving goods. Harappa, Mohenjo-daro and most early towns sit on exactly that combination.",
  },
  {
    id: "arts-his-4",
    stream: "Arts/Humanities",
    subject: "History",
    kicker: "Two Accounts",
    title: "Two books describe the events of 1857 quite differently. What is the most likely reason?",
    prompt: "The past did not change. What each writer had in front of them did.",
    options: [
      { id: "A", label: "One of them is simply lying", emoji: "🚫" },
      { id: "B", label: "Historians use different sources and interpret them differently", emoji: "📚" },
      { id: "C", label: "History is rewritten every year", emoji: "🔄" },
      { id: "D", label: "The dates were forgotten", emoji: "📅" },
    ],
    correctId: "B",
    explanation:
      "Historians work from incomplete evidence, and which sources they weigh most shapes the account. Comparing versions is a normal part of the subject, not a flaw in it.",
  },
  {
    id: "arts-his-5",
    stream: "Arts/Humanities",
    subject: "History",
    kicker: "Royal Messages",
    title: "Ashoka's edicts were carved in Prakrit, the everyday speech, not in scholarly Sanskrit. What does that suggest?",
    prompt: "A message is written in the language of the people it is meant for.",
    options: [
      { id: "A", label: "They were meant for ordinary people to follow", emoji: "🪧" },
      { id: "B", label: "Sanskrit had not been invented yet", emoji: "❓" },
      { id: "C", label: "Prakrit was simply easier to carve", emoji: "🔨" },
      { id: "D", label: "Only officials could read Prakrit", emoji: "🔒" },
    ],
    correctId: "A",
    explanation:
      "Using the spoken language and placing the pillars on busy routes shows the edicts were meant to be read widely. The choice of language is itself historical evidence.",
  },
  {
    id: "arts-pol-1",
    stream: "Arts/Humanities",
    subject: "Political Science",
    kicker: "Rights & Freedoms",
    title: "A newspaper prints a column criticising a government decision. Which freedom protects it?",
    prompt: "The Constitution lists this one among the freedoms in Article 19.",
    options: [
      { id: "A", label: "Right to equality", emoji: "⚖️" },
      { id: "B", label: "Right against exploitation", emoji: "🚫" },
      { id: "C", label: "Right to constitutional remedies", emoji: "🏛️" },
      { id: "D", label: "Freedom of speech and expression", emoji: "🗣️" },
    ],
    correctId: "D",
    explanation:
      "Press freedom in India flows from the citizen's freedom of speech and expression. Like all of these freedoms it carries reasonable restrictions, for instance on defamation.",
  },
  {
    id: "arts-pol-2",
    stream: "Arts/Humanities",
    subject: "Political Science",
    kicker: "Making Law",
    title: "A bill has been passed by both the Lok Sabha and the Rajya Sabha. What makes it law?",
    prompt: "One more step is needed before it reaches the statute book.",
    options: [
      { id: "A", label: "Assent of the President", emoji: "✍️" },
      { id: "B", label: "An order of the Supreme Court", emoji: "⚖️" },
      { id: "C", label: "A public referendum", emoji: "🗳️" },
      { id: "D", label: "Approval of all state assemblies", emoji: "🏢" },
    ],
    correctId: "A",
    explanation:
      "Once both Houses pass a bill it goes to the President, and with assent it becomes an Act. The President may also return a bill other than a money bill once for reconsideration.",
  },
  {
    id: "arts-pol-3",
    stream: "Arts/Humanities",
    subject: "Political Science",
    kicker: "Federal Structure",
    title: "A town wants more police patrols at night. Which level of government is mainly responsible?",
    prompt: "Some subjects belong to the Union, some to the states.",
    options: [
      { id: "A", label: "The Election Commission", emoji: "🗳️" },
      { id: "B", label: "The state government", emoji: "🏛️" },
      { id: "C", label: "The Union government", emoji: "🇮🇳" },
      { id: "D", label: "The Supreme Court", emoji: "⚖️" },
    ],
    correctId: "B",
    explanation:
      "Police and public order are State List subjects, so the state government runs them. Defence, currency and foreign affairs sit on the Union List instead.",
  },
  {
    id: "arts-pol-4",
    stream: "Arts/Humanities",
    subject: "Political Science",
    kicker: "Checks & Balances",
    title: "A court sets aside a law for violating a fundamental right. Which power is it using?",
    prompt: "One organ of the state is checking the work of another.",
    options: [
      { id: "A", label: "Executive privilege", emoji: "🗂️" },
      { id: "B", label: "A money bill", emoji: "💵" },
      { id: "C", label: "Judicial review", emoji: "⚖️" },
      { id: "D", label: "A no-confidence motion", emoji: "🙅" },
    ],
    correctId: "C",
    explanation:
      "Judicial review lets courts test a law against the Constitution. It is the check that keeps the legislature's power within constitutional limits.",
  },
  {
    id: "arts-pol-5",
    stream: "Arts/Humanities",
    subject: "Political Science",
    kicker: "Election Rules",
    title: "In a constituency four candidates poll 35%, 30%, 20% and 15%. Who takes the seat?",
    prompt: "India elects on first-past-the-post, not on an absolute majority.",
    options: [
      { id: "A", label: "A run-off is held between the top two", emoji: "🔁" },
      { id: "B", label: "The candidate with 35% wins outright", emoji: "🏆" },
      { id: "C", label: "Nobody wins without 50%", emoji: "🚫" },
      { id: "D", label: "The seat stays vacant for a year", emoji: "🪑" },
    ],
    correctId: "B",
    explanation:
      "Whoever polls the most votes wins, even well under half. That is why vote-splitting among similar candidates matters so much under this system.",
  },
  {
    id: "arts-eco-1",
    stream: "Arts/Humanities",
    subject: "Economics",
    kicker: "Development Basics",
    title: "A new tar road reaches a village and farmers start selling in the town market. What does that show?",
    prompt: "The crop did not change. What changed is who can be reached.",
    options: [
      { id: "A", label: "Farming suddenly became easier", emoji: "🌾" },
      { id: "B", label: "Roads always push prices down", emoji: "📉" },
      { id: "C", label: "Infrastructure widens market access", emoji: "🛣️" },
      { id: "D", label: "The village population grew", emoji: "👥" },
    ],
    correctId: "C",
    explanation:
      "Roads, storage and electricity let producers reach more buyers and lose less to spoilage. That is why infrastructure counts as development spending, not just construction.",
  },
  {
    id: "arts-eco-2",
    stream: "Arts/Humanities",
    subject: "Economics",
    kicker: "Measuring Output",
    title: "A news headline says India's GDP grew 7% this year. GDP measures what exactly?",
    prompt: "It counts output produced, not money held.",
    options: [
      { id: "A", label: "Total money kept in banks", emoji: "🏦" },
      { id: "B", label: "The government's own income", emoji: "🏛️" },
      { id: "C", label: "The number of people employed", emoji: "👷" },
      { id: "D", label: "Value of final goods and services produced in a year", emoji: "📊" },
    ],
    correctId: "D",
    explanation:
      "GDP adds up the value of final goods and services made within the country in a year. Only final value is counted, so the same output is not added twice.",
  },
  {
    id: "arts-eco-3",
    stream: "Arts/Humanities",
    subject: "Economics",
    kicker: "Beyond Income",
    title: "A district reports higher literacy and longer life expectancy. Which measure does that lift?",
    prompt: "This index deliberately looks past income alone.",
    options: [
      { id: "A", label: "The Human Development Index", emoji: "📗" },
      { id: "B", label: "The inflation rate", emoji: "📈" },
      { id: "C", label: "The fiscal deficit", emoji: "🏛️" },
      { id: "D", label: "The balance of trade", emoji: "🚢" },
    ],
    correctId: "A",
    explanation:
      "HDI combines income with education and health, because a place can be richer without people living longer or learning more. That is why development is measured on more than one axis.",
  },
  {
    id: "arts-eco-4",
    stream: "Arts/Humanities",
    subject: "Economics",
    kicker: "Work Patterns",
    title: "A farm worker has steady work at sowing and harvest but little in between. What is that called?",
    prompt: "The idleness arrives at the same time every year.",
    options: [
      { id: "A", label: "Structural unemployment", emoji: "🏭" },
      { id: "B", label: "Seasonal unemployment", emoji: "🌾" },
      { id: "C", label: "Frictional unemployment", emoji: "🔄" },
      { id: "D", label: "Full employment", emoji: "✅" },
    ],
    correctId: "B",
    explanation:
      "Seasonal unemployment follows the farming calendar rather than a lack of skills. Allied work like dairying or food processing is the usual policy answer to it.",
  },
  {
    id: "arts-eco-5",
    stream: "Arts/Humanities",
    subject: "Economics",
    kicker: "How Banks Earn",
    title: "A bank pays 6% on deposits and charges 11% on loans. Where does its income come from?",
    prompt: "Look at the difference between the two rates.",
    options: [
      { id: "A", label: "Government grants", emoji: "🏛️" },
      { id: "B", label: "Printing new currency notes", emoji: "🖨️" },
      { id: "C", label: "The gap between lending and deposit rates", emoji: "🏦" },
      { id: "D", label: "ATM charges alone", emoji: "🏧" },
    ],
    correctId: "C",
    explanation:
      "That 5% spread, earned across crores of rupees, is a bank's core income. Only the Reserve Bank issues currency, so printing notes is never an option for a commercial bank.",
  },
];

/**
 * Keyed by stream. Every stream holds exactly 15 questions — three subjects of
 * five. `questionsForStream` is the only read path, so a missing stream degrades
 * to an empty quiz rather than throwing.
 */
export const STREAM_QUESTIONS: Record<Stream, StreamQuestion[]> = {
  PCM,
  PCMB,
  PCMC,
  Commerce: COMMERCE,
  "Arts/Humanities": ARTS,
};

export function questionsForStream(stream: Stream | ""): StreamQuestion[] {
  if (!stream) return [];
  return STREAM_QUESTIONS[stream] ?? [];
}

/** Display-only summary of stage 2. Never consumed by scoring or ranking. */
export function summariseStreamQuiz(
  stream: Stream | "",
  answers: Record<string, string>,
  // The bank the student actually sat. Defaults to the bundled one; a
  // database-backed round must be marked against its own correct answers.
  bank?: StreamQuestion[],
): StreamQuizResult {
  const questions = bank ?? questionsForStream(stream);
  const correctCount = questions.reduce(
    (total, question) => total + (answers[question.id] === question.correctId ? 1 : 0),
    0,
  );
  return { answers, correctCount, total: questions.length };
}
