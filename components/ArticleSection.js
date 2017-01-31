import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import Colors from '../constants/Colors';
import CraftIcon from '../components/CraftIcon';
import { FontAwesome } from '@exponent/vector-icons';

export default class ArticleSection extends React.Component {
  render() {
    const iconName = this.props.section.iconName;
    const title = this.props.section.title;
    return (
      <View style={styles.container}>
        <Text style={styles.sectionText}>
          <FontAwesome
            name={iconName}
            size={16}
          />
          {' ' + title}
        </Text>
        <TouchableOpacity onPress={() => this.props.checkAll(this.props.section)}>
          <CraftIcon
            name='hcr-check-all'
            size={30}
            color={Colors.sectionText}
            style={{marginVertical: -3, backgroundColor: 'transparent'}}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: Colors.screenBase,
    height: 33,
    paddingLeft: 11,
    paddingRight: 6,
    paddingBottom: 2,
    borderBottomColor: Colors.sectionBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.sectionBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionText: {
    fontSize: 16,
    color: Colors.sectionText,
  }
});
