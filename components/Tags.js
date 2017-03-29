import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const Tags = {
  TagPurple: {
    code: 'p',
    color: '#8C88FF',
    label: 'Wise Words'
  },

  TagOrange: {
    code: 'o',
    color: '#FCAB52',
    label: 'I Could Use This',
  },

  TagRed: {
    code: 'r',
    color: '#FF3366',
    label: 'Return with Time',
  },

  TagGreen: {
    code: 'g',
    color: '#4FD2C2',
    label: 'Subject of Interest',
  }
};

export function TagToggle(props) {
  const {tag, toggled, onPress, hitSlopValue} = props;

  const h = hitSlopValue || 0;
  const hitSlop = { top: h, bottom: h, left: h, right: h };

  var buttonStyle = { borderColor: tag.color };
  if (toggled) {
    buttonStyle.backgroundColor = tag.color;
  }
  var labelStyle = { color: toggled ? 'white' : tag.color };
  return (
    <TouchableOpacity onPress={onPress} hitSlop={hitSlop}>
      <View style={[styles.tagToggleButton, buttonStyle]}>
        <Text style={[styles.tagToggleLabel, labelStyle]}>
          {tag.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tagToggleButton: {
    width: 140,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 5,
  },
  tagToggleLabel: {
    fontSize: 14,
    textAlign: 'center'
  }
});
