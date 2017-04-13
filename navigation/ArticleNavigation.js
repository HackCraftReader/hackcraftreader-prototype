import React from 'react';
import {
  View,
} from 'react-native';
import {
  StackNavigation,
  TabNavigation,
  TabNavigationItem,
} from '@exponent/ex-navigation';

import Router from '../navigation/Router';

export default class ArticleNavigation extends React.Component {

  render() {
    const {screen, itemId, url, updateCallback} = this.props.route.params;
    return (

      <TabNavigation
        ref={(tabs) => { this._tabs = tabs; }}
        id='articleNav'
        tabBarHeight={0}
        initialTab={screen}
        renderTabBar={(props) => <View />}
      >
        <TabNavigationItem id='article'>
          <StackNavigation
            id='browserNav'
            initialRoute={
              Router.getRoute('browser', {itemId, url, updateCallback})}
          />
        </TabNavigationItem>

        <TabNavigationItem id='comments'>
          <StackNavigation
            id='commentsNav'
            initialRoute={Router.getRoute('comments', {itemId, updateCallback})}
          />
        </TabNavigationItem>
      </TabNavigation>
    );
  }

  _selectedTab() {
    // TODO: remove if this is not useful. Kept for reference...
    const nav = this.props.navigation.getNavigator('articleNav');
    const navState = nav._getNavigatorState();
    return navState.routes[navState.index].key;
  }
}

