import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Colors from '../constants/Colors';

import CraftIcon from '../components/CraftIcon';
import { FontAwesome } from '@exponent/vector-icons';

export const Tags = {
  TagPurple: {
    code: 'p',
    color: '#8C88FF',
    label: 'Wise Words',
    shortLabel: 'WW',
  },

  TagOrange: {
    code: 'o',
    color: '#FCAB52',
    label: 'I Could Use This',
    shortLabel: 'ICUT',
  },

  TagRed: {
    code: 'r',
    color: '#FF3366',
    label: 'Return with Time',
    shortLabel: 'RwT',
  },

  TagGreen: {
    code: 'g',
    color: '#4FD2C2',
    label: 'Subject of Interest',
    shortLabel: 'SoI',
  }
};

export function tagByCode(code) {
  for (const key in Tags) {
    const tag = Tags[key];
    if (tag.code === code) {
      return tag;
    }
  }
  console.warn('Lookuping up invalid tag: ' + code);
  return null;
}

export function TagButton({color, label, toggled, width}) {
  var buttonStyle = { borderColor: color };
  if (toggled) {
    buttonStyle.backgroundColor = color;
  }
  if (width) {
    buttonStyle.width = width;
  } else {
    buttonStyle.flex = 1; // Auto-expand
  }
  var labelStyle = { color: toggled ? 'white' : color };

  return (
    <View style={[styles.tagToggleButton, buttonStyle]}>
      <Text style={[styles.tagToggleLabel, labelStyle]}>
        {label}
      </Text>
    </View>
  );
}

export function NoteButton({toggled, width}) {
  const color = Colors.note;
  const label = 'Has Note';
  var buttonStyle = {
    borderColor: color
  };
  if (toggled) {
    buttonStyle.backgroundColor = color;
  }
  if (width) {
    buttonStyle.width = width;
  } else {
    buttonStyle.flex = 1; // Auto-expand
    buttonStyle.justifyContent = 'center';
  }
  var iconColor = toggled ? 'white' : color;
  var labelStyle = {
    fontSize: 14,
    color: iconColor
  };
  return (
    <View style={[styles.tagToggleButton, buttonStyle]}>
      <View style={{flexDirection: 'row'}}>
        <FontAwesome
          name='sticky-note-o'
          size={14}
          color={iconColor}
          style={{marginTop: 1, marginRight: 5}}
        />
        <Text style={labelStyle}>
          {label}
        </Text>
      </View>
    </View>
  );
}

export function TagToggle(props) {
  const {tag, toggled, onPress, hitSlopValue} = props;

  const h = hitSlopValue || 0;
  const hitSlop = { top: h, bottom: h, left: h, right: h };

  return (
    <TouchableOpacity onPress={onPress} hitSlop={hitSlop}>
      <TagButton
        color={tag.color}
        label={tag.label}
        toggled={toggled}
        width={140}
      />
    </TouchableOpacity>
  );
}

export function FilterTag(props) {
  const {tag, toggled} = props;
  var tagStyle = {
    height: 18,
    borderColor: tag.color,
    borderWidth: StyleSheet.hairlineWidth,
  };
  if (toggled) {
    tagStyle.backgroundColor = tag.color;
  }
  var textColor = toggled ? 'white' : tag.color;
  return (
    <View style={[styles.tag, tagStyle]}>
      <Text style={{fontSize: 14, color: textColor}}>
        {tag.shortLabel}
      </Text>
    </View>
  );
}

export function FilterNote({toggled}) {
  var tagStyle = {
    height: 18,
    borderColor: Colors.note,
    borderWidth: StyleSheet.hairlineWidth,
  };
  if (toggled) {
    tagStyle.backgroundColor = Colors.note;
  }
  var iconColor = toggled ? 'white' : Colors.note;
  return (
    <View style={[styles.tag, tagStyle]}>
      <FontAwesome
        name='sticky-note-o'
        size={14}
        color={iconColor}
        style={{marginTop: 1, paddingLeft: 0, paddingRight: 0}}
      />
    </View>
  );
}

export function ItemTag({label, color, toggled = true}) {
  var tagStyle = {
    borderColor: color,
    borderWidth: StyleSheet.hairlineWidth,
  };
  if (toggled) {
    tagStyle.backgroundColor = color;
  }
  var textColor = toggled ? 'white' : color;
  return (
    <View style={[styles.tag, tagStyle]}>
      <Text style={{fontSize: 12, color: textColor}}>
        {label}
      </Text>
    </View>
  );
}

export function PinnedTag() {
  return (
    <View style={[styles.tag, {backgroundColor: Colors.pinned}]}>
      <CraftIcon
        name='hcr-pin'
        size={12}
        color={'white'}
        style={{marginTop: 2, marginLeft: -1}}
      />
      <Text style={{fontSize: 12, color: 'white'}}>
        Pinned
      </Text>
    </View>
  );
}

export function NoteTag({label}) {
  return (
    <View style={[styles.tag, {backgroundColor: Colors.note}]}>
      <FontAwesome
        name='sticky-note-o'
        size={12}
        color={'white'}
        style={{marginTop: 1, paddingLeft: 1, paddingRight: 2}}
      />
      <Text style={{fontSize: 12, color: 'white'}}>
        {label}
      </Text>
    </View>
  );
}

export function SnoozedTag({label}) {
  return (
    <View style={[styles.tag, {backgroundColor: Colors.snoozed}]}>
      <FontAwesome
        name='clock-o'
        size={12}
        color={'white'}
        style={{marginTop: 1, paddingLeft: 1, paddingRight: 2}}
      />
      <Text style={{fontSize: 12, color: 'white'}}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tagToggleButton: {
    flexDirection: 'row',
    width: 140,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 5,
  },
  tagToggleLabel: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center'
  },
  tag: {
    borderRadius: 3,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 2,
    flex: -1,
    flexDirection: 'row',
    height: 15,
  },  
});
