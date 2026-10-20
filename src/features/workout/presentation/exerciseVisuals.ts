import dayOneVisuals from './assets/exercises/day-1.jpg'
import dayTwoVisuals from './assets/exercises/day-2.jpg'
import dayThreeVisuals from './assets/exercises/day-3.jpg'
import dayFourVisuals from './assets/exercises/day-4.jpg'

export interface ExerciseVisual {
  source: string
  alt: string
  crop: { x: number; y: number; width: number; height: number }
}

export const exerciseSheetSize = { width: 1536, height: 1024 }

type ImageBounds = readonly (readonly [start: number, end: number])[]

function sheetVisual(source: string, columns: ImageBounds, rows: ImageBounds) {
  return (column: number, row: number, alt: string): ExerciseVisual => {
    const [left, right] = columns[column]
    const [top, bottom] = rows[row]
    // Inset the measured panels to keep separator pixels out when scaled.
    const inset = 2
    return {
      source,
      alt,
      crop: {
        x: left + inset,
        y: top + inset,
        width: right - left - inset * 2,
        height: bottom - top - inset * 2,
      },
    }
  }
}

const fourColumns: ImageBounds = [
  [0, 380],
  [387, 765],
  [772, 1149],
  [1157, 1536],
]
const dayOne = sheetVisual(
  dayOneVisuals,
  [
    [0, 507],
    [516, 1020],
    [1030, 1536],
  ],
  [
    [0, 486],
    [495, 1024],
  ],
)
const dayTwo = sheetVisual(dayTwoVisuals, fourColumns, [
  [0, 480],
  [486, 1024],
])
const dayThree = sheetVisual(dayThreeVisuals, fourColumns, [
  [0, 474],
  [482, 1024],
])
const dayFour = sheetVisual(dayFourVisuals, fourColumns, [
  [0, 493],
  [500, 1024],
])

export const exerciseVisuals: Record<string, ExerciseVisual> = {
  'barbell-squat': dayOne(0, 0, 'Barbell squat exercise demonstration'),
  'romanian-deadlift': dayOne(1, 0, 'Romanian deadlift exercise demonstration'),
  'dumbbell-lunges': dayOne(2, 0, 'Dumbbell lunge exercise demonstration'),
  'dumbbell-step-up': dayOne(0, 1, 'Dumbbell step-up exercise demonstration'),
  'calf-raises': dayOne(1, 1, 'Standing calf raise exercise demonstration'),
  plank: dayOne(2, 1, 'Forearm plank exercise demonstration'),
  'barbell-bench-press': dayTwo(0, 0, 'Barbell bench press exercise demonstration'),
  'one-arm-dumbbell-row': dayTwo(1, 0, 'One-arm dumbbell row exercise demonstration'),
  'incline-dumbbell-press': dayTwo(2, 0, 'Incline dumbbell press exercise demonstration'),
  'pull-up': dayTwo(3, 0, 'Pull-up exercise demonstration'),
  'lateral-raises': dayTwo(0, 1, 'Dumbbell lateral raise exercise demonstration'),
  'ez-bar-curl': dayTwo(1, 1, 'EZ-bar curl exercise demonstration'),
  'cable-triceps-extension': dayTwo(2, 1, 'Cable triceps extension exercise demonstration'),
  'overhead-dumbbell-extension': dayTwo(3, 1, 'Overhead dumbbell triceps extension exercise demonstration'),
  'barbell-hip-thrust': dayThree(0, 0, 'Barbell hip thrust exercise demonstration'),
  'leg-press': dayThree(1, 0, 'Leg press exercise demonstration'),
  'leg-curl': dayThree(2, 0, 'Seated leg curl exercise demonstration'),
  'bulgarian-split-squat': dayThree(3, 0, 'Bulgarian split squat exercise demonstration'),
  'hip-abduction': dayThree(0, 1, 'Cable hip abduction exercise demonstration'),
  'hip-adduction': dayThree(1, 1, 'Cable hip adduction exercise demonstration'),
  'leg-raises': dayThree(2, 1, 'Hanging knee raise exercise demonstration'),
  'pull-up-lat-pulldown': dayFour(0, 0, 'Lat pulldown exercise demonstration'),
  'incline-barbell-press': dayFour(1, 0, 'Incline barbell press exercise demonstration'),
  'barbell-row': dayFour(2, 0, 'Barbell row exercise demonstration'),
  'pec-deck': dayFour(3, 0, 'Pec deck exercise demonstration'),
  'face-pull': dayFour(0, 1, 'Cable face pull exercise demonstration'),
  'hammer-curl': dayFour(1, 1, 'Dumbbell hammer curl exercise demonstration'),
  'ez-bar-skull-crushers': dayFour(2, 1, 'EZ-bar skull crusher exercise demonstration'),
}
