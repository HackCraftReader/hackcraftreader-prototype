import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  Ionicons,
} from '@exponent/vector-icons';

import Colors from '../constants/Colors';
import CraftIcon from '../components/CraftIcon';

const NavIconProps = {
  size: 30,
  color: Colors.tabIconAction
};

function NavCraftButton(props) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      delayPressIn={0}
      style={styles.tabItem}>
      <CraftIcon
        name={props.name}
        {...NavIconProps}
      />
    </TouchableOpacity>
  );
}

function NavIonButton(props) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      delayPressIn={0}
      style={styles.tabItem}>
      <Ionicons
        name={props.name}
        {...NavIconProps}
        style={{marginTop: 2, backgroundColor: 'transparent'}}
      />
    </TouchableOpacity>
  );
}

export function NavCommentsButton(props) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      delayPressIn={0}
      style={styles.tabItem}>
      <View style={{flex: 1}}>
        <CraftIcon
          name='hcr-comment'
          {...NavIconProps}
          style={styles.commentIcon}
        />
        <Text style={styles.commentText}>
          {props.count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function NavBackButton(props) {
  return NavIonButton({...props, name: 'ios-arrow-back-outline'});
}

export function NavArticleButton(props) {
  return NavIonButton({...props, name: 'ios-globe-outline'});
}

export function NavCreateButton(props) {
  return NavIonButton({...props, name: 'ios-create-outline'});
}

export function NavReadableButton(props) {
  if (props.enabled) {
    return NavIonButton({...props, name: 'ios-paper-outline'});
  } else {
    return (
      <View style={styles.tabItem}>
        <Ionicons
          name='ios-paper-outline'
          size={30}
          color={Colors.disabledItem}
          style={{marginTop: 2, backgroundColor: 'transparent'}}
        />
      </View>
    );
  }
}

export function NavActionButton(props) {
  return NavCraftButton({...props, name: 'hcr-action'});
}

export function NavCheckButton(props) {
  return NavCraftButton({...props, name: 'hcr-check'});
}

export default function NavTabBar(props) {
  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, props.style]}>
        <View style={styles.itemContainer}>
          {props.children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    height: 44,
  },
  translucentUnderlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  innerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopColor: '#b2b2b2',
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: Colors.tabBar,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 18,
    backgroundColor: 'black',
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentIcon: {
    marginTop: 6,
    zIndex: 0,
  },
  commentText: {
    zIndex: 1,
    position: 'absolute',
    top: 14,
    left: 1,
    width: 28,
    backgroundColor: 'transparent',
    textAlign: 'center',
    color: Colors.tabIconAction,
    fontSize: 10,
  },
});
