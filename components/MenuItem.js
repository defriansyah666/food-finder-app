// components/MenuItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const formatRupiah = (number) => {
  return `Rp ${Number(number).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const MenuItem = ({ menu }) => {
  if (!menu || typeof menu !== 'object') {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Data menu tidak valid</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{menu.name || 'Nama tidak tersedia'}</Text>
      <Text style={styles.price}>{formatRupiah(menu.price || 0)}</Text>
      <Text style={styles.description}>{menu.description || 'Tidak ada deskripsi'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#ff6347',
    fontWeight: '600',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  error: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

export default MenuItem;