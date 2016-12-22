import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
  ListView,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@exponent/vector-icons';

import moment from 'moment/src/moment'; // Moment ES6 workaround
import Colors from '../constants/Colors';

import { ArticleRow } from '../components/ArticleRow';

import { 
  SwipeListView 
} from 'react-native-swipe-list-view';

import MaterialSwitch from 'react-native-material-switch';

const LEFT_BUTTON_HIT_SLOP = { top: 0, bottom: 0, left: 0, right: 30 };

var filtered = false;

export default class ArticlesScreen extends React.Component {
  static switchButton() { 
    return <Ionicons
          name='md-checkmark'
          size={14}
          color='white'
          style={{backgroundColor: 'transparent'}}
          />;
  }
  static route = {
    navigationBar: {
      title: 'Top',
      backgroundColor: '#4FD2C2',
      tintColor: 'white',
      height: 64,
      renderLeft: (route, props) => (
        <TouchableOpacity
        onPress={() => {console.log("menu pressed"); console.log(route); console.log(props);}}
        hitSlop={LEFT_BUTTON_HIT_SLOP}
        style={buttonStyles.buttonContainer}
        >
          <Ionicons
          name='md-menu'
          size={24}
          color='white'
          style={buttonStyles.button}
          />
        </TouchableOpacity>
        ),
      renderRight: (route, props) => (
        <View style={{flexDirection: 'row', flex: 1, justifyContent: 'flex-end', width: 100, height: 45, alignItems: 'center',}}>
        <MaterialSwitch value={filtered} onValueChange={(state)=>{filtered = state}}
          inactiveButtonColor='#42AC9F'
          activeButtonColor='#F1F1F1'
          buttonRadius={10}
          switchWidth={30}
          switchHeight={14}
          width={35}
          buttonContent={ArticlesScreen.switchButton()}
          />
        <TouchableOpacity
        onPress={this._openOptions}
        width={24}
        style={buttonStyles.buttonContainer}
        >
          <Ionicons
          name='ios-search'
          size={24}
          color='white'
          
          />
        </TouchableOpacity>
        </View>
        )
    },
  }

  static staticTopStories = require('../assets/hackernews/topStories.json');
  static staticStoriesMeta = require('../assets/hackernews/meta.json');

  constructor(props) {
		super(props);
		this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var stories = ArticlesScreen.staticTopStories;
    stories.forEach((story,index) => {
      story.rank = index+1;
      story.when = moment(story.created_at_i * 1000).from(Number(ArticlesScreen.staticStoriesMeta.now_i * 1000));
    });
		this.state = {
      isRefreshing: false,
			basic: true,
      stories: stories,
		};
	}

  onRefresh = () => {
    this.setState({isRefreshing: true});
    setTimeout(() => {
      this.setState({isRefreshing: false});
    }, 3000);
  }

  render() {
    console.log(ArticleRow);
    return (
        <SwipeListView
            style={styles.container}
            contentContainerStyle={this.props.route.getContentContainerStyle()}
            dataSource={this.ds.cloneWithRows(this.state.stories)}
            renderRow={ data => ( <ArticleRow article={data}/> ) }
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this._onRefresh}
               />
            }
            renderHiddenRow={ data => (
                <View style={styles.rowBack}>
                    <Text>Left</Text>
                    <Text>Right</Text>
                </View>
            )}
            leftOpenValue={75}
            rightOpenValue={-75}
        />
    ); 
  }

  _openOptions() { console.log("open sesame"); }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //paddingTop: 15,
  },
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
	borderBottomColor: 'black',
	borderBottomWidth: 1,
	justifyContent: 'center',
	height: 50,
  },
  rowBack: {
    alignItems: 'center',
		backgroundColor: '#DDD',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
  }
});

const buttonStyles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    margin: 16,
  },
});