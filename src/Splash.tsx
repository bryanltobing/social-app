import React, {useCallback, useEffect} from 'react'
import {View, StyleSheet} from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import MaskedView from '@react-native-masked-view/masked-view'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import Svg, {Path, SvgProps} from 'react-native-svg'

export const Logo = React.forwardRef(function LogoImpl(props: SvgProps, ref) {
  const width = 1000
  const height = width * (67 / 64)
  return (
    <Svg
      fill="none"
      // @ts-ignore it's fiiiiine
      ref={ref}
      viewBox="0 0 64 66"
      style={{width, height}}>
      <Path
        fill="#fff"
        d="M13.873 3.77C21.21 9.243 29.103 20.342 32 26.3v15.732c0-.335-.13.043-.41.858-1.512 4.414-7.418 21.642-20.923 7.87-7.111-7.252-3.819-14.503 9.125-16.692-7.405 1.252-15.73-.817-18.014-8.93C1.12 22.804 0 8.431 0 6.488 0-3.237 8.579-.18 13.873 3.77ZM50.127 3.77C42.79 9.243 34.897 20.342 32 26.3v15.732c0-.335.13.043.41.858 1.512 4.414 7.418 21.642 20.923 7.87 7.111-7.252 3.819-14.503-9.125-16.692 7.405 1.252 15.73-.817 18.014-8.93C62.88 22.804 64 8.431 64 6.488 64-3.237 55.422-.18 50.127 3.77Z"
      />
    </Svg>
  )
})

type Props = {
  isReady: boolean
}

const AnimatedLogo = Animated.createAnimatedComponent(Logo)

export function Splash(props: React.PropsWithChildren<Props>) {
  const insets = useSafeAreaInsets()
  const intro = useSharedValue(0)
  const outroLogo = useSharedValue(0)
  const outroApp = useSharedValue(0)
  const [isAnimationComplete, setIsAnimationComplete] = React.useState(false)

  const logoAnimations = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(intro.value, [0, 1], [0.8, 1], 'clamp'),
        },
        {
          scale: interpolate(
            outroLogo.value,
            [0, 0.06, 0.08, 1],
            [1, 0.8, 0.8, 800],
            'clamp',
          ),
        },
      ],
      opacity: interpolate(intro.value, [0, 1], [0, 1], 'clamp'),
    }
  })

  const appAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            outroApp.value,
            [0, 0.7, 1],
            [1.1, 1.1, 1],
            'clamp',
          ),
        },
      ],
      opacity: interpolate(outroApp.value, [0, 0.7, 1], [0, 0, 1], 'clamp'),
    }
  })

  const onFinish = useCallback(() => setIsAnimationComplete(true), [])

  useEffect(() => {
    if (props.isReady) {
      // hide on mount
      SplashScreen.hideAsync().catch(() => {})

      intro.value = withTiming(
        1,
        {duration: 200, easing: Easing.out(Easing.cubic)},
        async () => {
          outroLogo.value = withTiming(
            1,
            {duration: 1200, easing: Easing.in(Easing.cubic)},
            () => {
              runOnJS(onFinish)()
            },
          )
          outroApp.value = withTiming(
            1,
            {duration: 1200, easing: Easing.inOut(Easing.cubic)},
            () => {
              runOnJS(onFinish)()
            },
          )
        },
      )
    }
  }, [onFinish, intro, outroLogo, outroApp, props.isReady])

  return (
    <View style={{flex: 1}}>
      {!isAnimationComplete && (
        <LinearGradient
          colors={['#0A7AFF', '#59B9FF']}
          style={[StyleSheet.absoluteFillObject]}
        />
      )}

      <MaskedView
        style={[StyleSheet.absoluteFillObject]}
        maskElement={
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                // Transparent background because mask is based off alpha channel.
                backgroundColor: 'transparent',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{translateY: -(insets.top / 2)}, {scale: 0.1}], // scale from 1000px to 100px
              },
            ]}>
            <AnimatedLogo style={[logoAnimations]} />
          </Animated.View>
        }>
        {!isAnimationComplete && (
          <View
            style={[StyleSheet.absoluteFillObject, {backgroundColor: 'white'}]}
          />
        )}

        <Animated.View style={[{flex: 1}, appAnimation]}>
          {props.children}
        </Animated.View>
      </MaskedView>
    </View>
  )
}
