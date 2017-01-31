// Once your custom font has been loaded...
import React from 'react';
import { createIconSetFromFontello } from '@exponent/vector-icons';
import fontelloConfig from '../assets/fonts/hcr-config.json';

var CachedCraftIcon = null;
export default function CraftIcon(props) {
  if (!CachedCraftIcon) {
    CachedCraftIcon = createIconSetFromFontello(fontelloConfig, 'hcr');
  }
  return <CachedCraftIcon {...props} />;
}
