import React from 'react';
import { es } from '../locales/es';

// Hook simplificado para obtener traducciones
// En el futuro puede reemplazarse por react-i18next o similar
export function useTranslation() {
  return {
    t: es
  };
}
