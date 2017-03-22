import React, { Component } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Share,
  WebView,
} from 'react-native';

// for ios-share-outline
import {
  FontAwesome,
} from '@exponent/vector-icons';

import Colors from '../constants/Colors';

import MiscIcon from '../components/MiscIcon';
import NavTabBar, {
  NavBackButton,
  NavCommentsButton,
  NavDisabledCommentsButton,
  NavActionButton,
  NavReadableButton,
  NavCheckButton,
} from '../components/NavTabBar';

import extractDomain from '../utilities/extractDomain';

export default class BrowserScreen extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
      // This sets the background color for the status bar
      //backgroundColor: (params) => colorForSource(this.params.article.source)
    }
  };

  constructor(props) {
    super(props);
    this.articleId = this.props.route.params.articleId;
    const childrenCount = this.props.route.params.childrenCount;
    const domain = extractDomain(this.props.url);
    this.bgColor = Colors.hcrBackground;
    this.overlayColor = Colors.hcrBackgroundOverlay;
    this.state = {
      hasComments: childrenCount !== undefined,
      childrenCount: childrenCount,
      canGoBack: false,
      isLoading: true,
      domain: domain,
    };
  }

  onRefresh = () => {
    this.setState({isRefreshing: true});
    setTimeout(() => {
      this.setState({isRefreshing: false});
    }, 3000);
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({url: this.props.url});
    });
  }

  goBack = () => {
    this.refs.WebView.goBack();
  }

  canGoBack() {
    return this.state.canGoBack;
  }

  reload = () => {
    this.setState({isLoading: true});
    this.refs.WebView.reload();
  }

  stopLoading = () => {
    this.setState({isLoading: false});
    this.refs.WebView.stopLoading();
  }

  popArticleNav() {
    const rootNav = this.props.navigation.getNavigator('root');
    rootNav.pop();
  }

  render() {
    const loading = (
      <TouchableOpacity onPress={_ => this.stopLoading()}>
        <ActivityIndicator
          style={styles.refreshIcon}
          color={'rgba(255, 255, 255, 0.45)'}
        />
      </TouchableOpacity>
    );
    const reload = (
      <TouchableOpacity onPress={_ => this.reload()}>
        <FontAwesome
          name={'repeat'}
          size={16}
          color={'rgba(255, 255, 255, 0.45)'}
          style={styles.refreshIcon}
        />
      </TouchableOpacity>
    );

    return (
      <View style={styles.container}>
        <View style={[styles.header, {backgroundColor: this.bgColor}]}>
          <View style={{width: 30}} />
          <View style={[styles.locationBox, {backgroundColor: this.overlayColor}]}>
            <Text style={styles.locationText} numberOfLines={1}>
              {this.state.domain}
            </Text>
            {this.state.isLoading ? loading : reload}
          </View>
          <TouchableOpacity onPress={_ => this._share()}>
            <MiscIcon
              name={'misc-out'}
              size={17}
              color={'white'}
              style={styles.shareIcon}
            />
          </TouchableOpacity>
        </View>
        <WebView
          ref={'WebView'}
          source={{uri: this.state.url}}
          onNavigationStateChange={this._onNavigationStateChange}
          scalesPageToFit
          styles={styles.web}
        />
        <NavTabBar>
          <NavBackButton onPress={() => this._back()} />
          {
          this.state.hasComments ? (
            <NavCommentsButton
              count={this.state.childrenCount}
              onPress={() => this._switchToComments()}
            /> )
          : <NavDisabledCommentsButton />
          }
          <NavActionButton onPress={() => this._articleAction()} />
          <NavReadableButton
            enabled={false}
            onPress={() => this._switchToReadable()}
          />
          <NavCheckButton onPress={() => this._articleCheck()} />
        </NavTabBar>
      </View>
    );
  }

  _share() {
    const { title, url } = this.state;
    Share.share({
      message: 'Article Browsed to in HackCraft Reader',
      url,
      title
    }, {
      dialogTitle: 'Share Current Article',
    });
    // Maybe a open in Safari button?
    // Linking.openURL(this.state.url);
  }

  _onNavigationStateChange = (navState) => {
    // console.log(navState);
    const url = (
      navState.url === 'about:blank'
    ? this.props.url
    : navState.url
    );
    const changed = navState.url !== this.state.url;
    const domain = extractDomain(url);
    this.setState({
      canGoBack: navState.canGoBack,
      url: url,
      domain: domain,
      title: navState.title || url,
      isLoading: (
        navState.loading ||
        !navState.title ||
        changed ||
        navState.navigationType === 'reload'),
    });
  }

  _back = () => {
    if (this.state.canGoBack) {
      this.goBack();
    } else {
      const nav = this.props.navigation.getNavigator('commentsNav');
      if (nav.getCurrentIndex() > 0) {
        nav.pop();
        return;
      }
      this.popArticleNav();
    }
  }

  _switchToComments = () => {
    const nav = this.props.navigation.getNavigator('articleNav');
    nav.jumpToTab('comments');
  }

  _switchToReadable = () => {
    // TODO: Bring in readability.js
  }

  _articleCheck = () => {
    this.popArticleNav();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBase,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 4,
    height: 49,
  },
  locationBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 6,
    height: 20,
    width: 234,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    width: 214,
  },
  refreshIcon: {
    marginRight: 5,
  },
  shareIcon: {
    marginRight: 12,
  },
  web: {
    flex: 1
  }
});
