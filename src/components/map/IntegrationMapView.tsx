import { IntegrationMap } from '../../types';
import { useDiagramEditor } from './useDiagramEditor';
import DiagramCanvas from './DiagramCanvas';
import DiagramToolbar from './DiagramToolbar';
import DiagramPropertiesPanel from './DiagramPropertiesPanel';

interface IntegrationMapViewProps {
  map: IntegrationMap;
  onUpdateMap: (map: IntegrationMap) => void;
  readOnly?: boolean;
}

export default function IntegrationMapView({ map, onUpdateMap, readOnly = false }: IntegrationMapViewProps) {
  const editor = useDiagramEditor(map, onUpdateMap, readOnly);

  return (
    <div className="flex gap-0 h-[calc(100vh-10rem)] rounded-xl overflow-hidden border border-border-primary">
      <div className="flex flex-col flex-1 min-w-0">
        {!readOnly && <DiagramToolbar editor={editor} />}
        <DiagramCanvas editor={editor} readOnly={readOnly} />
      </div>
      {editor.selection && !readOnly && (
        <DiagramPropertiesPanel editor={editor} />
      )}
    </div>
  );
}
