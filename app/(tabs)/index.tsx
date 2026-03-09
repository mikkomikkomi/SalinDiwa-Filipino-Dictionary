import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import dictionaryData from "./words";

const { width, height } = Dimensions.get("window");

// === 0. THEME ENGINE ===
const THEMES = {
  light: {
    bg: "#FCFAF5",
    card: "#FFFFFF",
    textPrimary: "#4E4035",
    textSecondary: "#8C7A6B",
    accent: "#6A5849",
    inputBg: "#F5F0E6",
    inputBorder: "#E0D4C8",
    headerColors: ["#2E4A2A", "#4A6136"] as const,
    gradientColors: ["#4A6136", "#85A069"] as const,
    particleColor: "rgba(133, 160, 105, 0.2)",
    correctBox: "#F0FFF4",
    correctBorder: "#85A069",
    correctText: "#4A6136",
    wrongBox: "#FFF5F5",
    wrongBorder: "#EE9C59",
    wrongText: "#A85A1D",
  },
  dark: {
    bg: "#1A1614",
    card: "#2A2421",
    textPrimary: "#FCFAF5",
    textSecondary: "#B0A396",
    accent: "#C59458",
    inputBg: "#332B27",
    inputBorder: "#4E4035",
    headerColors: ["#121F10", "#1B3320"] as const,
    gradientColors: ["#1B3320", "#2E4A2A"] as const,
    particleColor: "rgba(133, 160, 105, 0.15)",
    correctBox: "#1B3320",
    correctBorder: "#85A069",
    correctText: "#A3C493",
    wrongBox: "#451A0A",
    wrongBorder: "#EE9C59",
    wrongText: "#FBCDAA",
  },
};

// === 1. OVERDRIVE CONFIGURATION ===
const getOverdriveConfig = (
  streak: number,
  isDark: boolean,
  baseTheme: any,
) => {
  if (streak >= 10) {
    return {
      header: ["#450a0a", "#c2410c"] as const,
      gradient: ["#f59e0b", "#dc2626"] as const,
      particle: isDark ? "rgba(251, 191, 36, 0.4)" : "rgba(245, 158, 11, 0.3)",
      speedMultiplier: 0.25,
    };
  } else if (streak >= 5) {
    return {
      header: ["#2e1065", "#7c3aed"] as const,
      gradient: ["#d946ef", "#8b5cf6"] as const,
      particle: isDark ? "rgba(217, 70, 239, 0.3)" : "rgba(168, 85, 247, 0.2)",
      speedMultiplier: 0.5,
    };
  } else {
    return {
      header: baseTheme.headerColors,
      gradient: baseTheme.gradientColors,
      particle: baseTheme.particleColor,
      speedMultiplier: 1.0,
    };
  }
};

// === 2. REACTIVE PARTICLES ===
const FloatingParticles = ({
  color,
  speedMultiplier,
}: {
  color: string;
  speedMultiplier: number;
}) => {
  const particles = useRef(
    [...Array(8)].map(() => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      size: Math.random() * 60 + 40,
    })),
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const durationBase = 15000;
      const duration = durationBase * speedMultiplier;

      const move = () => {
        Animated.sequence([
          Animated.timing(p.x, {
            toValue: Math.random() * width,
            duration: duration + Math.random() * 5000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(p.y, {
            toValue: Math.random() * height,
            duration: duration + Math.random() * 5000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]).start(({ finished }) => {
          if (finished) move();
        });
      };
      move();
    });
  }, [speedMultiplier]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: color,
            transform: [{ translateX: p.x }, { translateY: p.y }],
            opacity: 0.6,
          }}
        />
      ))}
    </View>
  );
};

// === 3. WAVEFORM ANIMATION ===
const Waveform = ({ color }: { color: string }) => {
  const scale1 = useRef(new Animated.Value(0.3)).current;
  const scale2 = useRef(new Animated.Value(0.5)).current;
  const scale3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateBar = (
      anim: Animated.Value,
      delay: number,
      duration: number,
    ) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ).start();
    };

    animateBar(scale1, 0, 300);
    animateBar(scale2, 100, 400);
    animateBar(scale3, 50, 250);
  }, []);

  const barStyle = {
    width: 4,
    backgroundColor: color,
    borderRadius: 2,
    marginHorizontal: 2,
    height: 18,
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View style={[barStyle, { transform: [{ scaleY: scale1 }] }]} />
      <Animated.View style={[barStyle, { transform: [{ scaleY: scale2 }] }]} />
      <Animated.View style={[barStyle, { transform: [{ scaleY: scale3 }] }]} />
    </View>
  );
};

