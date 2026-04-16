import { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
} from 'react-native';
import { MapView, useMap } from '@mappedin/react-native-sdk';
import { useBlueDot } from '@mappedin/blue-dot/rn';
import { IndoorAtlas } from 'react-native-indooratlas';

const mapOptions = {};
const BLUE_DOT_SOUTH_STEP_METERS = 2;
const STATIC_BLUE_DOT_COORDINATE = {
  latitude: 65.06316971,
  longitude: 25.43794969,
};

const metersToLatitudeDelta = meters => meters / 111320;

function MapCoordinatesLogger() {
  const { mapData } = useMap();

  useEffect(() => {
    const center = mapData?.mapCenter;
    if (center && Number.isFinite(center.latitude) && Number.isFinite(center.longitude)) {
      console.log('[Mappedin][MapCenter]', {
        latitude: center.latitude,
        longitude: center.longitude,
      });
      return;
    }

    console.log('[Mappedin][MapCenter] unavailable in mapData');
  }, [mapData]);

  return null;
}

function StaticBlueDot({ coordinate }) {
  const { isReady, isEnabled, enable, update } = useBlueDot();
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!isReady || isUpdatingRef.current) {
      return;
    }

    isUpdatingRef.current = true;

    const syncBlueDot = async () => {
      try {
        if (!isEnabled) {
          await enable({ watchDevicePosition: false });
        }

        await update({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          accuracy: 10,
        });

        console.log('[Mappedin][BlueDot] position applied', coordinate);
      } catch (error) {
        console.log('[Mappedin][BlueDot] failed to apply position', error);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    void syncBlueDot();
  }, [coordinate, enable, isEnabled, isReady, update]);

  return null;
}

