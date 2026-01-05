import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, PlusCircle, ShoppingCart, Settings } from 'lucide-react-native';
import DashboardScreen from './src/screens/DashboardScreen';
import AddItemScreen from './src/screens/AddItemScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Dashboard') return <Home color={color} size={size} />;
            if (route.name === 'Add') return <PlusCircle color={color} size={size} />;
            if (route.name === 'Shopping') return <ShoppingCart color={color} size={size} />;
            return <Settings color={color} size={size} />;
          },
          tabBarActiveTintColor: '#2ecc71',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Add" component={AddItemScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}