import { useState, useCallback } from 'react';
import { ViewName } from '../types';

export function useViewState() {
  const [currentView, setCurrentView] = useState<ViewName>('dashboard');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const openModuleDetail = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId);
    setIsDetailOpen(true);
  }, []);

  const closeModuleDetail = useCallback(() => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedModuleId(null), 300);
  }, []);

  return {
    currentView,
    setCurrentView,
    selectedModuleId,
    isDetailOpen,
    openModuleDetail,
    closeModuleDetail,
  };
}
