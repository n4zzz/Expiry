import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../api/supabase';

export default function DashboardScreen() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('expiry_date', { ascending: true });

    if (!error) setItems(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory Dashboard</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDate}>{item.expiry_date}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No items found. Add some!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, elevation: 2 },
  itemName: { fontSize: 16, fontWeight: '500' },
  itemDate: { color: '#e74c3c' }
});