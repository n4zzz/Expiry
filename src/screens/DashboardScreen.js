import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../api/supabase';
import { ChevronDown, ChevronUp, MapPin, Tag } from 'lucide-react-native';

export default function DashboardScreen() {
  const [items, setItems] = useState([]);
  const [expandedItemId, setExpandedItemId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('expiry_date', { ascending: true });

    if (!error) setItems(data);
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory Dashboard</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isExpanded = expandedItemId === item.id;

          return (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.itemHeader}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.headerMain}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDate}>Expires: {item.expiry_date}</Text>
                </View>
                {isExpanded ? <ChevronUp size={20} color="#999" /> : <ChevronDown size={20} color="#999" />}
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.detailsContainer}>
                  <View style={styles.divider} />

                  <View style={styles.infoRow}>
                    <Tag size={16} color="#2ecc71" />
                    <Text style={styles.infoText}>Category: {item.category || 'Uncategorized'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <MapPin size={16} color="#2ecc71" />
                    <Text style={styles.infoText}>Location: {item.location || 'Not specified'}</Text>
                  </View>

                  {item.image_url ? (
                    <View style={styles.imageWrapper}>
                      <Text style={styles.photoLabel}>Location Photo:</Text>
                      <Image source={{ uri: item.image_url }} style={styles.locationImage} resizeMode="cover" />
                    </View>
                  ) : (
                    <Text style={styles.noPhotoText}>No photo attached</Text>
                  )}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No items found. Add some!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f7f6' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  headerMain: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  itemDate: { color: '#e74c3c', marginTop: 4, fontWeight: '500' },
  detailsContainer: { padding: 16, paddingTop: 0, backgroundColor: '#fafafa' },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 8, fontSize: 14, color: '#555' },
  imageWrapper: { marginTop: 10 },
  photoLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  locationImage: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#ddd' },
  noPhotoText: { fontStyle: 'italic', color: '#999', marginTop: 5, fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#95a5a6', fontSize: 16 }
});