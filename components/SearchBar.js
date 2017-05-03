import React, { Component } from 'react';
import { View, StyleSheet, TextInput, Platform } from 'react-native';

import { Ionicons } from '@exponent/vector-icons';
import Colors from '../constants/Colors';

class Search extends Component {
  clearText = () => {
    const ref = this.props.textInputRef;
    this.refs[ref].clear();
    this.props.onChangeText('');
  };

  render() {
    const {
      /* inherited props */
      value,
      autoCapitalize,
      autoCorrect,
      autoFocus,
      blurOnSubmit,
      defaultValue,
      editable,
      keyboardType,
      maxLength,
      multiline,
      onBlur,
      onChange,
      onChangeText,
      onContentSizeChange,
      onEndEditing,
      onFocus,
      onLayout,
      onSelectionChange,
      onSubmitEditing,
      placeholder,
      placeholderTextColor,
      returnKeyType,
      secureTextEntry,
      selectTextOnFocus,
      selectionColor,
      inlineImageLeft,
      inlineImagePadding,
      numberOfLines,
      returnKeyLabel,
      clearButtonMode,
      clearTextOnFocus,
      dataDetectorTypes,
      enablesReturnKeyAutomatically,
      keyboardAppearance,
      onKeyPress,
      selectionState,
      isFocused,
      clear,
      textInputRef,
      containerRef,
      underlineColorAndroid
    } = this.props;
    return (
      <View ref={containerRef} style={styles.container}>
        <TextInput
          ref={textInputRef}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoFocus={autoFocus}
          blurOnSubmit={blurOnSubmit}
          defaultValue={defaultValue}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          onBlur={onBlur}
          onChange={onChange}
          onChangeText={onChangeText}
          onContentSizeChange={onContentSizeChange}
          onEndEditing={onEndEditing}
          onFocus={onFocus}
          onLayout={onLayout}
          onSelectionChange={onSelectionChange}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry}
          selectTextOnFocus={selectTextOnFocus}
          inlineImageLeft={inlineImageLeft}
          inlineImagePadding={inlineImagePadding}
          numberOfLines={numberOfLines}
          returnKeyLabel={returnKeyLabel}
          clearButtonMode={clearButtonMode}
          clearTextOnFocus={clearTextOnFocus}
          dataDetectorTypes={dataDetectorTypes}
          enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
          keyboardAppearance={keyboardAppearance}
          onKeyPress={onKeyPress}
          selectionState={selectionState}
          editable={editable}
          isFocused={isFocused}
          clear={clear}
          selectionColor={selectionColor || Colors.lightGray}
          value={value}
          underlineColorAndroid={underlineColorAndroid || 'transparent'}
          style={styles.input}
        />
        <Ionicons
          size={20}
          style={styles.searchIcon}
          name="ios-search-outline"
          color={Colors.lightGray}
        />
        <Ionicons
          size={20}
          style={styles.clearIcon}
          name="ios-close"
          onPress={this.clearText}
          color={Colors.lightGray}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    backgroundColor: 'transparent'
  },
  input: {
    paddingLeft: 26,
    paddingRight: 19,
    margin: 8,
    borderRadius: 3,
    overflow: 'hidden',
    fontSize: 16,
    height: 40,
    ...Platform.select({
      ios: {
        height: 30
      },
      android: {
        borderWidth: 0
      }
    }),
    backgroundColor: 'white',
    color: '#414141'
  },
  searchIcon: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 13,
    top: 12.5,
    ...Platform.select({
      android: {
        top: 20
      }
    })
  },
  clearIcon: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 18,
    top: 12.5,
    ...Platform.select({
      android: {
        top: 17
      }
    })
  }
});

export default Search;
