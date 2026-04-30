# mappedin-example

A simple React Native app integrating Mappedin maps and IndoorAtlas positioning

## Requirements

Requires NodeJS 18+. Note that proper IndoorAtlas positioning requires a physical device.

## Setup

Run `npm install` to install dependencies. Optionally, create a `.env` file and add your MappedIn and IndoorAtlas credentias there, see `.env.example` for an example.

To run on Android, `npm run android`. For iOS, run `pod install` in the `ios` directory. To run on a physical iPhone, run `npm run ios -- --device`.
