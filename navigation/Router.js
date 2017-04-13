import {
  createRouter,
} from '@exponent/ex-navigation';

import ArticlesScreen from '../screens/ArticlesScreen';
import CommentsScreen from '../screens/CommentsScreen';
import BrowserScreen from '../screens/BrowserScreen';
import LogScreen from '../screens/LogScreen';

import ActionScreen from '../screens/ActionScreen';

//import SearchScreen from '../screens/SearchScreen';
//import LogScreen from '../screens/SearchScreen';
//import NotificationsScreen from '../screens/NotificationsScreen';
//import MoreScreen from '../screens/MoreScreen';

// TODO: Remove/replace
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';

import RootNavigation from './RootNavigation';
import ArticleNavigation from './ArticleNavigation';

// We pass our mobx items through routes currently
const routerOption = {
  ignoreSerializableWarnings: true
};

export default createRouter(() => ({
  top: () => ArticlesScreen,
  byday: () => ArticlesScreen,
  log: () => LogScreen,
  notifications: () => LinksScreen,
  more: () => SettingsScreen,
  rootNavigation: () => RootNavigation,

  action: () => ActionScreen,

  articleNavigation: () => ArticleNavigation,
  comments: () => CommentsScreen,
  browser: () => BrowserScreen,
}), routerOption);