// === 3.A ROUNDED ICON BUTTON ===
const IconButton = ({
  onPress,
  icon,
  color,
  size = 24,
  isActive = false,
}: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isActive]);

  const handlePress = () => {
    onPress();
    if (!isActive) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.iconButton,
          {
            transform: [{ scale: scaleAnim }],
            borderColor: "rgba(255,255,255,0.3)",
            backgroundColor: isActive
              ? "rgba(255,255,255,0.4)"
              : "rgba(255,255,255,0.2)",
          },
        ]}
      >
        {isActive ? (
          <Waveform color={color} />
        ) : (
          <Ionicons name={icon} size={size} color={color} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// === 4. FIRE STREAK ANIMATION ===
const FireStreak = ({ streak }: { streak: number }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const fireColor = streak >= 10 ? "#FFD700" : "#FF4500";

  useEffect(() => {
    if (streak >= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [streak]);

  if (streak < 3) return null;

  return (
    <Animated.View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
        transform: [{ scale }],
      }}
    >
      <Ionicons name="flame" size={20} color={fireColor} />
      <Text
        style={{
          fontFamily: "Poppins_800ExtraBold",
          color: fireColor,
          fontSize: 16,
          marginLeft: 2,
        }}
      >
        {streak}
      </Text>
    </Animated.View>
  );
};

// === 5. ANIMATED HEART DISPLAY (WITH CRITICAL BEAT) ===
const AnimatedHeart = ({
  filled,
  theme,
  isCritical,
}: {
  filled: boolean;
  theme: any;
  isCritical?: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const prevFilled = useRef(filled);

  useEffect(() => {
    if (prevFilled.current && !filled) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3,
        }),
      ]).start();
    }
    prevFilled.current = filled;
  }, [filled]);

  useEffect(() => {
    if (isCritical && filled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [isCritical, filled]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons
        name={filled ? "heart" : "heart-outline"}
        size={24}
        color={filled ? "#FF4500" : theme.textSecondary}
        style={{ marginHorizontal: 3 }}
      />
    </Animated.View>
  );
};

const HeartDisplay = ({ lives, theme }: { lives: number; theme: any }) => {
  const hearts = [1, 2, 3];
  return (
    <View style={{ flexDirection: "row", marginBottom: 15 }}>
      {hearts.map((i) => (
        <AnimatedHeart
          key={i}
          filled={i <= lives}
          theme={theme}
          isCritical={lives === 1 && i === 1}
        />
      ))}
    </View>
  );
};

// === 6. BREATHING GRADIENT ===
const BreathingGradient = ({
  children,
  style,
  colors,
  gradientColors,
}: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={style}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: animatedValue }]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <View style={{ zIndex: 10 }}>{children}</View>
    </View>
  );
};

// === 7. SHIMMER SKELETON LOADER ===
const ShimmerBlock = ({ width: w, height: h, style }: any) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        { width: w, height: h, backgroundColor: "#E2E8F0", overflow: "hidden" },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.5)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const SkeletonCard = () => {
  return (
    <View style={[styles.card, { backgroundColor: "#fff" }]}>
      <ShimmerBlock
        width={45}
        height={45}
        style={{ borderRadius: 25, marginRight: 15 }}
      />
      <View style={{ flex: 1 }}>
        <ShimmerBlock
          width={"60%"}
          height={20}
          style={{ borderRadius: 4, marginBottom: 8 }}
        />
        <ShimmerBlock width={"90%"} height={14} style={{ borderRadius: 4 }} />
      </View>
    </View>
  );
};

// === 8. CASCADING SPRING ANIMATION ===
const AnimatedCard = ({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const delay = Math.min(index * 60, 600);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        damping: 12,
        stiffness: 100,
        mass: 0.8,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        damping: 12,
        stiffness: 100,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      {children}
    </Animated.View>
  );
};

// === 9. BOUNCY BUTTON ===
const ScaleButton = ({ onPress, children, style, disabled }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    if (!disabled)
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 20,
      }).start();
  };
  const onPressOut = () => {
    if (!disabled)
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }).start();
  };
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: false }}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// === 9.5 SHAKEABLE OPTION BUTTON ===
const ShakeableOption = ({
  opt,
  isSelected,
  isCorrect,
  feedback,
  onPress,
  btnStyle,
  textStyle,
  isReverseQuiz,
}: any) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (feedback === "wrong" && isSelected) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      shakeAnim.setValue(0);
    }
  }, [feedback, isSelected]);

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      <ScaleButton
        style={[styles.optionButton, btnStyle]}
        onPress={() => onPress(opt)}
        disabled={feedback !== "neutral"}
      >
        <Text
          style={[
            styles.optionText,
            textStyle,
            isReverseQuiz && { fontSize: 14 },
          ]}
          numberOfLines={isReverseQuiz ? 2 : 1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {isReverseQuiz ? opt.MEANING : opt.WORD}
        </Text>
      </ScaleButton>
    </Animated.View>
  );
};

