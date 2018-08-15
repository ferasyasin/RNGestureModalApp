/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  GestureResponderEvent,
  PanResponder,
  PanResponderInstance,
  PanResponderGestureState,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const height = Dimensions.get('window').height;
const navigationBarHeight = 70;
const secondScreenCollapsedHeight = 100;
const secondScreenCollapsedOffsetY = height - secondScreenCollapsedHeight;
const secondScreenVisibleOffsetY = navigationBarHeight;
const secondScreenCollapsedToValue = { x: 0, y: 0 };
const secondScreenVisibleToValue = { x: 0, y: secondScreenVisibleOffsetY - secondScreenCollapsedOffsetY };

type Props = {};
type State = {
  isSecondScreen: boolean;
  secondScreenOffsetAnimation: Animated.ValueXY;
  isTransitioning: boolean;
  scrollViewContentOffsetY: number;
};
export default class App extends Component<Props, State> {
  panResponder: PanResponderInstance;
  transformValue: { x: number; y: number };

  constructor(props: any) {
    super(props);
    this.state = {
      isSecondScreen: false,
      secondScreenOffsetAnimation: new Animated.ValueXY({ x: 0, y: 0 }),
      isTransitioning: false,
      scrollViewContentOffsetY: 0,
    };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetResponder,
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
    });
  }

  componentWillMount() {
    this.transformValue = { x: 0, y: 0 };
    this.state.secondScreenOffsetAnimation.addListener((value) => (this.transformValue = value));
  }

  onStartShouldSetResponder = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (this.state.isTransitioning) {
      return false;
    }
    if (this.state.isSecondScreen) {
      return false;
    }
    return true;
  };
  onMoveShouldSetPanResponder = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (this.state.isTransitioning) {
      console.log('onMoveShouldSetPanResponder false isTransitioning');
      return false;
    }
    if (!this.state.isSecondScreen) {
      return true;
    }
    if (this.state.isSecondScreen && gestureState.vy > 0 && this.state.scrollViewContentOffsetY <= 0) {
      return true;
    }
    console.log('onMoveShouldSetPanResponder false');
    return false;
  };
  onPanResponderGrant = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    this.setState({ isTransitioning: true });
    this.state.secondScreenOffsetAnimation.setOffset(this.transformValue);
    this.state.secondScreenOffsetAnimation.setValue({ x: 0, y: 0 });
    console.log('granted');
  };

  onPanResponderMove = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    console.log('move');
    return Animated.event([
      null,
      {
        dy: this.state.secondScreenOffsetAnimation.y,
      },
    ])(event, gestureState);
  };

  onPanResponderRelease = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (gestureState.vy > 0) {
      Animated.spring(this.state.secondScreenOffsetAnimation, {
        toValue: { x: 0, y: -secondScreenVisibleToValue.y },
        friction: 7,
      }).start(() => {
        this.setState({ isSecondScreen: false });
        this.setState({ isTransitioning: false });
      });
      this.setState({ isSecondScreen: false });
      this.setState({ isTransitioning: false });
    } else {
      Animated.spring(this.state.secondScreenOffsetAnimation, {
        toValue: { x: 0, y: secondScreenVisibleToValue.y },
        friction: 7,
      }).start(() => {
        this.setState({ isSecondScreen: true });
        this.setState({ isTransitioning: false });
      });
      this.setState({ isSecondScreen: true });
      this.setState({ isTransitioning: false });
    }
  };

  scrollViewOnScroll = (event?: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event) {
      this.setState({ scrollViewContentOffsetY: event.nativeEvent.contentOffset.y, isTransitioning: false });
    }
  };

  renderRows = () => {
    var rows = [];
    for (var i = 0; i < 50; i++) {
      rows.push(
        <Text style={styles.row} key={i}>
          ROW
          {i}
        </Text>,
      );
    }
    return rows;
  };

  render() {
    const transformStyle = {
      transform: this.state.secondScreenOffsetAnimation.getTranslateTransform(),
    };
    return (
      <View style={styles.container}>
        <View style={styles.firstScreen} />
        <Animated.View style={[styles.secondScreen, transformStyle]} {...this.panResponder.panHandlers}>
          <ScrollView
            style={styles.secondScreenScrollView}
            scrollEnabled={this.state.isSecondScreen}
            onScroll={this.scrollViewOnScroll}
            scrollEventThrottle={1}
          >
            {this.renderRows()}
          </ScrollView>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  firstScreen: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  secondScreen: {
    position: 'absolute',
    width: '100%',
    height: height - navigationBarHeight,
    top: secondScreenCollapsedOffsetY,
    left: 0,
    zIndex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  secondScreenScrollView: {
    flex: 1,
  },
  row: {
    width: '100%',
    height: 50,
    padding: 10,
    justifyContent: 'center',
  },
});
