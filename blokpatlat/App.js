import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import {
  SIZE,
  emptyBoard,
  randomTray,
  canPlace,
  placePiece,
  fullLines,
  clearLines,
  scoreFor,
  isGameOver,
} from './src/engine';
import { colors, blockPalette } from './src/theme';
import Block from './src/components/Block';
import PieceView from './src/components/PieceView';
import ParticleBurst from './src/components/Particles';
import { loadBest, saveBest, loadSoundOn, saveSoundOn } from './src/storage';
import { initSounds, playSound, setSoundEnabled } from './src/sound';
import {
  adsSupported,
  initAds,
  maybeShowInterstitial,
  showRewarded,
  isRewardedReady,
  setOnRewardedStateChange,
} from './src/ads';

const SCREEN_W = Dimensions.get('window').width;
const BOARD_PX = Math.min(SCREEN_W - 24, 430);
const CELL = BOARD_PX / SIZE;
const TRAY_CELL = CELL * 0.48;
const LIFT = 60; // sürüklerken taşı parmağın üstüne kaldır (görünür kalsın)
const TITLE = 'BLOK PATLAT!';

function haptic(fn) {
  try {
    fn().catch(() => {});
  } catch (e) {
    // web/emülatörde titreşim olmayabilir
  }
}

export default function App() {
  // Oyun durumu ref'lerde tutulur: PanResponder callback'leri her zaman güncel veriyi görür.
  const boardRef = useRef(emptyBoard());
  const trayRef = useRef(randomTray());
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const clearingRef = useRef(null); // temizlenme animasyonundaki hücreler: Set("r,c")
  const gameOverRef = useRef(false);
  const newRecordRef = useRef(false);
  const recordCheeredRef = useRef(false); // rekor sesi oyun başına bir kez
  const revivedRef = useRef(false); // ödüllü reklamla devam hakkı oyun başına bir kez

  const dragRef = useRef(null); // { index, piece }
  const previewRef = useRef(null); // { row, col, valid }
  const dragPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const rootViewRef = useRef(null);
  const boardViewRef = useRef(null);
  const rootWin = useRef({ x: 0, y: 0 });
  const boardWin = useRef({ x: 0, y: 0 });

  const popRef = useRef(null); // { gain, combo }
  const popAnim = useRef(new Animated.Value(0)).current;

  const [best, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [bursts, setBursts] = useState([]); // aktif parçacık patlamaları
  const [rewardedReady, setRewardedReady] = useState(false);
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);

  useEffect(() => {
    loadBest().then(setBest);
    loadSoundOn().then((on) => {
      setSoundOn(on);
      setSoundEnabled(on);
    });
    initSounds();
    setOnRewardedStateChange(setRewardedReady);
    initAds();
  }, []);

  const measureRoot = () => {
    if (rootViewRef.current) {
      rootViewRef.current.measureInWindow((x, y) => {
        rootWin.current = { x, y };
      });
    }
  };

  const measureBoard = () => {
    if (boardViewRef.current) {
      boardViewRef.current.measureInWindow((x, y) => {
        boardWin.current = { x, y };
      });
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    saveSoundOn(next);
    if (next) playSound('place');
  };

  const showPop = (gain, combo) => {
    popRef.current = { gain, combo };
    popAnim.setValue(0);
    Animated.timing(popAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  };

  const afterPlacement = () => {
    if (trayRef.current.every((p) => p === null)) {
      trayRef.current = randomTray();
    }
    if (scoreRef.current > best) {
      newRecordRef.current = best > 0;
      if (newRecordRef.current && !recordCheeredRef.current) {
        recordCheeredRef.current = true;
        playSound('record');
      }
      setBest(scoreRef.current);
      saveBest(scoreRef.current);
    }
    if (isGameOver(boardRef.current, trayRef.current)) {
      gameOverRef.current = true;
      playSound('gameover');
      haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
    }
    rerender();
  };

  const placeAt = (index, piece, row, col) => {
    const placed = placePiece(boardRef.current, piece, row, col);
    trayRef.current = trayRef.current.slice();
    trayRef.current[index] = null;

    const lines = fullLines(placed);
    comboRef.current = lines.count > 0 ? comboRef.current + 1 : 0;
    const gained = scoreFor(piece.cells.length, lines.count, comboRef.current);
    scoreRef.current += gained;
    showPop(gained, lines.count > 0 ? comboRef.current : 0);

    if (lines.count > 0) {
      const flashSet = new Set();
      lines.rows.forEach((r) => {
        for (let c = 0; c < SIZE; c++) flashSet.add(`${r},${c}`);
      });
      lines.cols.forEach((c) => {
        for (let r = 0; r < SIZE; r++) flashSet.add(`${r},${c}`);
      });

      // parçacık patlaması: temizlenen hücrelerden renkli kırıntılar savrulur
      const burstCells = [];
      flashSet.forEach((key) => {
        const [r, c] = key.split(',').map(Number);
        burstCells.push({ r, c, color: placed[r][c] });
      });
      setBursts((bs) => [...bs, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, cells: burstCells }]);

      boardRef.current = placed;
      clearingRef.current = flashSet;
      playSound(comboRef.current >= 2 ? 'combo' : 'clear');
      haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
      setTimeout(() => {
        boardRef.current = clearLines(placed, lines);
        clearingRef.current = null;
        afterPlacement();
      }, 180);
    } else {
      boardRef.current = placed;
      playSound('place');
      haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      afterPlacement();
    }
    rerender();
  };

  const moveDrag = (evt) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { pageX, pageY } = evt.nativeEvent;
    const w = drag.piece.w * CELL;
    const h = drag.piece.h * CELL;
    const tlx = pageX - w / 2;
    const tly = pageY - h - LIFT;
    dragPos.setValue({ x: tlx - rootWin.current.x, y: tly - rootWin.current.y });

    const col = Math.round((tlx - boardWin.current.x) / CELL);
    const row = Math.round((tly - boardWin.current.y) / CELL);
    const valid = canPlace(boardRef.current, drag.piece, row, col);
    const prev = previewRef.current;
    if (!prev || prev.row !== row || prev.col !== col || prev.valid !== valid) {
      previewRef.current = { row, col, valid };
      rerender();
    }
  };

  const endDrag = (cancelled) => {
    const drag = dragRef.current;
    const prev = previewRef.current;
    dragRef.current = null;
    previewRef.current = null;
    if (!cancelled && drag && prev && prev.valid) {
      placeAt(drag.index, drag.piece, prev.row, prev.col);
    } else {
      rerender();
    }
  };

  const responders = useMemo(
    () =>
      [0, 1, 2].map((i) =>
        PanResponder.create({
          onStartShouldSetPanResponder: () =>
            !gameOverRef.current && !clearingRef.current && !!trayRef.current[i],
          onPanResponderGrant: (evt) => {
            const piece = trayRef.current[i];
            if (!piece) return;
            dragRef.current = { index: i, piece };
            haptic(() => Haptics.selectionAsync());
            moveDrag(evt);
          },
          onPanResponderMove: (evt) => moveDrag(evt),
          onPanResponderRelease: () => endDrag(false),
          onPanResponderTerminate: () => endDrag(true),
        })
      ),
    [] // callback'ler yalnızca ref okuduğu için güvenli
  );

  const resetGame = () => {
    boardRef.current = emptyBoard();
    trayRef.current = randomTray();
    scoreRef.current = 0;
    comboRef.current = 0;
    clearingRef.current = null;
    gameOverRef.current = false;
    newRecordRef.current = false;
    recordCheeredRef.current = false;
    revivedRef.current = false;
    popRef.current = null;
    setBursts([]);
    rerender();
  };

  const restart = () => {
    maybeShowInterstitial(); // her 3 oyun bitişinde bir tam ekran reklam
    resetGame();
  };

  // Ödüllü reklam karşılığı devam: tahta temizlenir, skor korunur (oyun başına 1 kez).
  const revive = async () => {
    const earned = await showRewarded();
    if (!earned) return;
    boardRef.current = emptyBoard();
    trayRef.current = randomTray();
    comboRef.current = 0;
    clearingRef.current = null;
    gameOverRef.current = false;
    revivedRef.current = true;
    playSound('clear');
    rerender();
  };

  const board = boardRef.current;
  const tray = trayRef.current;
  const drag = dragRef.current;
  const preview = previewRef.current;
  const clearing = clearingRef.current;
  const pop = popRef.current;
  const canRevive = gameOverRef.current && !revivedRef.current && (!adsSupported || (rewardedReady && isRewardedReady()));

  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      cells.push(
        <View
          key={`e${r}-${c}`}
          style={[styles.emptyCell, { left: c * CELL + 1.5, top: r * CELL + 1.5 }]}
        />
      );
      const v = board[r][c];
      if (v !== null) {
        const flash = clearing && clearing.has(`${r},${c}`);
        cells.push(
          <Block
            key={`b${r}-${c}`}
            colorIndex={v}
            size={CELL - 3}
            flash={!!flash}
            style={{ left: c * CELL + 1.5, top: r * CELL + 1.5 }}
          />
        );
      }
    }
  }

  return (
    <View style={styles.root} ref={rootViewRef} onLayout={measureRoot}>
      <StatusBar style="light" />

      <View style={styles.titleRow}>
        {TITLE.split('').map((ch, i) =>
          ch === ' ' ? (
            <View key={i} style={{ width: 8 }} />
          ) : (
            <Text key={i} style={[styles.titleChar, { color: blockPalette[i % blockPalette.length] }]}>
              {ch}
            </Text>
          )
        )}
      </View>

      <TouchableOpacity style={styles.soundBtn} onPress={toggleSound} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.soundIcon}>{soundOn ? '🔊' : '🔇'}</Text>
      </TouchableOpacity>

      <Text style={styles.score}>{scoreRef.current}</Text>
      <View style={styles.bestChip}>
        <Text style={styles.bestText}>👑 {best}</Text>
        {comboRef.current >= 2 && !gameOverRef.current ? (
          <Text style={styles.comboText}> COMBO x{comboRef.current} 🔥</Text>
        ) : null}
      </View>

      <View style={styles.boardWrap}>
        <View
          ref={boardViewRef}
          onLayout={measureBoard}
          style={[styles.board, { width: BOARD_PX, height: BOARD_PX }]}
        >
          {cells}
          {drag && preview && preview.valid ? (
            <View
              pointerEvents="none"
              style={{ position: 'absolute', left: preview.col * CELL, top: preview.row * CELL }}
            >
              <PieceView piece={drag.piece} cellSize={CELL} gap={3} ghost />
            </View>
          ) : null}
        </View>

        {/* Parçacıklar tahtanın dışına taşabilsin diye overflow'suz üst katmanda */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {bursts.map((b) => (
            <ParticleBurst
              key={b.id}
              burst={b}
              cellSize={CELL}
              onDone={(id) => setBursts((bs) => bs.filter((x) => x.id !== id))}
            />
          ))}
        </View>

        {pop ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pop,
              {
                opacity: popAnim.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
                transform: [
                  { translateY: popAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -46] }) },
                ],
              },
            ]}
          >
            <Text style={styles.popGain}>+{pop.gain}</Text>
            {pop.combo >= 2 ? <Text style={styles.popCombo}>COMBO x{pop.combo}</Text> : null}
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.tray}>
        {tray.map((piece, i) => (
          <View key={i} style={styles.traySlot} {...responders[i].panHandlers}>
            {piece && (!drag || drag.index !== i) ? (
              <PieceView piece={piece} cellSize={TRAY_CELL} />
            ) : null}
          </View>
        ))}
      </View>

      {drag ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.dragLayer, { transform: dragPos.getTranslateTransform() }]}
        >
          <PieceView piece={drag.piece} cellSize={CELL} gap={3} />
        </Animated.View>
      ) : null}

      {gameOverRef.current ? (
        <View style={styles.overlay}>
          <Text style={styles.overEmoji}>😵</Text>
          <Text style={styles.overTitle}>Oyun Bitti</Text>
          {newRecordRef.current ? <Text style={styles.record}>🎉 YENİ REKOR! 🎉</Text> : null}
          <Text style={styles.overScore}>{scoreRef.current}</Text>
          <Text style={styles.overBest}>👑 En iyi: {best}</Text>
          {canRevive ? (
            <TouchableOpacity style={styles.reviveBtn} onPress={revive} activeOpacity={0.85}>
              <Text style={styles.reviveText}>
                {adsSupported ? '🎬 REKLAM İZLE & DEVAM ET' : '▶️ DEVAM ET'}
              </Text>
              <Text style={styles.reviveHint}>tahta temizlenir, skorun korunur</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.restartBtn} onPress={restart} activeOpacity={0.85}>
            <Text style={styles.restartText}>YENİDEN OYNA</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 58 : 40,
  },
  titleRow: { flexDirection: 'row', marginBottom: 4 },
  titleChar: {
    fontSize: 26,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  soundBtn: {
    position: 'absolute',
    right: 18,
    top: Platform.OS === 'ios' ? 56 : 38,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
    padding: 8,
  },
  soundIcon: { fontSize: 18 },
  score: { color: colors.text, fontSize: 52, fontWeight: '900', marginTop: 2 },
  bestChip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 2,
    marginBottom: 10,
  },
  bestText: { color: colors.gold, fontWeight: '800', fontSize: 14 },
  comboText: { color: '#FF8A5B', fontWeight: '900', fontSize: 14 },
  boardWrap: { alignItems: 'center' },
  board: {
    backgroundColor: colors.boardBg,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.cellBorder,
    overflow: 'hidden',
  },
  emptyCell: {
    position: 'absolute',
    width: CELL - 3,
    height: CELL - 3,
    borderRadius: Math.max(4, CELL * 0.14),
    backgroundColor: colors.cellEmpty,
  },
  pop: { position: 'absolute', top: 6, alignItems: 'center', alignSelf: 'center' },
  popGain: {
    color: colors.gold,
    fontSize: 34,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  popCombo: { color: '#FF8A5B', fontSize: 18, fontWeight: '900' },
  tray: {
    flexDirection: 'row',
    width: BOARD_PX,
    marginTop: 14,
    flex: 1,
  },
  traySlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TRAY_CELL * 5 + 16,
  },
  dragLayer: { position: 'absolute', left: 0, top: 0 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overEmoji: { fontSize: 56, marginBottom: 6 },
  overTitle: { color: colors.text, fontSize: 34, fontWeight: '900', marginBottom: 6 },
  record: { color: colors.gold, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  overScore: { color: colors.text, fontSize: 60, fontWeight: '900' },
  overBest: { color: colors.textDim, fontSize: 16, fontWeight: '700', marginBottom: 26 },
  reviveBtn: {
    backgroundColor: '#4CE05B',
    borderRadius: 999,
    paddingHorizontal: 30,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#4CE05B',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  reviveText: { color: '#06230B', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  reviveHint: { color: 'rgba(6,35,11,0.7)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  restartBtn: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 38,
    paddingVertical: 15,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  restartText: { color: '#221A00', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
});
