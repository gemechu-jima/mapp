module.exports = ({ config }) => {
  const archs = process.env.BUILD_ARCHS
    ? process.env.BUILD_ARCHS.split(",")
    : ["armeabi-v7a", "arm64-v8a"];

  return {
    ...config,
    name: "wangapay",
    slug: "mobileapp",
    owner: "onetwo1",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/wangapay.png",
    scheme: "mobileapp",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/images/wangapay.png",
      bundleIdentifier: "com.onetwo1.mobileapp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#FFFFFF",
        foregroundImage: "./assets/images/logo.jpg",
      },
      predictiveBackGestureEnabled: true,
      package: "com.onetwo1.mobileapp",
    },
    web: {
      output: "static",
      favicon: "./assets/images/wangapay1.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#FFFFFF",
          image: "./assets/images/wangapay.png",
          imageWidth: 120,
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            buildArchs: archs,
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            enableBundleCompression: true,
            enablePngCrunchInReleaseBuilds: true,
          },
        },
      ],
      "expo-font",
      "expo-asset",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "baf0f608-a0fb-4697-bc24-8db5304c45d8",
      },
    },
  };
};