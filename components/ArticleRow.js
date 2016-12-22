import React from 'react';
import {Text, StyleSheet, TouchableOpacity, TouchableHighlight, View} from 'react-native';
import createCraftIcon from '../components/CraftIcon';
import Colors from '../constants/Colors';

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    if (domain.startsWith("www.")) {
        domain = domain.slice(4);
    }
    if (domain) {
        domain = ` (${domain})`;
    }

    return domain;
}

export class ArticleRow extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const article = this.props.article;
        const CraftIcon = createCraftIcon();
        const up_icon = <TouchableOpacity style={styles.upvoteIconTouch} onPress={() => alert('upvote!')}>
                            <CraftIcon name="hcr-upvote-filled" size={13} color="#4FD2C2" style={styles.upvoteIcon}/>
                        </TouchableOpacity>;
        const upvote = //<TouchableOpacity style={styles.upvoteTextTouch}>
                            <Text style={styles.upvoteText} onPress={() => alert('upvote!')}>upvote</Text>
                       // </TouchableOpacity>
        const domain = extractDomain(article.url);
        const slop = {top: 0, bottom: 0, left: 5, right: 0};
        const comment = <TouchableOpacity style={styles.commentIconTouch} hitSlop={slop} onPress={() => alert('comments!')}>
                            <View style={{flex:1}}>
                            <CraftIcon name="hcr-comment" size={37} color={Colors.tabIconSelected} style={styles.commentIcon}/>
                            <Text style={styles.commentText}>{article.children.length}</Text>
                            </View>
                        </TouchableOpacity>;
        //style={{marginVertical:-2, backgroundColor: 'transparent'}}
        //debugger;
        return (
            <View style={styles.container}>
              <View style={styles.left}><Text style={styles.rankText}>{article.rank}</Text></View>
              <View style={styles.center}>
                <View style={{flexDirection: 'column'}}>
                    <TouchableOpacity><Text style={styles.articleTitle}>{article.title}<Text style={styles.articleDomain}>{domain}</Text></Text></TouchableOpacity>
                    <Text style={styles.articleAttributes}>{article.when} • {up_icon} {article.points}  • {upvote}</Text>
                </View>
              </View>
              <View style={styles.right}>{comment}</View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
    },
    left: {
        marginLeft: 15,
        width: 30,
        paddingRight: 5,
        paddingTop: 8,
         borderBottomColor: '#C8C7CC',
        borderBottomWidth: StyleSheet.hairlineWidth,    
    },
    right: {
        width: 45,
        padding: 5,
        paddingTop: 8,
        borderBottomColor: '#C8C7CC',
        borderBottomWidth: StyleSheet.hairlineWidth,        
    },
    center: {
        flex: 1,
        paddingTop: 8,
        paddingBottom: 8,
        borderBottomColor: '#C8C7CC',
        borderBottomWidth: StyleSheet.hairlineWidth,        
    },
    rankText: {
        color: "#95989A",
        textAlign: 'center',
        fontSize: 16,
    },
    articleTitle:{
        color: "#414141",
        fontSize: 16,
        paddingBottom: 4,
    },
    articleDomain: {
        color: "#95989A",
        fontSize: 15,
    },
    articleAttributes: {
        color: "#95989A",
        fontSize: 13,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15
    },
    upvoteIconTouch: {
        width:14,
        height:14,
    },
    upvoteIcon: {
        marginTop: 3,
    },
    upvoteTextTouch: {
        width:60,
        height:14,
    },
    upvoteText: {
       // marginTop: 2,
        color: "#95989A",
        fontSize: 13,
    },
    commentIconTouch: {
        flex: 1,
    },
    commentIcon: {
        marginTop: -2,
        zIndex: 0,
    },
    commentText: {
        zIndex: 1,
        position: 'absolute',
        top: 10,
        left: 4,
        width: 28,
        backgroundColor: 'transparent',
        textAlign: 'center',
        color: Colors.tabIconSelected,
        fontSize: 10,
    },
});
