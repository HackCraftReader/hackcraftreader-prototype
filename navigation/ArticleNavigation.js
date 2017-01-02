import React from 'react';
import {
  Text,
} from 'react-native';
import {
  StackNavigation,
  TabNavigation,
  TabNavigationItem,
} from '@exponent/ex-navigation';
import {
  FontAwesome,
} from '@exponent/vector-icons';

import Router from '../navigation/Router';
import Colors from '../constants/Colors';
import createCraftIcon from '../components/CraftIcon';

export default class ArticleNavigation extends React.Component {

  render() {
    const initialTab = this.props.route.params.screen;
    const article = this.props.route.params.article;
    return (

      <TabNavigation
        tabBarHeight={44}
        initialTab={initialTab}>

        <TabNavigationItem id='article' title='article'>
          <StackNavigation
            id='browser'
            initialRoute={Router.getRoute('browser', {'article': article})}
          />
        </TabNavigationItem>

        <TabNavigationItem id='comments' title='browser'>
          <StackNavigation
            id='comments'
            initialRoute={Router.getRoute('comments', {'article': article})}
          />
        </TabNavigationItem>
      </TabNavigation>
    );
  }

  _renderCraftIcon(name, isSelected, filledName = name) {
    const CraftIcon = createCraftIcon();
    return (
      <CraftIcon
        name={isSelected ? filledName : name}
        size={28}
        color={isSelected ? Colors.tabIconSelected : Colors.tabIconDefault}
        style={{marginVertical: -2, backgroundColor: 'transparent'}}
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
}