export default function App() {
  // const [apiKey, setApiKey] = useState('mik_yeBk0Vf0nNJtpesfu560e07e5');
  const [apiKey, setApiKey] = useState('67c08eedc34ac286d9a9c1dc');
  // const [apiSecret, setApiSecret] = useState('mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022');
  const [apiSecret, setApiSecret] = useState('mp1onbplXoRe8rX4pAeHgVpjUKGIdkg8Vnluv4ijrcrvNeYr');
  // const [mapId, setMapId] = useState('660c0bb9ae0596d87766f2d9');
  const [mapId, setMapId] = useState('67bf0d53679a9d000bfacd5f');
  const [indoorAtlasApiKey, setIndoorAtlasApiKey] = useState('169303fc-7f4f-4872-a6d3-8df486800d25');
  const [blueDotCoordinate, setBlueDotCoordinate] = useState(STATIC_BLUE_DOT_COORDINATE);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isPositioning, setIsPositioning] = useState(false);
  const [canSafelyStopPositioning, setCanSafelyStopPositioning] = useState(false);
  const [positioningStatus, setPositioningStatus] = useState('IndoorAtlas positioning is stopped.');
  const positioningRunTokenRef = useRef(0);
  const canSafelyStopRef = useRef(false);

  const hasCredentials = useMemo(
    () => (
      Boolean(apiKey.trim())
      && Boolean(apiSecret.trim())
      && Boolean(mapId.trim())
      && Boolean(indoorAtlasApiKey.trim())
    ),
    [apiKey, apiSecret, mapId, indoorAtlasApiKey],
  );

  const mapCredentials = useMemo(
    () => ({
      key: apiKey.trim(),
      secret: apiSecret.trim(),
      mapId: mapId.trim(),
    }),
    [apiKey, apiSecret, mapId],
  );

  useEffect(() => {
    canSafelyStopRef.current = canSafelyStopPositioning;
  }, [canSafelyStopPositioning]);

  const stopIndoorAtlasPositioning = () => {
    if (!isPositioning) {
      return;
    }

    positioningRunTokenRef.current += 1;

    try {
      if (canSafelyStopRef.current) {
        IndoorAtlas.clearWatch();
        setPositioningStatus('IndoorAtlas positioning stopped.');
      } else {
        IndoorAtlas.removeStatusCallback();
        setPositioningStatus('IndoorAtlas stop requested before initialization completed.');
      }
    } catch (error) {
      setPositioningStatus(`Failed to stop IndoorAtlas: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsPositioning(false);
      setCanSafelyStopPositioning(false);
    }
  };

  const startIndoorAtlasPositioning = () => {
    if (isPositioning) {
      return;
    }

    const trimmedIndoorAtlasApiKey = indoorAtlasApiKey.trim();
    if (!trimmedIndoorAtlasApiKey) {
      setPositioningStatus('Enter IndoorAtlas API key before starting positioning.');
      return;
    }

    try {
      const runToken = positioningRunTokenRef.current + 1;
      positioningRunTokenRef.current = runToken;

      IndoorAtlas.onStatusChanged(status => {
        if (runToken !== positioningRunTokenRef.current) {
          return;
        }

        const statusName = status?.name || 'UNKNOWN';
        const statusMessage = status?.message ? ` (${status.message})` : '';
        setPositioningStatus(`IndoorAtlas status: ${statusName}${statusMessage}`);

        if (statusName === 'AVAILABLE') {
          setCanSafelyStopPositioning(true);
        }
      });

      IndoorAtlas.watchVenue(venue => {
        if (runToken !== positioningRunTokenRef.current) {
          return;
        }

        console.log('[IndoorAtlas][Venue]', JSON.stringify(venue));
      });

      IndoorAtlas.watchFloorPlan(floorPlan => {
        if (runToken !== positioningRunTokenRef.current) {
          return;
        }

        console.log('[IndoorAtlas][FloorPlan]', JSON.stringify(floorPlan));
      });

      IndoorAtlas.initialize({ apiKey: trimmedIndoorAtlasApiKey });
      IndoorAtlas.watchPosition(position => {
        if (runToken !== positioningRunTokenRef.current) {
          return;
        }

        setBlueDotCoordinate(previousCoordinate => ({
          latitude: previousCoordinate.latitude - metersToLatitudeDelta(BLUE_DOT_SOUTH_STEP_METERS),
          longitude: previousCoordinate.longitude,
        }));

        const { latitude, longitude, floor } = position.coords;
        console.log('[IndoorAtlas][Position]', {
          latitude,
          longitude,
          floor,
        });
        const floorText = Number.isFinite(floor) ? ` floor ${floor}` : '';
        setPositioningStatus(
          `IndoorAtlas running: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}${floorText}`,
        );
        setCanSafelyStopPositioning(true);
      });
      setIsPositioning(true);
      setCanSafelyStopPositioning(false);
      setPositioningStatus('IndoorAtlas initialization started. Waiting for status...');
    } catch (error) {
      setIsPositioning(false);
      setCanSafelyStopPositioning(false);
      setPositioningStatus(`Failed to start IndoorAtlas: ${error?.message || 'Unknown error'}`);
    }
  };

  const closeMapView = () => {
    stopIndoorAtlasPositioning();
    setIsMapOpen(false);
  };

  useEffect(() => {
    return () => {
      positioningRunTokenRef.current += 1;

      try {
        if (canSafelyStopRef.current) {
          IndoorAtlas.clearWatch();
        } else {
          IndoorAtlas.removeStatusCallback();
        }
      } catch {
        // no-op
      }
    };
  }, []);

  if (isMapOpen) {
    return (
      <View style={styles.container}>
        <MapView
          mapData={mapCredentials}
          options={mapOptions}
          style={styles.map}
          onMapReady={() => {
            console.log('[Mappedin] onMapReady');
          }}
        >
          <MapCoordinatesLogger />
          <StaticBlueDot coordinate={blueDotCoordinate} />
        </MapView>
        <Pressable style={styles.mapBackButton} onPress={closeMapView}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <View style={styles.mapControls}>
          <Pressable
            style={[styles.mapControlButton, isPositioning && styles.mapControlButtonDisabled]}
            disabled={isPositioning}
            onPress={startIndoorAtlasPositioning}
          >
            <Text style={styles.mapControlButtonText}>Start IndoorAtlas</Text>
          </Pressable>
          <Pressable
            style={[styles.mapControlButton, !isPositioning && styles.mapControlButtonDisabled]}
            disabled={!isPositioning}
            onPress={stopIndoorAtlasPositioning}
          >
            <Text style={styles.mapControlButtonText}>Stop IndoorAtlas</Text>
          </Pressable>
        </View>
        <Text style={styles.mapStatus}>{positioningStatus}</Text>
      </View>
    );
  }

  return (
    <View style={styles.homeContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Mappedin Credentials</Text>
        <Text style={styles.text}>Enter your API key, secret, and map ID to open the map.</Text>

        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Mappedin API key"
        />

        <TextInput
          style={styles.input}
          value={apiSecret}
          onChangeText={setApiSecret}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Mappedin API secret"
        />

        <TextInput
          style={styles.input}
          value={mapId}
          onChangeText={setMapId}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Mappedin map ID"
        />

        <TextInput
          style={styles.input}
          value={indoorAtlasApiKey}
          onChangeText={setIndoorAtlasApiKey}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="IndoorAtlas API key"
        />

        <Pressable
          style={[styles.primaryButton, !hasCredentials && styles.primaryButtonDisabled]}
          disabled={!hasCredentials}
          onPress={() => setIsMapOpen(true)}
        >
          <Text style={styles.primaryButtonText}>Open Map View</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  map: {
    flex: 1,
  },
  mapBackButton: {
    position: 'absolute',
    top: 56,
    left: 12,
    zIndex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mapControls: {
    position: 'absolute',
    top: 56,
    right: 12,
    zIndex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  mapControlButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapControlButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  mapControlButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  mapStatus: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 104,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0f172a',
  },
  text: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
});
