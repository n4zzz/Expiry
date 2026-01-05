import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from './src/api/supabase';
import { Home, PlusCircle } from 'lucide-react-native'; // Removed ShoppingBag as it's not used below
import DashboardScreen from './src/screens/DashboardScreen';
import AddItemScreen from './src/screens/AddItemScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  // We keep the session state logic here so it's ready for when you add Auth later
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer>
      {/* Bypass: We removed the "session ?" check so the Tabs always show */}
      <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#2ecc71' }}>
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
        />
        <Tab.Screen 
          name="Add Item" 
          component={AddItemScreen} 
          options={{ tabBarIcon: ({ color }) => <PlusCircle color={color} size={24} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}