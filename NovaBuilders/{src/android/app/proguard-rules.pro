# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Nova Builders package
-keep class com.novabuilders.estimator.** { *; }

# Document Picker
-keep class com.reactnativedocumentpicker.** { *; }

# React Native FS
-keep class com.rnfs.** { *; }

# React Native Share
-keep class cl.json.** { *; }

# Okhttp / Axios networking
-keepattributes Signature
-keepattributes *Annotation*
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# General
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
