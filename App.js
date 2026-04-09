import { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
} from 'react-native';
import { MapView } from '@mappedin/react-native-sdk';

const mapOptions = {};

export default function App() {
  const [apiKey, setApiKey] = useState('mik_yeBk0Vf0nNJtpesfu560e07e5');
  const [apiSecret, setApiSecret] = useState('mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022');
  const [mapId, setMapId] = useState('660c0bb9ae0596d87766f2d9');
  const [isMapOpen, setIsMapOpen] = useState(false);

  const hasCredentials = useMemo(
    () => Boolean(apiKey.trim()) && Boolean(apiSecret.trim()) && Boolean(mapId.trim()),
    [apiKey, apiSecret, mapId],
  );

  const mapCredentials = useMemo(
    () => ({
      key: apiKey.trim(),
      secret: apiSecret.trim(),
      mapId: mapId.trim(),
    }),
    [apiKey, apiSecret, mapId],
  );

  if (isMapOpen) {
    return (
      <View style={styles.container}>
        <View style={styles.mapHeader}>
          <Pressable style={styles.secondaryButton} onPress={() => setIsMapOpen(false)}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.mapHeaderTitle}>Mappedin Map View</Text>
        </View>
        <MapView mapData={mapCredentials} options={mapOptions} style={styles.map} />
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
  mapHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mapHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
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
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
});
