import {
  createRouter,
} from '@exponent/ex-navigation';

import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import ArticlesScreen from '../screens/ArticlesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RootNavigation from './RootNavigation';

export default createRouter(() => ({
  top: () => ArticlesScreen,
  byday: () => LinksScreen,
  log: () => HomeScreen,
  notifications: () => SettingsScreen,
  more: () => SettingsScreen,
  rootNavigation: () => RootNavigation,
}));
