import { useRef, useState, useCallback } from 'react';
import { ModuleStatus } from '../types';

export function useDragAndDrop(onDrop: (moduleId: string, targetStatus: ModuleStatus) => void) {
  const dragItem = useRef<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ModuleStatus | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, moduleId: string) => {
    dragItem.current = moduleId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', moduleId);
    (e.target as HTMLElement).style.opacity = '0.5';
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    dragItem.current = null;
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: ModuleStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: ModuleStatus) => {
      e.preventDefault();
      const moduleId = e.dataTransfer.getData('text/plain');
      if (moduleId) {
        onDrop(moduleId, targetStatus);
      }
      dragItem.current = null;
      setDragOverColumn(null);
    },
    [onDrop]
  );

  return {
    dragItem,
    dragOverColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
