# Mappedin + Expo Stub App

This project is a minimal Expo app with the Mappedin React Native SDK integrated and a simple `MapView` in `App.js`.

## Prerequisites

- Node.js 18+
- npm
- Expo-compatible device/emulator
- A Mappedin API key, secret, and map ID

Get credentials from Mappedin docs:
- https://developer.mappedin.com/react-native-sdk/getting-started
- Demo keys/maps: https://developer.mappedin.com/docs/demo-keys-and-maps

## Configure credentials

1. Copy `.env.example` to `.env`.
2. Fill in your values:

- `EXPO_PUBLIC_MAPPEDIN_KEY`
- `EXPO_PUBLIC_MAPPEDIN_SECRET`
- `EXPO_PUBLIC_MAPPEDIN_MAP_ID`

Expo exposes `EXPO_PUBLIC_*` variables to app code.

## Install dependencies

Dependencies are already installed in this workspace, but for a fresh clone:

```bash
npm install
```

## Run with a development build

This project is configured for Expo development builds (`expo-dev-client`).

Build and install a native development client:

```bash
npm run android
```

On macOS, you can also run:

```bash
npm run ios
```

Then start Metro for the dev client:

```bash
npm start
```

If you want Expo Go behavior temporarily, use:

```bash
npm run start:go
```

## Implemented map view

`App.js` renders:

- a fallback message when credentials are missing
- a `MapView` when credentials are present

Map credentials are read from environment variables and passed via:

- `mapData.key`
- `mapData.secret`
- `mapData.mapId`

## Notes

- If web rendering is needed, this project includes `react-dom` and `react-native-web`.
- If your environment has native module constraints, use an Expo development build.

## IndoorAtlas SDK integration

IndoorAtlas dependencies and native project wiring were added following:

- https://github.com/IndoorAtlas/sdk-cordova-examples/tree/master/ReactNativeExample#add-indooratlas-to-existing-reactnative-project

### Android

- `react-native-indooratlas` and `@remobile/react-native-cordova` are installed.
- Manual native linking is configured in:
	- `android/settings.gradle`
	- `android/app/build.gradle`
	- `android/build.gradle`
	- `android/app/src/main/java/.../MainApplication.kt`
- Set your IndoorAtlas credentials in `android/app/src/main/AndroidManifest.xml`:
	- `com.indooratlas.android.sdk.API_KEY`
	- `com.indooratlas.android.sdk.API_SECRET`

### iOS

- Pod entries were added to `ios/Podfile`:
	- `RCTCordova`
	- `RCTIndoorAtlas`
- Required privacy keys were added to `ios/mappedinindooratlasexample/Info.plist`.
- On macOS, run CocoaPods in `ios/` after dependency changes.

### Important with Expo prebuild

This project includes native folders in source control. If you run `expo prebuild` again, review/restore any manual IndoorAtlas edits in native files.
