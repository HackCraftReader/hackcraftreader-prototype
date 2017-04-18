import { createNavigationEnabledStore, NavigationReducer } from '@exponent/ex-navigation';
import { combineReducers, applyMiddleware, createStore } from 'redux';

import EventStore, {Event} from '../store/EventStore';

const navigationStateKey = 'navigation';

// gets the current screen from navigation state
function getCurrentScreen(getStateFn) {
  const navigationState = getStateFn()[navigationStateKey];
  // navigationState can be null when exnav is initializing
  if (!navigationState) return {};

  const { currentNavigatorUID, navigators } = navigationState;
  if (!currentNavigatorUID || !navigators[currentNavigatorUID]) return {};

  const { index, routes } = navigators[currentNavigatorUID];
  if (!routes[index]) return {};
  const { routeName, params } = routes[index];
  return {routeName, params};
}

let timeStarted  = null;

const screenTracking = ({ getState }) => next => action => {
  if (!action.type.startsWith('EX_NAVIGATION')) return next(action);
  const {routeName: currentScreen, params: curParams} = getCurrentScreen(getState);
  const result = next(action);
  const {routeName: nextScreen} = getCurrentScreen(getState);
  if (nextScreen !== currentScreen) {
    if (nextScreen === 'comments' || nextScreen === 'browser') {
      timeStarted = new Date();
    }
    if (currentScreen === 'comments' || currentScreen === 'browser') {
      const {itemId} = curParams;
      const spent = (new Date() - timeStarted) / 1000;
      const on = currentScreen === 'comments' ? 'comments' : 'article';
      if (spent > 5) {
        EventStore.add(itemId, itemId, Event.TimeSpent, {spent, on});
      }
    }
  }
  return result;
};

const createStoreWithNavigation = createNavigationEnabledStore({
  createStore,
  navigationStateKey,
});

const store = createStoreWithNavigation(
  /* combineReducers and your normal create store things here! */
  combineReducers({
    navigation: NavigationReducer,
    // other reducers
  }),
  applyMiddleware(screenTracking)
);

export default store;
