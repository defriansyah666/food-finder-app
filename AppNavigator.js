import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AddRestaurantScreen from './screens/AddRestaurantScreen';
import EditRestaurantScreen from './screens/EditRestaurantScreen';
import ManageMenusScreen from './screens/ManageMenusScreen';
import ProfileScreen from './screens/ProfileScreen';
import FavoriteScreen from './screens/FavoriteScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = ({ handleLogout }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={(props) => <HomeScreen {...props} handleLogout={handleLogout} />} />
    <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
  </Stack.Navigator>
);

const AdminStack = ({ handleLogout }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={(props) => <AdminDashboardScreen {...props} handleLogout={handleLogout} />} />
    <Stack.Screen name="AddRestaurant" component={(props) => <AddRestaurantScreen {...props} handleLogout={handleLogout} />} />
    <Stack.Screen name="EditRestaurant" component={(props) => <EditRestaurantScreen {...props} handleLogout={handleLogout} />} />
    <Stack.Screen name="ManageMenus" component={(props) => <ManageMenusScreen {...props} handleLogout={handleLogout} />} />
    <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
  </Stack.Navigator>
);

const FavoriteStack = ({ handleLogout }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FavoriteScreen" component={(props) => <FavoriteScreen {...props} handleLogout={handleLogout} />} />
    <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
  </Stack.Navigator>
);

const ProfileStack = ({ handleLogout }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileScreen" component={(props) => <ProfileScreen {...props} handleLogout={handleLogout} />} />
  </Stack.Navigator>
);

const MainTabNavigator = ({ handleLogout, userRole }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Favorites') {
          iconName = focused ? 'heart' : 'heart-outline';
        } else if (route.name === 'Admin') {
          iconName = focused ? 'shield' : 'shield-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3B82F6', // Mengganti ke biru untuk konsistensi
      tabBarInactiveTintColor: '#6B7280', // Abu-abu modern
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        height: 70, // Tinggi lebih besar untuk kenyamanan
        paddingBottom: 10,
        paddingTop: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderTopLeftRadius: 20, // Sudut melengkung
        borderTopRightRadius: 20,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 5,
      },
      tabBarItemStyle: {
        paddingVertical: 5,
      },
    })}
    initialRouteName="Home"
  >
    <Tab.Screen name="Home" component={HomeStack} initialParams={{ handleLogout }} options={{ title: 'Beranda' }} />
    <Tab.Screen name="Favorites" component={FavoriteStack} initialParams={{ handleLogout }} options={{ title: 'Favorit' }} />
    {userRole === 'admin' && (
      <Tab.Screen name="Admin" component={AdminStack} initialParams={{ handleLogout }} options={{ title: 'Admin' }} />
    )}
    <Tab.Screen name="Profile" component={ProfileStack} initialParams={{ handleLogout }} options={{ title: 'Profil' }} />
  </Tab.Navigator>
);

const AppNavigator = ({ isLoggedIn, userRole, handleLogout, setIsLoggedIn, setUserRole }) => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={isLoggedIn ? 'Main' : 'Login'}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen
            name="Login"
            component={(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />}
          />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen
          name="Main"
          component={(props) => <MainTabNavigator {...props} handleLogout={handleLogout} userRole={userRole} />}
        />
      )}
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;