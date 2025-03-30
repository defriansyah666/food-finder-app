import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RestaurantCard from '../components/RestaurantCard';

const AdminDashboardScreen = ({ navigation, handleLogout }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Invalid session');
        handleLogout?.();
        return;
      }
      const response = await axios.get('http://192.168.18.67:8000/api/restaurants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(response.data || []);
    } catch (err) {
      const errorMsg =
        err.response?.status === 401
          ? 'Session expired'
          : err.response?.data?.message || 'Failed to load restaurants';
      setError(errorMsg);
      if (err.response?.status === 401) handleLogout?.();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
              setError('Invalid session');
              handleLogout?.();
              return;
            }
            await axios.delete(`http://192.168.18.67:8000/api/restaurants/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setRestaurants(restaurants.filter((resto) => resto.id !== id));
          } catch (err) {
            const errorMsg =
              err.response?.status === 401
                ? 'Session expired'
                : err.response?.data?.message || 'Failed to delete restaurant';
            setError(errorMsg);
            if (err.response?.status === 401) handleLogout?.();
          }
        },
      },
    ]);
  };

  const renderRestaurant = ({ item }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
      onEdit={() => navigation.navigate('EditRestaurant', { restaurant: item })}
      onDelete={() => handleDelete(item.id)}
      onManageMenus={() => navigation.navigate('ManageMenus', { restaurant: item })}
      loading={loading}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Data Restaurants</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddRestaurant')}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Add Restaurant</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.centerText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading && (
              <View style={styles.centerContainer}>
                <Text style={styles.centerText}>No restaurants found</Text>
              </View>
            )
          }
          refreshing={loading}
          onRefresh={fetchRestaurants}
          showsVerticalScrollIndicator={false}
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
    textAlign:'center'
  },
  addButton: {
    backgroundColor: '#3B82F6', // Biru modern
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  centerText: {
    fontSize: 16,
    color: '#374151', // Abu-abu tua elegan
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;