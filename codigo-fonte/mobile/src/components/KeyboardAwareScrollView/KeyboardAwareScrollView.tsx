import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleProp,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

const REVEAL_MARGIN = 24;
const REVEAL_DELAY_MS = 80;

interface KeyboardAwareContextValue {
  revealFocusedInput: () => void;
}

const KeyboardAwareContext = createContext<KeyboardAwareContextValue | null>(null);

export function useRevealFocusedInput(): (() => void) | undefined {
  return useContext(KeyboardAwareContext)?.revealFocusedInput;
}

interface KeyboardAwareScrollViewProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function KeyboardAwareScrollView({ children, contentContainerStyle }: KeyboardAwareScrollViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);
  const scrollY = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const revealFocusedInput = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const input = TextInput.State.currentlyFocusedInput();
      if (!input || !containerRef.current) {
        return;
      }

      containerRef.current.measureInWindow((_x, containerY, _w, containerHeight) => {
        input.measureInWindow((_ix, inputY, _iw, inputHeight) => {
          const overflowBottom = inputY + inputHeight + REVEAL_MARGIN - (containerY + containerHeight);
          const overflowTop = containerY + REVEAL_MARGIN - inputY;

          if (overflowBottom > 0) {
            scrollRef.current?.scrollTo({ y: scrollY.current + overflowBottom, animated: true });
          } else if (overflowTop > 0) {
            scrollRef.current?.scrollTo({
              y: Math.max(scrollY.current - overflowTop, 0),
              animated: true,
            });
          }
        });
      });
    }, REVEAL_DELAY_MS);
  }, []);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', revealFocusedInput);
    return () => {
      subscription.remove();
      clearTimeout(timer.current);
    };
  }, [revealFocusedInput]);

  const value = useMemo(() => ({ revealFocusedInput }), [revealFocusedInput]);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }

  return (
    <KeyboardAwareContext.Provider value={value}>
      <View ref={containerRef} style={{ flex: 1 }} collapsable={false}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      </View>
    </KeyboardAwareContext.Provider>
  );
}
