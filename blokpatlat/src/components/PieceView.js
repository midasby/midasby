import React from 'react';
import { View } from 'react-native';
import Block from './Block';

// Bir taşı (şekli) verilen hücre boyutuyla çizer.
export default function PieceView({ piece, cellSize, gap = 2, ghost = false }) {
  return (
    <View style={{ width: piece.w * cellSize, height: piece.h * cellSize }}>
      {piece.cells.map(([r, c], i) => (
        <Block
          key={i}
          colorIndex={piece.color}
          size={cellSize - gap}
          ghost={ghost}
          style={{ left: c * cellSize + gap / 2, top: r * cellSize + gap / 2 }}
        />
      ))}
    </View>
  );
}