// === 10. HIGHLIGHT TEXT ===
const HighlightText = ({
  text,
  highlight,
  style,
  numberOfLines = 1,
  ...props
}: any) => {
  const commonProps = {
    style,
    numberOfLines,
    ellipsizeMode: "tail",
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.7,
    ...props,
  };

  if (!highlight) return <Text {...commonProps}>{text}</Text>;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <Text {...commonProps}>
      {parts.map((part: string, index: number) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text
            key={index}
            style={{ backgroundColor: "#FFF5C2", color: "#D69E2E" }}
          >
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        ),
      )}
    </Text>
  );
};

// === 11. DYNAMIC ISLAND TOAST NOTIFICATION ===
const ToastNotification = ({
  message,
  type,
  visible,
  onHide,
  duration = 800,
  topInset,
}: any) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 10,
        useNativeDriver: true,
        speed: 15,
        bounciness: 8,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onHide) onHide();
        });
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  let iconName: any = "alert-circle";
  if (type === "correct") iconName = "checkmark-circle";
  if (type === "gameover") iconName = "skull";

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: topInset,
          transform: [{ translateY: slideAnim }],
          alignSelf: "center",
        },
        type === "correct"
          ? styles.toastCorrect
          : type === "gameover"
            ? styles.toastWrong
            : styles.toastWrong,
      ]}
    >
      <Ionicons name={iconName} size={20} color="#fff" />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

// === 12. STAGGERED TEXT ===
const AnimatedModalText = ({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    }).start();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      {children}
    </Animated.View>
  );
};

