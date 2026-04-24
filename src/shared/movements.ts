export type Movement = {
  id: string
  name: string
  focus: 'shoulders' | 'neck' | 'upper-back' | 'chest' | 'full-body'
  durationSeconds: number
  steps: string[]
  videoUrl?: string
}

export const MOVEMENTS: Movement[] = [
  {
    id: 'shoulder-rolls',
    name: 'Shoulder rolls',
    focus: 'shoulders',
    durationSeconds: 30,
    steps: [
      'Sit or stand tall, arms relaxed at your sides.',
      'Roll both shoulders slowly backward in a large circle.',
      'Do 10 rolls backward, then 10 rolls forward.',
    ],
    videoUrl: './movements/shoulder-rolls.mp4',
  },
  {
    id: 'neck-tilts',
    name: 'Gentle neck tilts',
    focus: 'neck',
    durationSeconds: 45,
    steps: [
      'Drop your right ear slowly toward your right shoulder.',
      'Hold for 15 seconds, breathing steadily.',
      'Return to center, then repeat on the left side.',
    ],
    videoUrl: './movements/neck-stretch.mp4',
  },
  {
    id: 'chest-opener',
    name: 'Hands-behind-back chest opener',
    focus: 'chest',
    durationSeconds: 45,
    steps: [
      'Sit or stand tall. Interlace your fingers behind your lower back, palms toward you.',
      'Straighten your arms, draw your shoulder blades down and together, lift your chest.',
      'Hold 20 seconds with slow breaths. Release, shake arms out, repeat once.',
    ],
    videoUrl: './movements/chest-opener.mp4',
  },
  {
    id: 'upper-trap',
    name: 'Upper trapezius stretch',
    focus: 'neck',
    durationSeconds: 60,
    steps: [
      'Sit tall. Reach your right hand over your head to your left ear.',
      'Gently guide your head toward your right shoulder.',
      'Hold 30 seconds per side — no forcing.',
    ],
    videoUrl: './movements/upper-trap.mp4',
  },
  {
    id: 'overhead-side-stretch',
    name: 'Overhead side stretch',
    focus: 'upper-back',
    durationSeconds: 45,
    steps: [
      'Stand or sit tall. Reach your right arm straight overhead, palm facing left.',
      'Lean gently to the left until you feel a stretch along your right side and upper back.',
      'Hold 20 seconds, return to center, then repeat on the other side.',
    ],
    videoUrl: './movements/overhead-side-stretch.mp4',
  },
  {
    id: 'cat-cow',
    name: 'Cat–cow',
    focus: 'full-body',
    durationSeconds: 60,
    steps: [
      'On hands and knees, wrists under shoulders, knees under hips.',
      'Inhale: drop belly, lift chest and tailbone (cow).',
      'Exhale: round spine, tuck chin and tailbone (cat). Flow for 60 seconds.',
    ],
    videoUrl: './movements/cat-cow.mp4',
  },
  {
    id: 'seated-twist',
    name: 'Seated spinal twist',
    focus: 'upper-back',
    durationSeconds: 60,
    steps: [
      'Sit tall with feet flat. Place right hand on the outside of your left knee.',
      'Inhale to lengthen, exhale to twist gently to the left.',
      'Hold 30 seconds, then switch sides.',
    ],
    videoUrl: './movements/seated-twist.mp4',
  },
  {
    id: 'cross-body-shoulder',
    name: 'Cross-body shoulder stretch',
    focus: 'shoulders',
    durationSeconds: 45,
    steps: [
      'Bring your right arm straight across your chest at shoulder height.',
      'Use your left hand to gently press your right arm closer to your body.',
      'Hold 20 seconds, release, then repeat on the other side.',
    ],
    videoUrl: './movements/cross-body-shoulder.mp4',
  },
  {
    id: 'forward-fold',
    name: 'Standing forward fold',
    focus: 'full-body',
    durationSeconds: 45,
    steps: [
      'Stand tall, feet hip-width apart, with a slight bend in your knees.',
      'Hinge from the hips and fold forward, letting your head and arms hang heavy.',
      'Hold 30 seconds, breathing into your lower back. Roll up slowly to stand.',
    ],
    videoUrl: './movements/forward-fold.mp4',
  },
  {
    id: 'arm-swings',
    name: 'Full arm swings',
    focus: 'shoulders',
    durationSeconds: 40,
    steps: [
      'Stand tall with both arms relaxed at your sides.',
      'Swing both arms forward and up overhead, then continue back and down behind you in one smooth circle.',
      'Do 10 circles forward, then reverse direction for 10 backward.',
    ],
    videoUrl: './movements/arm-swing.mp4',
  },
]

export function pickMovement(seed = Date.now()): Movement {
  const i = Math.abs(Math.floor(seed)) % MOVEMENTS.length
  return MOVEMENTS[i]
}
