import Exponent from 'exponent';
import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import {
  NavigationProvider,
  NavigationContext,
  StackNavigation
} from '@exponent/ex-navigation';
import { FontAwesome } from '@exponent/vector-icons';

import Router from './navigation/Router';
import Store from './navigation/Store';
import cacheAssetsAsync from './utilities/cacheAssetsAsync';

import { Provider } from 'mobx-react/native';

import ItemStore from './store/ItemStore.js';
// import UserStore from './store/UserStore.js';
const stores = { ItemStore }; // In case you have more than one store

const navigationContext = new NavigationContext({
  router: Router,
  store: Store
});

class AppContainer extends React.Component {
  state = {
    appIsReady: false
  };

  componentWillMount() {
    this._loadAssetsAsync();
  }

  async _loadAssetsAsync() {
    try {
      await cacheAssetsAsync({
        images: [require('./assets/images/exponent-wordmark.png')],
        fonts: [
          FontAwesome.font,
          { hcr: require('./assets/fonts/hcr-icons-v5.ttf') },
          { misc: require('./assets/fonts/hcr-misc-icons.ttf') },
          {
            'source-code-pro': require('./assets/fonts/SourceCodePro-Regular.ttf')
          }
        ]
      });
    } catch (e) {
      console.warn(
        'There was an error caching assets (see: main.js), perhaps due to a ' +
          'network timeout, so we skipped caching. Reload the app to try again.'
      );
      console.log(e.message);
    } finally {
      this.setState({ appIsReady: true });
    }
  }

  render() {
    if (this.state.appIsReady) {
      return (
        <View style={styles.container}>
          <Provider {...stores}>
            <NavigationProvider context={navigationContext}>
              <StackNavigation
                id="root"
                initialRoute={Router.getRoute('rootNavigation')}
              />
            </NavigationProvider>
          </Provider>

          {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}
          {Platform.OS === 'android' &&
            <View style={styles.statusBarUnderlay} />}
        </View>
      );
    } else {
      return <Exponent.Components.AppLoading />;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)'
  }
});

Exponent.registerRootComponent(AppContainer);
