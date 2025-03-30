import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = ({ navigation, handleLogout }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setError('Sesi tidak valid. Silakan login kembali.');
          handleLogout?.();
          return;
        }
        const response = await axios.get('http://192.168.18.67:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        const errorMsg =
          err.response?.status === 401
            ? 'Sesi telah berakhir. Silakan login kembali.'
            : err.response?.data?.message || 'Gagal memuat profil';
        setError(errorMsg);
        if (err.response?.status === 401) handleLogout?.();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [handleLogout]);

  const onLogout = async () => {
    setLoading(true);
    setError('');
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userRole');
      handleLogout?.();
    } catch (err) {
      setError('Gagal logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="account-circle" size={100} color="#3B82F6" style={styles.headerIcon} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={20} color="#DC2626" style={styles.errorIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={24} color="#666" style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Memuat profil...</Text>
        </View>
      ) : user ? (
        <View style={styles.profileCard}>
          <View style={styles.infoRow}>
            <Icon name="account" size={24} color="#3B82F6" style={styles.infoIcon} />
            <Text style={styles.label}>Nama: </Text>
            <Text style={styles.value}>{user.name || 'Tidak tersedia'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="email" size={24} color="#3B82F6" style={styles.infoIcon} />
            <Text style={styles.label}>Email: </Text>
            <Text style={styles.value}>{user.email || 'Tidak tersedia'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="shield-account" size={24} color="#3B82F6" style={styles.infoIcon} />
            <Text style={styles.label}>Role: </Text>
            <Text style={styles.value}>{user.role || 'Tidak tersedia'}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Icon name="information-outline" size={24} color="#666" style={styles.noDataIcon} />
          <Text style={styles.noDataText}>Tidak ada data profil</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.logoutButton, loading && styles.disabledButton]}
        onPress={onLogout}
        disabled={loading}
      >
        <Icon
          name="logout"
          size={20}
          color="#FFFFFF"
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>{loading ? 'Logging out...' : 'Logout'}</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  headerIcon: {
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  infoIcon: {
    width: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#3B82F6', // Diganti ke biru
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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
  buttonIcon: {
    marginRight: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  loadingIcon: {
    marginRight: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noDataContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  noDataIcon: {
    marginRight: 4,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileScreen;