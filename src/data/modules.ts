export interface ModuleDefinition {
  name: string;
  description: string;
  prefix: string;
  phase: string;
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    name: 'CRM',
    description: 'Client relationship management',
    prefix: 'crm',
    phase: 'phase-1',
  },
  {
    name: 'Offsite & Procore',
    description: 'Modular construction management + field operations (RFIs, submittals, daily logs)',
    prefix: 'offsite-procore',
    phase: 'phase-1',
  },
  {
    name: 'Bidding / Tenders',
    description: 'Tender scraping and bid tracking',
    prefix: 'bidding',
    phase: 'phase-1',
  },
  {
    name: 'Grants / Gov Funds',
    description: 'Government funding tracker',
    prefix: 'grants',
    phase: 'phase-1',
  },
  {
    name: 'Live Material Pricing',
    description: 'Real-time construction material prices',
    prefix: 'pricing',
    phase: 'phase-1',
  },
  {
    name: 'Document Generation',
    description: 'Template-based document engine',
    prefix: 'docgen',
    phase: 'phase-1',
  },
  {
    name: 'Site Photos',
    description: 'Mobile + web photo management',
    prefix: 'photos',
    phase: 'phase-1',
  },
  {
    name: 'CBS AI Agent',
    description: 'AI chatbot with full ERP access',
    prefix: 'ai-agent',
    phase: 'phase-1',
  },
  {
    name: 'Mission Control Shell',
    description: 'Main shell application — auth, navigation, module mounting, event bus wiring',
    prefix: 'shell',
    phase: 'phase-2',
  },
];
