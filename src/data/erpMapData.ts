import { IntegrationMap } from '../types';
import { generateId } from '../utils/id';

export function createDefaultERPMap(): IntegrationMap {
  const erpId = generateId();
  const aiId = generateId();
  const crmId = generateId();
  const offsiteId = generateId();
  const procoreId = generateId();
  const pricingId = generateId();
  const biddingId = generateId();
  const docgenId = generateId();
  const photosId = generateId();
  const grantsId = generateId();

  const nodes = [
    // ERP Hub
    { id: erpId, label: 'Cube Building Systems ERP', subtitle: 'Central integration hub', type: 'service' as const, x: 600, y: 60, width: 280, height: 70, color: '#6C5CE7' },
    // AI Agent
    { id: aiId, label: 'CBS AI Agent', subtitle: 'Full ERP access, tasks, chatbot', type: 'service' as const, x: 1000, y: 60, width: 200, height: 70, color: '#F39C12' },
    // Tier 1
    { id: crmId, label: 'CRM', subtitle: 'Clients, leads, pipeline', type: 'module' as const, x: 160, y: 260, width: 200, height: 65, color: '#0ABAB5' },
    { id: offsiteId, label: 'Offsite', subtitle: 'Modular construction', type: 'module' as const, x: 440, y: 260, width: 200, height: 65, color: '#E17055' },
    { id: procoreId, label: 'Procore (Replica)', subtitle: 'Field ops, RFIs, submittals', type: 'module' as const, x: 720, y: 260, width: 200, height: 65, color: '#D63031' },
    { id: pricingId, label: 'Live Material Pricing', subtitle: 'Lumber, steel, real-time rates', type: 'module' as const, x: 1000, y: 260, width: 210, height: 65, color: '#0984E3' },
    // Tier 2
    { id: biddingId, label: 'Bidding / Tenders', subtitle: 'Scrapes and tracks tenders', type: 'module' as const, x: 160, y: 480, width: 200, height: 65, color: '#FDCB6E' },
    { id: docgenId, label: 'Document Generation', subtitle: 'Proposals, RFPs, reports', type: 'module' as const, x: 440, y: 480, width: 200, height: 65, color: '#A29BFE' },
    { id: photosId, label: 'Site Photos', subtitle: 'Mobile app + web database', type: 'module' as const, x: 720, y: 480, width: 200, height: 65, color: '#E056A0' },
    { id: grantsId, label: 'Grants / Gov Funds', subtitle: 'Government grants and funding', type: 'module' as const, x: 1000, y: 480, width: 210, height: 65, color: '#00B894' },
  ];

  const connections = [
    // ERP → Tier 1 (solid, primary)
    { id: generateId(), from: erpId, to: crmId, fromAnchor: 'bottom' as const, toAnchor: 'top' as const, label: 'Client data', style: 'solid' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: erpId, to: offsiteId, fromAnchor: 'bottom' as const, toAnchor: 'top' as const, label: 'Project data', style: 'solid' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: erpId, to: procoreId, fromAnchor: 'bottom' as const, toAnchor: 'top' as const, label: 'Field docs', style: 'solid' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: erpId, to: pricingId, fromAnchor: 'bottom' as const, toAnchor: 'top' as const, label: 'Price feeds', style: 'solid' as const, offsetX: 0, offsetY: 0 },
    // ERP → AI Agent
    { id: generateId(), from: erpId, to: aiId, fromAnchor: 'right' as const, toAnchor: 'left' as const, label: 'Full data access', style: 'solid' as const, offsetX: 0, offsetY: 0 },
    // Tier 1 → Tier 2 (solid)
    { id: generateId(), from: crmId, to: biddingId, fromAnchor: 'bottom' as const, toAnchor: 'top' as const, label: 'Tender contacts', style: 'solid' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: offsiteId, to: docgenId, fromAnchor: 'bottom' as const, toAnchor: 'top' as const, label: 'Project details', style: 'solid' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: procoreId, to: photosId, fromAnchor: 'bottom' as const, toAnchor: 'top' as const, label: 'Site records', style: 'solid' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: pricingId, to: grantsId, fromAnchor: 'bottom' as const, toAnchor: 'top' as const, label: 'Cost context', style: 'solid' as const, offsetX: 0, offsetY: 0 },
    // Cross-module (dashed)
    { id: generateId(), from: offsiteId, to: procoreId, fromAnchor: 'right' as const, toAnchor: 'left' as const, label: '', style: 'dashed' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: pricingId, to: offsiteId, fromAnchor: 'left' as const, toAnchor: 'right' as const, label: 'BIM cost data', style: 'dashed' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: biddingId, to: offsiteId, fromAnchor: 'top' as const, toAnchor: 'bottom' as const, label: 'Won tenders', style: 'dashed' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: biddingId, to: crmId, fromAnchor: 'top' as const, toAnchor: 'bottom' as const, label: 'New leads', style: 'dashed' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: biddingId, to: docgenId, fromAnchor: 'right' as const, toAnchor: 'left' as const, label: 'RFP responses', style: 'dashed' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: crmId, to: docgenId, fromAnchor: 'bottom' as const, toAnchor: 'left' as const, label: 'Client fields', style: 'dashed' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: photosId, to: offsiteId, fromAnchor: 'top' as const, toAnchor: 'bottom' as const, label: 'Photo logs', style: 'dashed' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: photosId, to: procoreId, fromAnchor: 'top' as const, toAnchor: 'bottom' as const, label: 'Field photos', style: 'dashed' as const, offsetX: 0, offsetY: 0 },
    { id: generateId(), from: grantsId, to: crmId, fromAnchor: 'left' as const, toAnchor: 'right' as const, label: 'Funding for clients', style: 'dashed' as const, offsetX: 0, offsetY: 0 },
  ];

  return { nodes, connections };
}
