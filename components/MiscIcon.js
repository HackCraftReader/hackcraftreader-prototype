// Once your custom font has been loaded...
import React from 'react';
import createIconSet from 'react-native-vector-icons/lib/create-icon-set';
import { Font } from 'exponent';

const glyphMap = {
  'misc-action': '\x61',
  'misc-swipe-list': '\x62',
  'misc-sun-half': '\x63',
  'misc-sun-full': '\x64',
  'misc-pin': '\x65',
  'misc-group-list': '\x66',
  'misc-couch': '\x67',
  'misc-comment-1': '\x68',
  'misc-check-list': '\x69',
  'misc-check-all': '\x6a',
  'misc-check': '\x6b',
  'misc-action-filled': '\x6c',
  'misc-ios-arrow-back': '\x6d',
  'misc-left-open-big': '\x6e',
  'misc-ios-arrow-forward': '\x6f',
  'misc-ios-bell': '\x70',
  'misc-ios-bell-outline': '\x71',
  'misc-right-open-big': '\x72',
  'misc-ios-world-outline': '\x73',
  'misc-ios-world': '\x74',
  'misc-earth': '\x75',
  'misc-comment': '\x76',
  'misc-comment-discussion': '\x77',
  'misc-android-list': '\x78',
  'misc-android-globe': '\x79',
  'misc-android-options': '\x7a',
  'misc-android-person': '\x41',
  'misc-android-share': '\x42',
  'misc-edit': '\x43',
  'misc-compose': '\x44',
  'misc-ios-arrow-left': '\x45',
  'misc-ios-arrow-right': '\x46',
  'misc-ios-checkmark-outline': '\x47',
  'misc-ios-checkmark': '\x48',
  'misc-ios-contact-outline': '\x49',
  'misc-ios-flame': '\x4a',
  'misc-ios-flame-outline': '\x4b',
  'misc-ios-download': '\x4c',
  'misc-ios-download-outline': '\x4d',
  'misc-ios-paper-outline': '\x4e',
  'misc-ios-paper': '\x4f',
  'misc-ios-search': '\x50',
  'misc-ios-search-strong': '\x51',
  'misc-ios-upload': '\x52',
  'misc-ios-upload-outline': '\x53',
  'misc-ios-clock-outline': '\x54',
  'misc-ios-close-outline': '\x55',
  'misc-ios-close-empty': '\x56',
  'misc-ios-compose': '\x57',
  'misc-ios-compose-outline': '\x58',
  'misc-ios-home': '\x59',
  'misc-ios-home-outline': '\x5a',
  'misc-ios-gear': '\x30',
  'misc-ios-gear-outline': '\x31',
  'misc-ios-information': '\x32',
  'misc-ios-information-empty': '\x33',
  'misc-ios-information-outline': '\x34',
  'misc-ios-reload': '\x35',
  'misc-out': '\x36',
  'misc-level-down': '\x37',
  'misc-action-text': '\x38',
};

var CachedMiscIcon = null;
export default function MiscIcon(props) {
  if (!CachedMiscIcon) {
    CachedMiscIcon = createIconSet(glyphMap, Font.style('misc').fontFamily);
  }
  return <CachedMiscIcon {...props} />;
}
