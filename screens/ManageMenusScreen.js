import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatRupiah = (number) => {
  return `Rp ${Number(number).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const ManageMenusScreen = ({ route, navigation, handleLogout }) => {
  const { restaurant } = route.params;
  const [menus, setMenus] = useState(restaurant.menus || []);
  const [form, setForm] = useState({ name: '', price: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMenus(restaurant.menus || []);
  }, [restaurant]);

  const handleAddOrUpdate = async () => {
    if (!form.name || !form.price) {
      setError('Nama dan harga wajib diisi');
      return;
    }
    const price = parseInt(form.price.replace(/\D/g, ''), 10);
    if (isNaN(price) || price <= 0) {
      setError('Harga harus angka positif');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Sesi tidak valid');
        handleLogout?.();
        return;
      }
      const payload = { name: form.name, price, description: form.description || '' };
      if (editId) {
        const response = await axios.put(
          `http://192.168.18.67:8000/api/restaurants/${restaurant.id}/menus/${editId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMenus(menus.map((menu) => (menu.id === editId ? response.data : menu)));
        setEditId(null);
      } else {
        const response = await axios.post(
          `http://192.168.18.67:8000/api/restaurants/${restaurant.id}/menus`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMenus([...menus, response.data]);
      }
      setForm({ name: '', price: '', description: '' });
    } catch (err) {
      const errorMsg =
        err.response?.status === 401
          ? 'Sesi telah berakhir'
          : err.response?.data?.error || 'Gagal menyimpan menu';
      setError(errorMsg);
      if (err.response?.status === 401) handleLogout?.();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (menu) => {
    setForm({ name: menu.name, price: menu.price.toString(), description: menu.description || '' });
    setEditId(menu.id);
    setError('');
  };

  const handleDelete = async (menuId) => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin menghapus menu ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
              setError('Sesi tidak valid');
              handleLogout?.();
              return;
            }
            await axios.delete(
              `http://192.168.18.67:8000/api/restaurants/${restaurant.id}/menus/${menuId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setMenus(menus.filter((menu) => menu.id !== menuId));
          } catch (err) {
            const errorMsg =
              err.response?.status === 401
                ? 'Sesi telah berakhir'
                : err.response?.data?.error || 'Gagal menghapus menu';
            setError(errorMsg);
            if (err.response?.status === 401) handleLogout?.();
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderMenu = ({ item }) => (
    <View style={styles.menuCard}>
      <Text style={styles.menuName}>{item.name}</Text>
      <Text style={styles.menuPrice}>{formatRupiah(item.price)}</Text>
      {item.description && <Text style={styles.menuDescription}>{item.description}</Text>}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => handleEdit(item)} 
          disabled={loading}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDelete(item.id)} 
          disabled={loading}
        >
          <Text style={styles.actionText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kelola Menu - {restaurant.name}</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Nama Menu"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Harga (contoh: 15000)"
        value={form.price}
        onChangeText={(text) => setForm({ ...form, price: text })}
        keyboardType="numeric"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Deskripsi (opsional)"
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleAddOrUpdate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Menyimpan...' : editId ? 'Perbarui Menu' : 'Tambah Menu'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={menus}
        renderItem={renderMenu}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Belum ada menu</Text>}
      />
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
    textAlign: 'center',
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
  submitButton: {
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  menuCard: {
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
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  menuPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ManageMenusScreen;