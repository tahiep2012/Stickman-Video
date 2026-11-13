import fs from 'node:fs';
import path from 'node:path';

const srcFile = path.resolve('projects/people-pleasing/scene_prompts_ai.json');
const destFile = path.resolve('projects/people-pleasing/director_video_prompts.json');

const items = JSON.parse(fs.readFileSync(srcFile, 'utf8'));

// Cinematic video actions for each shot
const videoActions = {
  1: "A nervous stick figure is sitting behind an office desk as tall stacks of paper and folders rapidly pile up higher around it. The figure glances nervously left and right with sweat flying off forehead, forcing a twitching polite smile.",
  2: "A stick figure bows deeply and repeatedly in an apologetic stance with clasped hands. A red cracked heart floats beside it, glowing softly as a small band-aid materializes across the crack.",
  3: "A weary stick figure stands holding a smiling paper mask in front of its face. The mask slips down slightly to reveal tired eyes, while glowing drawn thumbs-up icons pop up all around giving praise.",
  4: "A stick figure lies curled up in bed, eyes blinking open in insomnia staring at the ceiling. A small, vibrant orange flame gently flickers and pulses inside its chest in the darkness.",
  5: "A lonely stick figure sits slumped on a simple chair, head buried in its hands. A swirling question mark and empty thought cloud rises slowly above its head as it sighs.",
  6: "A ceramic coffee cup drops in slow motion and shatters on the floor. The stick figure suddenly stiffens, clenches fists, and intense comic-book steam erupts furiously from its head.",
  7: "A stick figure dressed as a wise lecturer points with a pointer stick to a clean blackboard illustrating a glowing brain and labyrinth diagram, gesturing knowledgeably.",
  8: "A small stick child timidly approaches an angry, towering stick parent whose shadow looms large. The child slowly lowers its head, withdrawing its hand in rejection.",
  9: "A young stick figure walks cautiously, balancing on an intricate glowing blueprint line of adult expectations, arms outstretched carefully to maintain balance.",
  10: "A stick figure stands under an open umbrella. When other stick figures run over seeking shelter, it gives away the umbrella and stands smiling as rain drenches its own body.",
  11: "A stick figure holds a vibrant battery icon in its hands. The green charge indicator quickly drains down to flashing red empty as ghost-like stick hands reach in and take energy away.",
  12: "A stick figure is suspended on puppet strings, twitching and moving awkwardly as shadowy hands from above pull the control bars.",
  13: "A stick figure stands frozen in hesitation before two glowing doors labeled with simple directional arrows, stepping forward and backward indecisively.",
  14: "A stick figure walks forward while a deep, heavy black shadow stretches unnaturally long behind it, following every step like an unavoidable specter.",
  15: "A stick figure holds a small, beautiful gift box outward toward others, but its own head is cast in gloomy shadow as nobody turns around to say thank you.",
  16: "A stick figure looks into a full-length mirror. In the reflection, its stick arms are bound with ropes, struggling against the invisible ties of self-judgment.",
  17: "A stick figure slowly pulls off a heavy smiling mask from its face, dropping it to the ground. The mask gently crumbles as the figure takes a deep, calm breath.",
  18: "A stick figure stands tall and firmly plants its feet. It raises both open palms in a clear, assertive stop gesture, drawing a luminous boundary line on the floor in front of it.",
  19: "Other stick figures frown and step back behind the boundary line, but the stick figure remains calm, standing steady with hands at its sides, unbothered.",
  20: "A stick figure's chest begins to glow with warm golden light, gently radiating outward and dissolving dark tangled scribbles around its shoulders.",
  21: "Two stick figures meet in the center of the frame and shake hands as equals, standing at the exact same height and smiling genuinely without bowing.",
  22: "A stick figure sits comfortably under a small shaded tree, reading a book at leisure with a calm cup of tea steaming beside it, perfectly peaceful.",
  23: "A stick figure gently hugs its own shoulders, looking upward into clear bright space with a serene, self-respecting smile.",
  24: "A stick figure walks along a path. When a fallen branch blocks the way, it pauses, thinks, steps neatly around it, and continues walking forward with quiet confidence.",
  25: "A stick figure raises one hand in honest greeting to a group of friends, while keeping its posture upright, authentic, and naturally relaxed.",
  26: "A stick figure steps over a high broken hurdle on the ground, leaving behind discarded masks and broken puppet strings, walking toward the horizon.",
  27: "A confident stick figure stands in the center of a wide open canvas, looking forward into the camera. It raises one thumb in warm solidarity, as a bright star sparkles beside it."
};

const STYLE_PREFIX = "Animated 2D minimalist black stick figure, clean smooth ink linework on solid pure white background (#FFFFFF). Strictly 2D flat, no 3D shading, no gradients, no shadows, no text, no subtitles, smooth hand-drawn animation style.";

const videoPrompts = items.map(item => {
  const duration = item.end - item.start;
  const targetSeconds = Math.max(4, Math.min(12, Math.round(duration)));
  const action = videoActions[item.shot] || item.prompt;
  
  const videoPrompt = `${STYLE_PREFIX} ${action}`;

  return {
    shot: item.shot,
    title: item.title,
    start: item.start,
    end: item.end,
    duration: parseFloat(duration.toFixed(3)),
    target_gen_seconds: targetSeconds,
    prompt: videoPrompt
  };
});

fs.writeFileSync(destFile, JSON.stringify(videoPrompts, null, 2), 'utf8');
console.log(`Generated ${videoPrompts.length} director video prompts at ${destFile}`);
