//mypreset.ts
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      '50': '#edf2f7',
      '100': '#dbe6f0',
      '200': '#b8cce0',
      '300': '#94b2d1',
      '400': '#7099c2',
      '500': '#4d7fb3',
      '600': '#3d668f',
      '700': '#2e4c6b',
      '800': '#1f3347',
      '900': '#0f1924',
      '950': '#0b1219',
    },
  },
});

export default MyPreset;
