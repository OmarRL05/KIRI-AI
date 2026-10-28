import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getLanguage, type LangCode } from './types';

/** Speaks a word in its language and exposes the speaking state. */
export function useSpeak() {
  const [speaking, setSpeaking] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      Speech.stop();
    };
  }, []);

  const speak = useCallback((text: string, language: LangCode) => {
    Speech.stop();
    setSpeaking(true);
    Speech.speak(text, {
      language: getLanguage(language).speech,
      rate: 0.9,
      onDone: () => {
        if (alive.current) setSpeaking(false);
      },
      onStopped: () => {
        if (alive.current) setSpeaking(false);
      },
      onError: () => {
        if (alive.current) setSpeaking(false);
      },
    });
  }, []);

  return { speak, speaking };
}
