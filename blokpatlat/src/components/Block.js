import React from 'react';
import { View, StyleSheet } from 'react-native';
import { blockPalette, lighten, darken } from '../theme';

// Tek bir blok karesi: canlı renk + üstte açık / altta koyu kenar (şeker/bevel görünümü).
export default function Block({ colorIndex, size, ghost = false, flash = false, style }) {
  const base = blockPalette[colorIndex % blockPalette.length];
  const radius = Math.max(4, size * 0.2);
  const bevel = Math.max(2, size * 0.09);

  if (flash) {
    return (
      <View
        style={[
          styles.block,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: '#FFFFFF',
            shadowColor: '#FFFFFF',
            shadowOpacity: 0.9,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.block,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: base,
          opacity: ghost ? 0.35 : 1,
          borderTopWidth: bevel,
          borderLeftWidth: bevel,
          borderBottomWidth: bevel,
          borderRightWidth: bevel,
          borderTopColor: lighten(base, 0.4),
          borderLeftColor: lighten(base, 0.18),
          borderBottomColor: darken(base, 0.38),
          borderRightColor: darken(base, 0.2),
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
  },
});
