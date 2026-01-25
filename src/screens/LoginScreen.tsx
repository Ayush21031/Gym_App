import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { login } from "../services/auth";
import { saveUser } from "../services/storage";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !loading;
  }, [email, password, loading]);

  async function onSubmit() {
    setError(null);
    try {
      setLoading(true);
      const data = await login(email, password);

      if (!data.success || !data.user) {
        setError(data.message || "Login failed.");
        return;
      }

      await saveUser(data.user);
      navigation.replace("Dashboard", { email: data.user.email });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  // Helper to handle focus styles
  const handleFocus = (field: "email" | "password") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFocusedInput(field);
  };

  const handleBlur = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFocusedInput(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Section */}
        <View style={styles.brandSection}>
          {/* Placeholder for Logo - Replace with <Image source={...} /> */}
          {/* <View style={styles.logoPlaceholder}> */}
            {/* <Text style={styles.logoText}>A</Text> */}
          {/* </View> */}
          <Image 
    source={require("../../assets/logo.png")} 
    style={styles.logo} 
    resizeMode="contain" 
  />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.sub}>Sign in to continue your progress</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View 
              style={[
                styles.inputContainer, 
                focusedInput === "email" && styles.inputContainerActive,
                error ? styles.inputErrorBorder : null
              ]}
            >
              <TextInput
                value={email}
                onChangeText={(t) => {
                    setEmail(t);
                    if(error) setError(null);
                }}
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                placeholder="name@work.com"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <Pressable onPress={() => console.log("Navigate to Forgot PW")}>
                <Text style={styles.forgotPass}>Forgot password?</Text>
              </Pressable>
            </View>
            
            <View 
              style={[
                styles.inputContainer, 
                focusedInput === "password" && styles.inputContainerActive,
                error ? styles.inputErrorBorder : null
              ]}
            >
              <TextInput
                value={password}
                onChangeText={(t) => {
                    setPassword(t);
                    if(error) setError(null);
                }}
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                style={styles.input}
                editable={!loading}
              />
              <Pressable 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={10}
              >
                {/* Simple text representation of icon. Replace with actual Icon library like lucide-react-native */}
                <Text style={{color: colors.muted, fontSize: 12, fontWeight: '600'}}>
                    {showPassword ? "HIDE" : "SHOW"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
               <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </Pressable>

          {/* Footer - Sign Up */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => console.log("Nav to Sign Up")}>
              <Text style={styles.linkText}>Sign up</Text>
            </Pressable>
          </View>

          {/* Dev Hint (Optional - keep small) */}
          <Text style={styles.hint}>
             v1.0.0 • Production Build
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg, // Assuming dark background based on your original colors
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  
  // Brand
  // brandSection: {
  //   alignItems: 'center',
  //   marginBottom: spacing.xxl,
  // },
  // logoPlaceholder: {
  //   width: 64,
  //   height: 64,
  //   backgroundColor: colors.primary,
  //   borderRadius: 18,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   marginBottom: spacing.lg,
  //   shadowColor: colors.primary,
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 10,
  //   elevation: 8,
  // },
  // logoText: {
  //   fontSize: 32,
  //   fontWeight: 'bold',
  //   color: '#fff',
  // },
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  
  // NEW STYLE: Adjust width/height to match your logo's aspect ratio
  logo: {
    width: 120,    // Wider to fit a typical logo
    height: 120,   // Adjust height as needed
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sub: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },

  // Form
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  forgotPass: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Input Styling
  inputContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255,255,255,0.05)", // Glass effect
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: spacing.md,
  },
  inputContainerActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  inputErrorBorder: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontSize: 16,
  },
  eyeIcon: {
    padding: spacing.sm,
  },

  // Error
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // Light red background
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    ...typography.body,
    fontSize: 14,
  },

  // Button
  button: {
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#fff", // Force white for primary buttons usually
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.muted,
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  hint: {
    textAlign: 'center',
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
});