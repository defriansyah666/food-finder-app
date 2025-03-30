import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RestaurantCard from '../components/RestaurantCard';

const HomeScreen = ({ navigation, handleLogout }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filterHeight] = useState(new Animated.Value(0)); // Untuk animasi

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Animasi untuk filter
    Animated.timing(filterHeight, {
      toValue: showFilter ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Invalid session');
        handleLogout?.();
        return;
      }

      const response = await axios.get(
        `http://192.168.18.67:8000/api/restaurants?lat=${location.coords.latitude}&lon=${location.coords.longitude}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const restaurantData = response.data || [];
      setRestaurants(restaurantData);
      setFilteredRestaurants(restaurantData);

      const uniqueCategories = [...new Set(restaurantData.map(r => r.category).filter(c => c))];
      setCategories(uniqueCategories);
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterRestaurants(query, selectedCategory);
  };

  const handleFilter = (category) => {
    setSelectedCategory(category);
    filterRestaurants(searchQuery, category);
    setShowFilter(false);
  };

  const filterRestaurants = (query, category) => {
    let filtered = restaurants;

    if (query) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(r => r.category === category);
    }

    setFilteredRestaurants(filtered);
  };

  const renderRestaurant = ({ item }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
      loading={loading}
    />
  );

  const filterMaxHeight = categories.length > 0 ? 60 : 40; // Tinggi maksimum filter

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Eats</Text>
        <Text style={styles.subtitle}>Discover local culinary gems</Text>
      </View>

      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Icon name={showFilter ? 'filter-off' : 'filter'} size={20} color="#FFFFFF" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.filterContainer,
          {
            height: filterHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, filterMaxHeight],
            }),
            opacity: filterHeight,
          },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterItem, !selectedCategory && styles.filterItemActive]}
            onPress={() => handleFilter(null)}
          >
            <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterItem, selectedCategory === category && styles.filterItemActive]}
              onPress={() => handleFilter(category)}
            >
              <Text style={[styles.filterText, selectedCategory === category && styles.filterTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={20} color="#DC2626" style={styles.errorIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <Icon name="loading" size={24} color="#666" style={styles.loadingIcon} />
          <Text style={styles.centerText}>Loading...</Text>
        </View>
      ) : filteredRestaurants.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="food-off" size={24} color="#666" style={styles.noDataIcon} />
          <Text style={styles.centerText}>No restaurants found</Text>
          <Text style={styles.centerSubText}>Try adjusting your search or filter</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchData}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '400',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  filterContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  filterItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Border abu-abu lembut
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterItemActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 24,
    marginVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  errorIcon: {
    marginRight: 4,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  centerText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  centerSubText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingIcon: {
    marginRight: 4,
  },
  noDataIcon: {
    marginRight: 4,
  },
});

export default HomeScreen;