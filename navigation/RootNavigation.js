import React from 'react';
import {
  Text,
} from 'react-native';
import {
  Notifications,
} from 'exponent';
import {
  StackNavigation,
  TabNavigation,
  TabNavigationItem,
} from '@exponent/ex-navigation';
import {
  FontAwesome,
} from '@exponent/vector-icons';

import Router from '../navigation/Router';
import Alerts from '../constants/Alerts';
import Colors from '../constants/Colors';
import CraftIcon from '../components/CraftIcon';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

export default class RootNavigation extends React.Component {
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  render() {
    return (

      <TabNavigation
        tabBarHeight={44}
        initialTab='log'>

        <TabNavigationItem
          id='top'
          title='Top'
          renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderCraftIcon('hcr-numlist', isSelected, 'hcr-numlist-filled')}>
          <StackNavigation initialRoute={Router.getRoute('top', {'name': 'Top', 'filtered': false})} />
        </TabNavigationItem>

        <TabNavigationItem
          id='byday'
          title='By Day'
          renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderCraftIcon('hcr-weekly', isSelected, 'hcr-weekly-filled')}>
          <StackNavigation initialRoute={Router.getRoute('byday', {'name': 'By Day', 'filtered': false})} />
        </TabNavigationItem>

        <TabNavigationItem
          id='log'
          title='Log'
          renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderCraftIcon('hcr-history', isSelected)}>
          <StackNavigation initialRoute='log' />
        </TabNavigationItem>

        <TabNavigationItem
          id='notifications'
          title='Notifications'
          renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderFontAwesomeIcon('bell-o', isSelected, 'bell')}>
          <StackNavigation initialRoute='notifications' />
        </TabNavigationItem>

        <TabNavigationItem
          id='more'
          title='More'
          renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderFontAwesomeIcon('sliders', isSelected)}>
          <StackNavigation initialRoute='more' />
        </TabNavigationItem>
      </TabNavigation>
    );
  }

  _renderCraftIcon(name, isSelected, filledName = name) {
    return (
      <CraftIcon
        name={isSelected ? filledName : name}
        size={28}
        color={isSelected ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
    );
  }

  _renderFontAwesomeIcon(name, isSelected, filledName = name) {
    return (
      <FontAwesome
        name={isSelected ? filledName : name}
        size={24}
        color={isSelected ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
    );
  }

  _renderTitle = (isSelected, title, index) => {
    return (
      <Text
        style={{color: isSelected ? Colors.tabIconSelected : Colors.tabIconDefault, fontSize: 9}}
      >
        {title}
      </Text>
    );
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  _handleNotification = ({origin, data}) => {
    this.props.navigator.showLocalAlert(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`,
      Alerts.notice
    );
  }
}
