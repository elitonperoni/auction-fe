'use client';

import { useRef } from 'react';
import { useDispatch } from 'react-redux'; // Ou seu useAppDispatch tipado
import { Dictionary } from '@/lib/get-dictionary';
import { setDictionary } from '../store/slices/userSlice';

export default function DictionaryProvider({ dict }: { dict: Dictionary }) {
  const loaded = useRef(false);
  const dispatch = useDispatch();

  if (!loaded.current) {
    dispatch(setDictionary(dict));
    loaded.current = true;
  }

  return null; 
}