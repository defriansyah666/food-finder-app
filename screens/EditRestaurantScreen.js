import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditRestaurantScreen = ({ route, navigation, handleLogout }) => {
  const { restaurant } = route.params;
  const [form, setForm] = useState({
    ...restaurant,
    latitude: restaurant.latitude.toString(),
    longitude: restaurant.longitude.toString(),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.latitude || !form.longitude) {
      setError('Please fill in all required fields');
      return;
    }

    const lat = parseFloat(form.latitude);
    const lon = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Invalid latitude (-90 to 90) or longitude (-180 to 180)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Invalid session');
        handleLogout?.();
        return;
      }
      await axios.put(
        `http://192.168.18.67:8000/api/restaurants/${restaurant.id}`,
        { ...form, latitude: lat, longitude: lon },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.goBack();
    } catch (err) {
      const errorMsg =
        err.response?.status === 401
          ? 'Session expired'
          : err.response?.data?.message || 'Failed to update restaurant';
      setError(errorMsg);
      if (err.response?.status === 401) handleLogout?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Restaurant</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Restaurant Name"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={form.address}
        onChangeText={(text) => setForm({ ...form, address: text })}
        editable={!loading}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Latitude"
          value={form.latitude}
          onChangeText={(text) => setForm({ ...form, latitude: text })}
          keyboardType="numeric"
          editable={!loading}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Longitude"
          value={form.longitude}
          onChangeText={(text) => setForm({ ...form, longitude: text })}
          keyboardType="numeric"
          editable={!loading}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Category (optional)"
        value={form.category}
        onChangeText={(text) => setForm({ ...form, category: text })}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Opening Hours (e.g., 08:00-22:00, optional)"
        value={form.opening_hours}
        onChangeText={(text) => setForm({ ...form, opening_hours: text })}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8', // Abu-abu lembut
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  errorContainer: {
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#FEF2F2', // Merah sangat lembut
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626', // Merah modern
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 14,
    color: '#1A1A1A',
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#3B82F6', // Biru modern
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF', // Abu-abu saat disabled
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EditRestaurantScreen;