import fs from 'node:fs';
import path from 'node:path';

// Load captions
const captions = JSON.parse(fs.readFileSync('projects/people-pleasing/captions.json', 'utf8'));

const B1_STYLE_ANCHOR = "Minimalist 2D hand-drawn stick figure animation style, slender proportions, simple clean black ink linework, expressive face with simple eyebrow and mouth marks, isolated on solid pure white background (#FFFFFF), strictly 2D flat, no 3D shading, no gradients, no shadows, consistent line weight, completely standalone figure not touching image boundaries, no text, no typography.";

// Grouping into 42 scenes based on dramatic narrative beats
export const SCENE_PROMPTS = [
  // Shot 01 (0.00s - 7.50s): Overwhelmed office desk, forced smile
  {
    shot: 1,
    start: 0,
    end: 7.505,
    title: "Overwhelmed Yes-Man",
    prompt: `${B1_STYLE_ANCHOR} A nervous stick figure standing behind an office desk overflowing with tall stacks of paperwork and folders, peeking out with a sweat drop on forehead and a forced polite smile.`
  },
  // Shot 02 (7.505s - 13.50s): Bowing low in relationship, broken heart band-aid
  {
    shot: 2,
    start: 7.505,
    end: 13.500,
    title: "Sacrificing Ego in Love",
    prompt: `${B1_STYLE_ANCHOR} A stick figure bowing low apologetically, hands clasped, while next to it floats a symbolic red heart with a jagged crack mended with a band-aid.`
  },
  // Shot 03 (13.50s - 18.80s): Mask of cheerfulness, surrounding thumbs-up
  {
    shot: 3,
    start: 13.500,
    end: 18.800,
    title: "Surrounded by Praise",
    prompt: `${B1_STYLE_ANCHOR} A tired stick figure holding a smiling paper mask in front of its real exhausted face, surrounded by multiple disembodied thumbs-up signs giving praise.`
  },
  // Shot 04 (18.80s - 27.25s): Night bedroom, curling in bed, smoldering inner fire
  {
    shot: 4,
    start: 18.800,
    end: 27.250,
    title: "Bedtime Emptiness & Inner Smolder",
    prompt: `${B1_STYLE_ANCHOR} A closed bedroom door on one side, and a stick figure curled up in bed staring wide-eyed at the ceiling, with a glowing small orange flame burning inside its chest.`
  },
  // Shot 05 (27.25s - 34.00s): Wondering why living for others, neglected mirror
  {
    shot: 5,
    start: 27.250,
    end: 34.000,
    title: "Living for Others",
    prompt: `${B1_STYLE_ANCHOR} A stick figure sitting alone on a wooden chair with head in hands, looking down into an empty thought cloud, questioning why no one cares how exhausted it feels.`
  },
  // Shot 06 (34.00s - 45.50s): Dropping a cup / sudden emotional explosion
  {
    shot: 6,
    start: 34.000,
    end: 45.500,
    title: "Sudden Volcano Eruption",
    prompt: `${B1_STYLE_ANCHOR} A dropped coffee cup shattering on the ground, while the stick figure suddenly erupts with fiery steam blowing from its head in shock and volcanic rage.`
  },
  // Shot 07 (45.50s - 50.80s): Welcome to Coi Vo Thuc
  {
    shot: 7,
    start: 45.500,
    end: 50.800,
    title: "Welcome to Cõi Vô Thức",
    prompt: `${B1_STYLE_ANCHOR} A wise stick figure presenter standing beside a clean blackboard illustrating a glowing brain and psychological labyrinth symbol.`
  },
  // Shot 08 (50.80s - 59.50s): Psychological trap - People-Pleasing & Repressed Rage
  {
    shot: 8,
    start: 50.800,
    end: 59.500,
    title: "The Psychological Trap",
    prompt: `${B1_STYLE_ANCHOR} A stick figure with its ankle caught inside an open bear-trap labeled with a smiling face, while a ticking time-bomb rests in its hands.`
  },
  // Shot 09 (59.50s - 71.50s): Dissecting the disease - survival instinct
  {
    shot: 9,
    start: 59.500,
    end: 71.500,
    title: "Dissecting the Survival Reflex",
    prompt: `${B1_STYLE_ANCHOR} A stick figure wearing glasses holding a magnifying glass, examining a miniature stick figure cowering under a giant question mark.`
  },
  // Shot 10 (71.50s - 79.00s): In modern life, smiling disease creeping into every corner
  {
    shot: 10,
    start: 71.500,
    end: 79.000,
    title: "Infiltrating Every Corner",
    prompt: `${B1_STYLE_ANCHOR} Multiple smiling mask vines creeping along the walls around a stick figure sitting at a computer workstation.`
  },
  // Shot 11 (79.00s - 98.00s): Reflex 1: Involuntary Apologies (Someone bumps into you, you apologize)
  {
    shot: 11,
    start: 79.000,
    end: 98.000,
    title: "Involuntary Apology Reflex",
    prompt: `${B1_STYLE_ANCHOR} Two stick figures on a sidewalk, one person bumps roughly into the other, but the victim stick figure bows frantically apologizing first.`
  },
  // Shot 12 (98.00s - 121.00s): Reflex 2: Emotional Chameleon (laughing when drained, agreeing with bullies)
  {
    shot: 12,
    start: 98.000,
    end: 121.000,
    title: "Emotional Chameleon",
    prompt: `${B1_STYLE_ANCHOR} A stick figure walking past a changing color wheel, its body shifting shades like a chameleon while carrying a stack of various facial expression masks.`
  },
  // Shot 13 (121.00s - 146.00s): Reflex 3: Accumulating Hidden Emotional Debt Ledger
  {
    shot: 13,
    start: 121.000,
    end: 146.000,
    title: "Silent Debt Ledger",
    prompt: `${B1_STYLE_ANCHOR} A stick figure covertly writing with a quill into a thick old ledger book, looking over its shoulder with an increasingly bitter expression.`
  },
  // Shot 14 (146.00s - 159.00s): Why do adults voluntarily abandon boundaries?
  {
    shot: 14,
    start: 146.000,
    end: 159.000,
    title: "Erasing Personal Boundaries",
    prompt: `${B1_STYLE_ANCHOR} A stick figure holding an eraser, erasing a protective white chalk boundary circle drawn on the ground around its own feet.`
  },
  // Shot 15 (159.00s - 178.00s): Mechanism 1: Fawn Response - Fight, Flight, Freeze, FAWN
  {
    shot: 15,
    start: 159.000,
    end: 178.000,
    title: "The 4th Survival Reflex: Fawn",
    prompt: `${B1_STYLE_ANCHOR} A four-way crossroads signpost showing symbols of boxing glove (Fight), running shoes (Flight), ice cube (Freeze), and gentle offering hands (Fawn).`
  },
  // Shot 16 (178.00s - 204.00s): Childhood with hot-tempered parents, conditional love
  {
    shot: 16,
    start: 178.000,
    end: 204.000,
    title: "Childhood Conditional Love",
    prompt: `${B1_STYLE_ANCHOR} A small childlike stick figure tiptoeing carefully across a floor of eggshells in front of a giant looming angry shadow, holding a spotless report card.`
  },
  // Shot 17 (204.00s - 219.00s): Growing up: Amygdala triggers Fawn defense
  {
    shot: 17,
    start: 204.000,
    end: 219.000,
    title: "Camouflaged Defense Mechanism",
    prompt: `${B1_STYLE_ANCHOR} An adult stick figure wearing a cardboard armor suit painted with smiling friendly faces, shielding itself from an incoming storm.`
  },
  // Shot 18 (219.00s - 239.00s): Mechanism 2: Nervous System Overload & Emotional Flooding
  {
    shot: 18,
    start: 219.000,
    end: 239.000,
    title: "Internal Conflict: Saying Yes while Screaming No",
    prompt: `${B1_STYLE_ANCHOR} A stick figure with its mouth saying 'YES' in a speech bubble, while inside its chest an inner miniature figure is screaming and pulling its hair.`
  },
  // Shot 19 (239.00s - 258.00s): Pressure cooker metaphor, Cortisol & Adrenaline rising
  {
    shot: 19,
    start: 239.000,
    end: 258.000,
    title: "The Human Pressure Cooker",
    prompt: `${B1_STYLE_ANCHOR} A stick figure styled like a metallic pressure cooker gauge, with pressure needle pointing dangerously in the red danger zone, steam whistling from top.`
  },
  // Shot 20 (258.00s - 279.00s): Amygdala Hijack - rational brain disabled, explosion of years of fury
  {
    shot: 20,
    start: 258.000,
    end: 279.000,
    title: "Amygdala Hijack",
    prompt: `${B1_STYLE_ANCHOR} A glowing brain icon where the tiny almond-shaped amygdala turns bright red and takes over the steering wheel of the mind, pushing rational brain aside.`
  },
  // Shot 21 (279.00s - 305.00s): Mechanism 3: Confusing Love with Utility Value
  {
    shot: 21,
    start: 279.000,
    end: 305.000,
    title: "Loved for Utility, Not True Self",
    prompt: `${B1_STYLE_ANCHOR} A stick figure holding a price tag on its wrist, serving drinks on a silver platter to shadowy figures who smile only at the platter.`
  },
  // Shot 22 (305.00s - 325.00s): Highest Price: Chronic Burnout & Door Slam
  {
    shot: 22,
    start: 305.000,
    end: 325.000,
    title: "Burnout & The Door Slam",
    prompt: `${B1_STYLE_ANCHOR} A heavy iron door slamming shut with a padlock, leaving an exhausted stick figure walking away into quiet solitude on the other side.`
  },
  // Shot 23 (325.00s - 345.00s): Becoming the villain in everyone's eyes
  {
    shot: 23,
    start: 325.000,
    end: 345.000,
    title: "Misunderstood as the Villain",
    prompt: `${B1_STYLE_ANCHOR} A stick figure standing alone under a harsh spotlight while surrounding crowd points fingers, unable to see the heavy mountain of swallowed tears beneath it.`
  },
  // Shot 24 (345.00s - 368.00s): Transition to Solutions: 3 Behavioral Steps
  {
    shot: 24,
    start: 345.000,
    end: 368.000,
    title: "Keeping a Warm Heart without Being a Doormat",
    prompt: `${B1_STYLE_ANCHOR} A confident stick figure gently lifting a welcome doormat off the floor and hanging a golden key of self-respect on the wall.`
  },
  // Shot 25 (368.00s - 397.00s): Step 1: 24-Hour Delay Rule
  {
    shot: 25,
    start: 368.000,
    end: 397.000,
    title: "The 24-Hour Delay Rule",
    prompt: `${B1_STYLE_ANCHOR} A stick figure raising a gentle palm 'STOP' sign while tapping an hourglass, taking a calm breath before responding.`
  },
  // Shot 26 (397.00s - 423.00s): Step 2: Practicing Concise Refusal without Over-Explaining
  {
    shot: 26,
    start: 397.000,
    end: 423.000,
    title: "Concise Polite Refusal",
    prompt: `${B1_STYLE_ANCHOR} A stick figure politely offering a brief handshake with a firm smile, speaking a clean simple 'No' enclosed in a tidy neat circle.`
  },
  // Shot 27 (423.00s - 439.83s): Step 3 & Ending: Kindness begins with self-kindness, subscribe call
  {
    shot: 27,
    start: 423.000,
    end: 439.831,
    title: "True Kindness Begins with Yourself",
    prompt: `${B1_STYLE_ANCHOR} A smiling stick figure warmly hugging its own shoulders in peace, with a glowing heart in chest and a YouTube bell chime icon in the sky.`
  }
];

fs.writeFileSync('projects/people-pleasing/scene_prompts_ai.json', JSON.stringify(SCENE_PROMPTS, null, 2));
console.log(`Saved ${SCENE_PROMPTS.length} high-impact AI scene prompts to projects/people-pleasing/scene_prompts_ai.json!`);
