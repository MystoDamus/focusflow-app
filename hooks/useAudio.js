import { useEffect, useRef } from "react";

function createNoiseBuffer(audioContext) {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let index = 0; index < channelData.length; index += 1) {
    channelData[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function stopAmbientAudio(audioStateRef) {
  if (!audioStateRef.current) {
    return;
  }

  const { nodes, context } = audioStateRef.current;

  nodes.forEach((node) => {
    try {
      if (typeof node.stop === "function") {
        node.stop();
      }
      if (typeof node.disconnect === "function") {
        node.disconnect();
      }
    } catch {
      return;
    }
  });

  context.close().catch(() => {});
  audioStateRef.current = null;
}

function startAmbientAudio(mode, volume, audioStateRef) {
  if (typeof window === "undefined") {
    return false;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return false;
  }

  stopAmbientAudio(audioStateRef);

  try {
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = Math.max(0.01, Math.min(0.12, volume / 1000));
    master.connect(context.destination);

    const nodes = [master];

    if (mode === "rain") {
      const rainNoise = context.createBufferSource();
      const rainFilter = context.createBiquadFilter();
      const rainGain = context.createGain();
      const mistNoise = context.createBufferSource();
      const mistFilter = context.createBiquadFilter();
      const mistGain = context.createGain();

      rainNoise.buffer = createNoiseBuffer(context);
      rainNoise.loop = true;
      rainFilter.type = "lowpass";
      rainFilter.frequency.value = 1400;
      rainGain.gain.value = 0.6;
      rainNoise.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(master);

      mistNoise.buffer = createNoiseBuffer(context);
      mistNoise.loop = true;
      mistFilter.type = "highpass";
      mistFilter.frequency.value = 2600;
      mistGain.gain.value = 0.1;
      mistNoise.connect(mistFilter);
      mistFilter.connect(mistGain);
      mistGain.connect(master);

      rainNoise.start();
      mistNoise.start();
      nodes.push(rainNoise, rainFilter, rainGain, mistNoise, mistFilter, mistGain);
    } else if (mode === "campfire") {
      const fireNoise = context.createBufferSource();
      const fireFilter = context.createBiquadFilter();
      const fireGain = context.createGain();
      const flicker = context.createOscillator();
      const flickerDepth = context.createGain();

      fireNoise.buffer = createNoiseBuffer(context);
      fireNoise.loop = true;
      fireFilter.type = "bandpass";
      fireFilter.frequency.value = 520;
      fireFilter.Q.value = 0.8;
      fireGain.gain.value = 0.42;
      flicker.type = "sine";
      flicker.frequency.value = 0.18;
      flickerDepth.gain.value = 0.08;

      fireNoise.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(master);
      flicker.connect(flickerDepth);
      flickerDepth.connect(fireGain.gain);

      fireNoise.start();
      flicker.start();
      nodes.push(fireNoise, fireFilter, fireGain, flicker, flickerDepth);
    } else {
      const oscillatorA = context.createOscillator();
      const oscillatorB = context.createOscillator();
      const oscillatorC = context.createOscillator();
      const gainA = context.createGain();
      const gainB = context.createGain();
      const gainC = context.createGain();
      const lfo = context.createOscillator();
      const lfoDepth = context.createGain();

      oscillatorA.type = mode === "dungeon" ? "sawtooth" : "sine";
      oscillatorB.type = mode === "library" ? "triangle" : "sine";
      oscillatorC.type = mode === "dungeon" ? "triangle" : "sine";
      oscillatorA.frequency.value = mode === "dungeon" ? 74 : 196;
      oscillatorB.frequency.value = mode === "dungeon" ? 111 : 247;
      oscillatorC.frequency.value = mode === "dungeon" ? 148 : 294;
      gainA.gain.value = 0.08;
      gainB.gain.value = 0.04;
      gainC.gain.value = mode === "dungeon" ? 0.025 : 0.03;
      lfo.type = "sine";
      lfo.frequency.value = mode === "dungeon" ? 0.09 : 0.14;
      lfoDepth.gain.value = mode === "dungeon" ? 0.028 : 0.02;

      oscillatorA.connect(gainA);
      oscillatorB.connect(gainB);
      oscillatorC.connect(gainC);
      gainA.connect(master);
      gainB.connect(master);
      gainC.connect(master);
      lfo.connect(lfoDepth);
      lfoDepth.connect(gainA.gain);
      lfoDepth.connect(gainB.gain);
      oscillatorA.start();
      oscillatorB.start();
      oscillatorC.start();
      lfo.start();
      nodes.push(oscillatorA, oscillatorB, oscillatorC, gainA, gainB, gainC, lfo, lfoDepth);
    }

    audioStateRef.current = { context, nodes };
    return true;
  } catch {
    return false;
  }
}

export default function useAudio(settings, updateSetting, showToast) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!settings.soundEnabled || !settings.ambientEnabled) {
      stopAmbientAudio(audioRef);
      return undefined;
    }

    const started = startAmbientAudio(
      settings.ambientMode,
      settings.reducedMotion ? 12 : 28,
      audioRef,
    );

    if (!started) {
      showToast("Ambient audio unavailable");
    }

    return () => {
      stopAmbientAudio(audioRef);
    };
  }, [settings.soundEnabled, settings.ambientEnabled, settings.ambientMode, settings.reducedMotion]);

  useEffect(() => {
    return () => {
      stopAmbientAudio(audioRef);
    };
  }, []);

  function toggleAmbientAudio() {
    if (settings.ambientEnabled) {
      updateSetting("ambientEnabled", false);
      showToast("Ambient audio stopped");
      return;
    }

    if (!settings.soundEnabled) {
      updateSetting("soundEnabled", true);
    }

    updateSetting("ambientEnabled", true);
    showToast(`Ambient audio: ${settings.ambientMode}`);
  }

  return { toggleAmbientAudio };
}
