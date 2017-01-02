import {
  createRouter,
} from '@exponent/ex-navigation';

import ArticlesScreen from '../screens/ArticlesScreen';
import CommentsScreen from '../screens/CommentsScreen';
import BrowserScreen from '../screens/BrowserScreen';

//import SearchScreen from '../screens/SearchScreen';
//import LogScreen from '../screens/SearchScreen';
//import NotificationsScreen from '../screens/NotificationsScreen';
//import MoreScreen from '../screens/MoreScreen';

// TODO: Remove/replace
import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';

import RootNavigation from './RootNavigation';
import ArticleNavigation from './ArticleNavigation';

export default createRouter(() => ({
  top: () => ArticlesScreen,
  byday: () => ArticlesScreen,
  log: () => HomeScreen,
  notifications: () => LinksScreen,
  more: () => SettingsScreen,
  rootNavigation: () => RootNavigation,

  articleNavigation: () => ArticleNavigation,
  comments: () => CommentsScreen,
  browser: () => BrowserScreen,
}));
