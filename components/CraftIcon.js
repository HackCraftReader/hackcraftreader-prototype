// Once your custom font has been loaded...
import { createIconSetFromFontello } from '@exponent/vector-icons';
import fontelloConfig from '../assets/fonts/hcr-config.json';

var CraftIcon = null;
export default function createCraftIcon(){
  if (!CraftIcon) {
    CraftIcon = createIconSetFromFontello(fontelloConfig, 'hcr');
  }
  return CraftIcon;
}