// === 13. GAME OVER CARD ===
const GameOverCard = ({ score, onRetry, theme }: any) => {
  return (
    <View
      style={[
        styles.questionBox,
        {
          backgroundColor: theme.card,
          borderColor: theme.wrongBorder,
          borderWidth: 2,
        },
      ]}
    >
      <Ionicons
        name="skull"
        size={60}
        color={theme.wrongText}
        style={{ marginBottom: 15 }}
      />
      <Text
        style={[styles.questionLabel, { color: theme.wrongText, fontSize: 16 }]}
      >
        GAME OVER
      </Text>
      <Text
        style={[
          styles.questionText,
          { color: theme.textPrimary, fontSize: 32 },
        ]}
      >
        {score}
      </Text>
      <Text
        style={{
          fontFamily: "Poppins_600SemiBold",
          color: theme.textSecondary,
          marginBottom: 20,
        }}
      >
        Final Score
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: theme.accent,
          paddingHorizontal: 40,
          paddingVertical: 15,
          borderRadius: 25,
        }}
        onRetry={onRetry}
      >
        <Text
          style={{ color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16 }}
        >
          TRY AGAIN
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  const insets = useSafeAreaInsets();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const baseTheme = isDarkMode ? THEMES.dark : THEMES.light;

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const [searchText, setSearchText] = useState("");
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);

  const [isReverseQuiz, setIsReverseQuiz] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);

  const [isGameOver, setIsGameOver] = useState(false);

  const [feedback, setFeedback] = useState<"neutral" | "correct" | "wrong">(
    "neutral",
  );
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "neutral",
    duration: 800,
  });
  const searchPulse = useRef(new Animated.Value(1)).current;

  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionListRef = useRef<SectionList>(null);

  const scrollBtnOpacity = useRef(new Animated.Value(0)).current;
  const clearBtnScale = useRef(new Animated.Value(0)).current;

  // GLOW ANIMATION
  const focusAnim = useRef(new Animated.Value(0)).current;

  const questionFadeAnim = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  const [isSpeaking, setIsSpeaking] = useState(false);

  const themeAnim = useRef(new Animated.Value(0)).current;

  // CAROUSEL STATES
  const [activeSlide, setActiveSlide] = useState(0);
  const swipeHintAnim = useRef(new Animated.Value(0)).current;

  const overdrive = getOverdriveConfig(streak, isDarkMode, baseTheme);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Magandang Umaga";
    if (hour >= 12 && hour < 18) return "Magandang Hapon";
    return "Magandang Gabi";
  };
  const currentGreeting = getGreeting();

  useEffect(() => {
    if (isSearchFocused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(searchPulse, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(searchPulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      searchPulse.setValue(1);
    }

    Animated.timing(focusAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused]);

  useEffect(() => {
    if (selectedWord) {
      setActiveSlide(0);

      // Start bouncing arrow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(swipeHintAnim, {
            toValue: 5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(swipeHintAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Elastic Bounce
      Animated.spring(modalAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 12,
        speed: 14,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setSelectedWord(null);
      });
    }
  }, [selectedWord]);

  useEffect(() => {
    Animated.timing(scrollBtnOpacity, {
      toValue: showScrollTop ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showScrollTop]);

  useEffect(() => {
    Animated.spring(clearBtnScale, {
      toValue: searchText.length > 0 ? 1 : 0,
      useNativeDriver: true,
      bounciness: 12,
      speed: 20,
    }).start();
  }, [searchText]);

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedWord(null);
    });
  };

  const showToast = (message: string, type: string, duration: number = 800) => {
    setToast({ visible: true, message, type, duration });
    setTimeout(
      () => setToast((prev) => ({ ...prev, visible: false })),
      duration + 400,
    );
  };

  const toggleTheme = () => {
    Animated.sequence([
      Animated.timing(themeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start(() => {
      themeAnim.setValue(0);
    });
    setIsDarkMode(!isDarkMode);
  };

  const themeRotate = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const speakWord = (word: string) => {
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(word, {
      language: "fil",
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const copyToClipboard = async () => {
    if (selectedWord) {
      await Clipboard.setStringAsync(
        `${selectedWord.WORD}: ${selectedWord.MEANING}`,
      );
      showToast("Copied to Clipboard!", "correct");
    }
  };

  const handleModeToggle = () => {
    if (isQuizMode && (score > 0 || streak > 0) && !isGameOver) {
      Alert.alert(
        "End Current Game?",
        "You will lose your current streak and score.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "End Game",
            style: "destructive",
            onPress: () => {
              setIsQuizMode(false);
              setScore(0);
              setStreak(0);
            },
          },
        ],
      );
    } else {
      isQuizMode ? setIsQuizMode(false) : startQuiz();
    }
  };

  const startQuiz = () => {
    setIsQuizMode(true);
    setScore(0);
    setStreak(0);
    setLives(3);
    setIsGameOver(false);
    generateQuestion();
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  };

  const scrollToTop = () => {
    sectionListRef.current?.scrollToLocation({
      sectionIndex: 0,
      itemIndex: 0,
      animated: true,
    });
  };

  const handleMomentumScrollEnd = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const screenWidth = e.nativeEvent.layoutMeasurement.width;
    setActiveSlide(Math.round(offset / screenWidth));
  };

  useEffect(() => {
    if (isQuizMode && !currentQuestion) {
      generateQuestion();
    }
  }, [isQuizMode]);

  const generateQuestion = () => {
    Animated.sequence([
      Animated.timing(questionFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(questionFadeAnim, {
        toValue: 1,
        duration: 250,
        delay: 50,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setFeedback("neutral");
      setSelectedOptionId(null);

      const randomIndex = Math.floor(Math.random() * dictionaryData.length);
      const correct = dictionaryData[randomIndex];
      let wrong1, wrong2;
      do {
        wrong1 =
          dictionaryData[Math.floor(Math.random() * dictionaryData.length)];
      } while (wrong1.ID === correct.ID);
      do {
        wrong2 =
          dictionaryData[Math.floor(Math.random() * dictionaryData.length)];
      } while (wrong2.ID === correct.ID || wrong2.ID === wrong1.ID);
      const shuffledOptions = [correct, wrong1, wrong2].sort(
        () => Math.random() - 0.5,
      );
      setCurrentQuestion(correct);
      setOptions(shuffledOptions);
    }, 150);
  };

  const handleAnswer = (selected: any) => {
    if (!currentQuestion || feedback !== "neutral") return;

    setSelectedOptionId(selected.ID);

    if (selected.ID === currentQuestion.ID) {
      setFeedback("correct");
      setScore(score + 1);
      setStreak((prev) => prev + 1);
      speakWord("Tama!");
      setTimeout(generateQuestion, 1000);
    } else {
      setFeedback("wrong");
      setStreak(0);
      speakWord("Mali.");

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1000);
      } else {
        setTimeout(generateQuestion, 2000);
      }
    }
  };

  const setGameMode = (reverse: boolean) => {
    if (reverse === isReverseQuiz) return;
    setIsReverseQuiz(reverse);
    generateQuestion();
  };

  const getOptionStyle = (opt: any) => {
    const isSelected = opt.ID === selectedOptionId;
    const isCorrect = opt.ID === currentQuestion?.ID;

    let btnStyle = {
      backgroundColor: baseTheme.card,
      borderColor: baseTheme.inputBorder,
      borderWidth: 1,
    };
    let textStyle = { color: baseTheme.accent };

    if (feedback === "correct") {
      if (isCorrect) {
        btnStyle = {
          backgroundColor: baseTheme.correctBox,
          borderColor: baseTheme.correctBorder,
          borderWidth: 2,
        };
        textStyle = { color: baseTheme.correctText };
      }
    } else if (feedback === "wrong") {
      if (isSelected) {
        btnStyle = {
          backgroundColor: baseTheme.wrongBox,
          borderColor: baseTheme.wrongBorder,
          borderWidth: 2,
        };
        textStyle = { color: baseTheme.wrongText };
      } else if (isCorrect) {
        btnStyle = {
          backgroundColor: baseTheme.correctBox,
          borderColor: baseTheme.correctBorder,
          borderWidth: 2,
        };
        textStyle = { color: baseTheme.correctText };
      }
    }

    return { btnStyle, textStyle };
  };

  const sections = useMemo(() => {
    const filtered = dictionaryData.filter((item: any) => {
      const search = searchText.toUpperCase();
      const word = item.WORD ? item.WORD.toUpperCase() : "";
      const meaning = item.MEANING ? item.MEANING.toUpperCase() : "";
      return word.includes(search) || meaning.includes(search);
    });

    filtered.sort((a: any, b: any) =>
      (a.WORD || "").localeCompare(b.WORD || ""),
    );
    const grouped: any = {};
    filtered.forEach((item: any) => {
      const firstLetter = item.WORD ? item.WORD[0].toUpperCase() : "#";
      if (!grouped[firstLetter]) grouped[firstLetter] = [];
      grouped[firstLetter].push(item);
    });
    return Object.keys(grouped).map((key) => ({
      title: key,
      data: grouped[key],
    }));
  }, [searchText]);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <AnimatedCard index={index % 10}>
      <ScaleButton
        style={[styles.card, { backgroundColor: baseTheme.card }]}
        onPress={() => setSelectedWord(item)}
      >
        {item.IMAGE ? (
          <Image
            source={item.IMAGE}
            style={styles.listImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={overdrive.gradient}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>
              {item.WORD ? item.WORD.charAt(0).toUpperCase() : "?"}
            </Text>
          </LinearGradient>
        )}

        <View style={[styles.textContainer, { justifyContent: "center" }]}>
          <HighlightText
            text={item.WORD}
            highlight={searchText}
            style={[
              styles.cardTitle,
              { color: baseTheme.textPrimary, marginBottom: 0 },
            ]}
            numberOfLines={1}
          />
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={baseTheme.textSecondary}
        />
      </ScaleButton>
    </AnimatedCard>
  );

  const renderSectionHeader = ({ section: { title } }: any) => (
    <BlurView
      intensity={80}
      tint={isDarkMode ? "dark" : "light"}
      style={styles.stickyHeader}
    >
      <Text style={[styles.sectionHeaderText, { color: baseTheme.accent }]}>
        {title}
      </Text>
    </BlurView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="search-outline"
        size={60}
        color={baseTheme.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: baseTheme.textPrimary }]}>
        Walang Nahanap
      </Text>
      <Text style={[styles.emptySubtitle, { color: baseTheme.textSecondary }]}>
        Subukan ang ibang spelling o salita.
      </Text>
    </View>
  );

  if (!fontsLoaded) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: baseTheme.bg }]}
        edges={["left", "right"]}
      >
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <LinearGradient
          colors={baseTheme.headerColors}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={{ height: 40 }} />
        </LinearGradient>
        <View style={{ padding: 20 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  const modalTranslateY = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });
  const backdropOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // GLOW STYLES
  const glowBorder = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseTheme.inputBorder, baseTheme.accent],
  });
  const glowShadow = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseTheme.inputBg, baseTheme.accent],
  });
  const glowElevation = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 12],
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: baseTheme.bg }]}
      edges={["left", "right"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <FloatingParticles
        color={overdrive.particle}
        speedMultiplier={overdrive.speedMultiplier}
      />

      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        topInset={insets.top}
      />

      <BreathingGradient
        style={[styles.header, { paddingTop: insets.top + 20 }]}
        colors={overdrive.header}
        gradientColors={overdrive.gradient}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.headerGreeting}>
                {isQuizMode ? `Score: ${score}` : currentGreeting}
              </Text>
              {isQuizMode && <FireStreak streak={streak} />}
            </View>

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {isQuizMode ? "Quiz Mode" : "SalinDiwa"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                { width: 40, justifyContent: "center", paddingHorizontal: 0 },
              ]}
              onPress={toggleTheme}
            >
              <Animated.View style={{ transform: [{ rotate: themeRotate }] }}>
                <Ionicons
                  name={isDarkMode ? "sunny" : "moon"}
                  size={16}
                  color="#fff"
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeButton}
              onPress={handleModeToggle}
            >
              <Ionicons
                name={isQuizMode ? "book" : "game-controller"}
                size={16}
                color="#fff"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.modeButtonText}>
                {isQuizMode ? "Dict" : "Quiz"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BreathingGradient>

      {isQuizMode ? (
        isGameOver ? (
          <View style={[styles.quizContainer, { justifyContent: "center" }]}>
            <GameOverCard score={score} onRetry={startQuiz} theme={baseTheme} />
          </View>
        ) : currentQuestion ? (
          <View style={styles.quizContainer}>
            <View style={styles.quizGameArea}>
              <View
                style={[
                  styles.questionBox,
                  { backgroundColor: baseTheme.card },
                  feedback === "correct"
                    ? {
                        backgroundColor: baseTheme.correctBox,
                        borderColor: baseTheme.correctBorder,
                        borderWidth: 2,
                      }
                    : feedback === "wrong"
                      ? {
                          backgroundColor: baseTheme.wrongBox,
                          borderColor: baseTheme.wrongBorder,
                          borderWidth: 2,
                        }
                      : {},
                ]}
              >
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <HeartDisplay lives={lives} theme={baseTheme} />
                </View>

                <Text style={styles.questionLabel}>
                  {isReverseQuiz
                    ? "ANONG IBIG SABIHIN NITO?"
                    : "ANONG SALITA ITO?"}
                </Text>

                <Animated.View style={{ opacity: questionFadeAnim }}>
                  <Text
                    key={currentQuestion.ID}
                    style={[
                      styles.questionText,
                      { color: baseTheme.textPrimary },
                      isReverseQuiz && { fontSize: 26 },
                    ]}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                    numberOfLines={2}
                  >
                    "
                    {isReverseQuiz
                      ? currentQuestion.WORD
                      : currentQuestion.MEANING}
                    "
                  </Text>
                </Animated.View>
              </View>

              <View style={styles.optionsContainer}>
                {options.map((opt, index) => {
                  const { btnStyle, textStyle } = getOptionStyle(opt);
                  return (
                    <ShakeableOption
                      key={index}
                      opt={opt}
                      isSelected={selectedOptionId === opt.ID}
                      isCorrect={currentQuestion.ID === opt.ID}
                      feedback={feedback}
                      onPress={handleAnswer}
                      btnStyle={btnStyle}
                      textStyle={textStyle}
                      isReverseQuiz={isReverseQuiz}
                    />
                  );
                })}
              </View>
            </View>

            <View style={styles.fixedBottomFooter}>
              <View style={styles.modeToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeToggleBtn,
                    !isReverseQuiz && {
                      backgroundColor: baseTheme.accent,
                      borderColor: baseTheme.accent,
                    },
                  ]}
                  onPress={() => setGameMode(false)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modeToggleText,
                      !isReverseQuiz
                        ? { color: "#fff" }
                        : { color: baseTheme.textSecondary },
                    ]}
                  >
                    GUESS WORD
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeToggleBtn,
                    isReverseQuiz && {
                      backgroundColor: baseTheme.accent,
                      borderColor: baseTheme.accent,
                    },
                  ]}
                  onPress={() => setGameMode(true)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modeToggleText,
                      isReverseQuiz
                        ? { color: "#fff" }
                        : { color: baseTheme.textSecondary },
                    ]}
                  >
                    GUESS MEANING
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={baseTheme.accent} />
            <Text
              style={{
                marginTop: 10,
                color: baseTheme.textSecondary,
                fontFamily: "Poppins_600SemiBold",
              }}
            >
              Loading Quiz...
            </Text>
          </View>
        )
      ) : (
        <>
          <View style={styles.searchContainer}>
            <Animated.View
              style={[
                styles.searchBarWrapper,
                {
                  backgroundColor: baseTheme.inputBg,
                  borderColor: glowBorder,
                  shadowColor: glowShadow,
                  elevation: glowElevation,
                },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: searchPulse }] }}>
                <Ionicons
                  name="search"
                  size={20}
                  color={
                    isSearchFocused ? baseTheme.accent : baseTheme.textSecondary
                  }
                  style={{ marginRight: 10 }}
                />
              </Animated.View>
              <TextInput
                style={[styles.searchInput, { color: baseTheme.textPrimary }]}
                placeholder="Maghanap ng salita..."
                placeholderTextColor={baseTheme.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setSearchText("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={searchText.length === 0}
              >
                <Animated.View
                  style={{ transform: [{ scale: clearBtnScale }] }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={baseTheme.textSecondary}
                  />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>
          <SectionList
            ref={sectionListRef}
            sections={sections}
            keyExtractor={(item: any, index) =>
              item.ID ? item.ID.toString() : index.toString()
            }
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
            ListEmptyComponent={renderEmptyState}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />

          <Animated.View
            style={[
              styles.scrollTopButton,
              {
                opacity: scrollBtnOpacity,
                transform: [{ scale: scrollBtnOpacity }],
                backgroundColor: baseTheme.accent,
              },
            ]}
            pointerEvents={showScrollTop ? "auto" : "none"}
          >
            <TouchableOpacity
              onPress={scrollToTop}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="arrow-up" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      {selectedWord && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { zIndex: 100, opacity: backdropOpacity },
          ]}
        >
          <BlurView
            intensity={isDarkMode ? 40 : 20}
            tint={isDarkMode ? "dark" : "default"}
            style={styles.modalOverlay}
          >
            <Pressable style={styles.backdropPress} onPress={closeModal} />

            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: baseTheme.card,
                  transform: [{ translateY: modalTranslateY }],
                },
              ]}
            >
              <View style={styles.dragHandle} />

              <BreathingGradient
                style={[styles.modalHeader, { marginTop: 10 }]}
                colors={overdrive.header}
                gradientColors={overdrive.gradient}
              >
                <View style={styles.modalHeaderContent}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={styles.modalTitle}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.6}
                    >
                      {selectedWord.WORD}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <IconButton
                      onPress={() => speakWord(selectedWord.WORD)}
                      icon="volume-high"
                      color="#fff"
                      isActive={isSpeaking}
                    />
                    <IconButton
                      onPress={copyToClipboard}
                      icon="copy-outline"
                      color="#fff"
                    />
                  </View>
                </View>
              </BreathingGradient>

              <View style={{ flexShrink: 1, minHeight: 250 }}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handleMomentumScrollEnd}
                >
                  {/* PAGE 1: TEXT AREA */}
                  <View style={{ width: width }}>
                    <ScrollView
                      style={styles.modalBody}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      showsVerticalScrollIndicator={false}
                    >
                      <AnimatedModalText delay={100}>
                        <View style={styles.sectionTitleRow}>
                          <Ionicons
                            name="book-outline"
                            size={16}
                            color={baseTheme.accent}
                            style={{ marginRight: 5 }}
                          />
                          <Text
                            style={[
                              styles.label,
                              { color: baseTheme.accent, marginBottom: 0 },
                            ]}
                          >
                            KAHULUGAN
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.definitionText,
                            { color: baseTheme.textPrimary },
                          ]}
                        >
                          {selectedWord.MEANING}
                        </Text>
                      </AnimatedModalText>

                      {selectedWord.SENTENCE && (
                        <AnimatedModalText delay={300}>
                          <View
                            style={[
                              styles.divider,
                              { backgroundColor: baseTheme.inputBorder },
                            ]}
                          />
                          <View style={styles.sectionTitleRow}>
                            <Ionicons
                              name="chatbox-ellipses-outline"
                              size={16}
                              color={baseTheme.accent}
                              style={{ marginRight: 5 }}
                            />
                            <Text
                              style={[
                                styles.label,
                                { color: baseTheme.accent, marginBottom: 0 },
                              ]}
                            >
                              HALIMBAWA
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.sentenceText,
                              { color: baseTheme.textSecondary },
                            ]}
                          >
                            "{selectedWord.SENTENCE}"
                          </Text>
                        </AnimatedModalText>
                      )}
                    </ScrollView>
                  </View>

                  {/* PAGE 2: IMAGE AREA */}
                  {selectedWord.IMAGE && (
                    <View
                      style={{
                        width: width,
                        padding: 25,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={selectedWord.IMAGE}
                        style={styles.carouselImage}
                        contentFit="cover"
                        transition={300}
                      />
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* Carousel Indicators & Swipe Hint */}
              {selectedWord.IMAGE && (
                <View style={styles.carouselFooter}>
                  <View style={styles.paginationDots}>
                    <View
                      style={[
                        styles.dot,
                        activeSlide === 0
                          ? { backgroundColor: baseTheme.accent, width: 20 }
                          : { backgroundColor: baseTheme.inputBorder },
                      ]}
                    />
                    <View
                      style={[
                        styles.dot,
                        activeSlide === 1
                          ? { backgroundColor: baseTheme.accent, width: 20 }
                          : { backgroundColor: baseTheme.inputBorder },
                      ]}
                    />
                  </View>

                  {activeSlide === 0 && (
                    <Animated.View
                      style={[
                        styles.swipeHint,
                        { transform: [{ translateX: swipeHintAnim }] },
                      ]}
                    >
                      <Text
                        style={[
                          styles.swipeHintText,
                          { color: baseTheme.textSecondary },
                        ]}
                      >
                        Mag-swipe para sa larawan
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color={baseTheme.textSecondary}
                      />
                    </Animated.View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: baseTheme.inputBg,
                    borderColor: baseTheme.inputBorder,
                    borderWidth: 1,
                  },
                ]}
                onPress={closeModal}
              >
                <Text
                  style={[styles.closeButtonText, { color: baseTheme.accent }]}
                >
                  Sige, salamat!
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </BlurView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerGreeting: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#FCD116",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 24,
    color: "#FFFFFF",
    marginTop: 5,
  },
  modeButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    flexDirection: "row",
    alignItems: "center",
  },
  modeButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
    fontSize: 12,
  },

  searchContainer: { paddingHorizontal: 20, marginTop: -25 },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
  },
  searchInput: { flex: 1, fontFamily: "Poppins_400Regular", fontSize: 16 },

  listContent: { padding: 20, paddingTop: 10, flexGrow: 1, paddingBottom: 100 },
  stickyHeader: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    marginTop: 10,
    overflow: "hidden",
  },
  sectionHeaderText: {
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 20,
    marginLeft: 20,
    opacity: 0.9,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  listImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#E2E8F0",
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowRadius: 2,
  },
  textContainer: { flex: 1, marginRight: 10 },
  cardTitle: { fontFamily: "Poppins_700Bold", fontSize: 18, marginBottom: 2 },
  cardSubtitle: { fontFamily: "Poppins_400Regular", fontSize: 14 },

  skeletonAvatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#E2E8F0",
    marginRight: 15,
  },
  skeletonTitle: {
    width: "60%",
    height: 20,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: "90%",
    height: 14,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
  },

  emptyContainer: { alignItems: "center", marginTop: 50, opacity: 0.6 },
  emptyTitle: { fontFamily: "Poppins_700Bold", fontSize: 20, marginTop: 10 },
  emptySubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    marginTop: 5,
  },

  quizContainer: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  quizGameArea: { flex: 1, justifyContent: "center" },
  fixedBottomFooter: { justifyContent: "flex-end", paddingBottom: 10 },

  questionBox: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  questionLabel: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    color: "#A0AEC0",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  questionText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    textAlign: "center",
    lineHeight: 30,
    minHeight: 60,
  },

  optionsContainer: { width: "100%" },
  optionButton: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
  },
  optionText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    textAlign: "center",
  },

  modeToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  modeToggleText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-end",
  },
  backdropPress: { flex: 1 },
  modalContent: {
    width: "100%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
    elevation: 20,
    paddingBottom: 20,
    maxHeight: "85%",
  },

  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#cbd5e0",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 5,
  },

  modalHeader: { width: "100%", padding: 25 },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    color: "#fff",
    textAlign: "left",
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  modalBody: { paddingHorizontal: 25, paddingTop: 25 },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  label: { fontFamily: "Poppins_700Bold", fontSize: 12, letterSpacing: 1 },
  definitionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 15,
  },
  divider: { height: 1, marginVertical: 15 },
  sentenceText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
  },
  closeButton: {
    marginHorizontal: 25,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  closeButtonText: { fontFamily: "Poppins_700Bold", fontSize: 16 },

  toastContainer: {
    position: "absolute",
    alignSelf: "center",
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 100,
  },
  toastCorrect: { backgroundColor: "#2F855A" },
  toastWrong: { backgroundColor: "#C53030" },
  toastText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    marginLeft: 10,
    fontSize: 14,
  },

  scrollTopButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  // CAROUSEL STYLES
  carouselImage: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    backgroundColor: "#E2E8F0",
  },
  carouselFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  paginationDots: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  swipeHint: { flexDirection: "row", alignItems: "center", gap: 5 },
  swipeHintText: { fontFamily: "Poppins_600SemiBold", fontSize: 12 },
});