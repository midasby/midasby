import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { blockPalette } from '../theme';

// Toplam parçacık üst sınırı — düşük donanımda bile akıcı kalsın.
const MAX_PARTICLES = 48;

// Tek bir patlama dalgası: temizlenen her hücreden dışa savrulan,
// yerçekimiyle düşen, dönerek sönen kırıntılar. Animasyon bitince onDone
// ile kendini listeden sildirir.
export default function ParticleBurst({ burst, cellSize, onDone }) {
  const particlesRef = useRef(null);

  if (!particlesRef.current) {
    const cells = burst.cells;
    const per = Math.max(1, Math.min(5, Math.floor(MAX_PARTICLES / Math.max(1, cells.length))));
    const list = [];
    cells.forEach(({ r, c, color }) => {
      for (let i = 0; i < per; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = cellSize * (1.1 + Math.random() * 2.4);
        list.push({
          x0: c * cellSize + cellSize / 2,
          y0: r * cellSize + cellSize / 2,
          dx: Math.cos(angle) * dist,
          // önce yukarı savrul, sonra yerçekimiyle aşağı düş
          dyUp: -Math.abs(Math.sin(angle)) * dist * 0.7 - cellSize * 0.5,
          dyDown: cellSize * (1.6 + Math.random() * 1.4),
          size: cellSize * (0.14 + Math.random() * 0.2),
          color: Math.random() < 0.22 ? '#FFFFFF' : blockPalette[color % blockPalette.length],
          rot: `${Math.round((Math.random() - 0.5) * 720)}deg`,
          progress: new Animated.Value(0),
          duration: 550 + Math.random() * 350,
        });
      }
    });
    particlesRef.current = list;
  }

  useEffect(() => {
    const anims = particlesRef.current.map((p) =>
      Animated.timing(p.progress, {
        toValue: 1,
        duration: p.duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    Animated.parallel(anims).start(() => onDone(burst.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {particlesRef.current.map((p, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: p.x0 - p.size / 2,
            top: p.y0 - p.size / 2,
            width: p.size,
            height: p.size,
            borderRadius: p.size * 0.3,
            backgroundColor: p.color,
            opacity: p.progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.9, 0] }),
            transform: [
              {
                translateX: p.progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }),
              },
              {
                translateY: p.progress.interpolate({
                  inputRange: [0, 0.42, 1],
                  outputRange: [0, p.dyUp, p.dyUp + p.dyDown],
                }),
              },
              { rotate: p.progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', p.rot] }) },
              { scale: p.progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] }) },
            ],
          }}
        />
      ))}
    </>
  );
}
