import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RestaurantCard from '../components/RestaurantCard';

const FavoriteScreen = ({ navigation, handleLogout }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Sesi tidak valid. Silakan login kembali.');
        handleLogout?.();
        return;
      }
      const response = await axios.get('http://192.168.18.67:8000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat favorit');
      if (err.response?.status === 401) handleLogout?.();
    } finally {
      setLoading(false);
    }
  };

  const renderFavorite = ({ item }) => (
    <View style={styles.favoriteContainer}>
      <RestaurantCard
        restaurant={item.restaurant}
        onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item.restaurant })}
        loading={loading}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restoran Favorit</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <Text style={styles.loading}>Memuat...</Text>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>Belum ada restoran favorit</Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Text style={styles.buttonText}>Cari Restoran</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchFavorites}
        />
      )}
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  favoriteContainer: {
    marginBottom: 12,
  },
  loading: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#3B82F6', // Biru modern
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FavoriteScreen;