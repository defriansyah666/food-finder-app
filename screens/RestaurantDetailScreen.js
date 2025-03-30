import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuItem from '../components/MenuItem';

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://192.168.18.67:8000/api/favorites?restaurant_id=${restaurant.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(response.data.length > 0);
      } catch (err) {
        setError('Gagal memeriksa status favorit');
      }
    };
    checkFavorite();
  }, [restaurant.id]);

  const toggleFavorite = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      if (isFavorite) {
        await axios.delete(`http://192.168.18.67:8000/api/favorites/${restaurant.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          'http://192.168.18.67:8000/api/favorites',
          { restaurant_id: restaurant.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      setError('Gagal mengubah status favorit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{restaurant.name}</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.address}>{restaurant.address}</Text>
        <Text style={styles.info}>Kategori: {restaurant.category || 'Tidak tersedia'}</Text>
        <Text style={styles.info}>Jam Buka: {restaurant.opening_hours || 'Tidak tersedia'}</Text>
        <Text style={styles.info}>Jarak: {restaurant.distance ? restaurant.distance.toFixed(2) : 'N/A'} km</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: parseFloat(restaurant.latitude),
          longitude: parseFloat(restaurant.longitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: parseFloat(restaurant.latitude),
            longitude: parseFloat(restaurant.longitude),
          }}
          title={restaurant.name}
        />
      </MapView>

      <TouchableOpacity
        style={[styles.favoriteButton, loading && styles.disabledButton]}
        onPress={toggleFavorite}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Memuat...' : isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Menu</Text>
      <FlatList
        data={restaurant.menus || []}
        renderItem={({ item }) => <MenuItem menu={item} />}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada menu</Text>}
        contentContainerStyle={styles.listContent}
      />

      <Text style={styles.sectionTitle}>Ulasan</Text>
      <FlatList
        data={restaurant.reviews || []}
        renderItem={({ item }) => (
          <View style={styles.review}>
            <Text style={styles.reviewRating}>Rating: {item.rating}/5</Text>
            <Text style={styles.reviewComment}>{item.comment}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada ulasan</Text>}
        contentContainerStyle={styles.listContent}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
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
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
  infoContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  info: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  map: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
  },
  favoriteButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  review: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 13,
    color: '#666',
  },
  empty: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default RestaurantDetailScreen;