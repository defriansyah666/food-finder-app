import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RestaurantCard = ({ restaurant, onPress, onEdit, onDelete, onManageMenus }) => {
  if (!restaurant || typeof restaurant !== 'object') {
    return (
      <View style={styles.card}>
        <Text style={styles.error}>Invalid restaurant data</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name || 'Unnamed Restaurant'}
        </Text>
        <Text style={styles.address} numberOfLines={2}>
          {restaurant.address || 'Address unavailable'}
        </Text>
        <Text style={styles.distance}>
          {restaurant.distance ? `${restaurant.distance.toFixed(1)} km` : 'Distance N/A'}
        </Text>
      </TouchableOpacity>
      {(onEdit || onDelete || onManageMenus) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onManageMenus && (
            <TouchableOpacity onPress={onManageMenus} style={styles.actionButton}>
              <Text style={styles.actionText}>Menus</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Text style={styles.actionTextDelete}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // Bayangan lebih lembut
    shadowRadius: 8,
    elevation: 2, // Efek bayangan ringan untuk Android
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 16,
  },
  distance: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12, // Jarak antar tombol lebih lapang
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6', // Biru modern
  },
  actionTextDelete: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444', // Merah modern
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    padding: 8,
  },
});

export default RestaurantCard;