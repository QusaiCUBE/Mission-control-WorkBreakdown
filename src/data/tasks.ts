export interface TaskTemplate {
  order: number;
  title: string;
  description: string;
}

export const INTEGRATION_TASKS: TaskTemplate[] = [
  {
    order: 1,
    title: 'Remove existing authentication/login system',
    description: 'Strip out the module\'s standalone auth. Users will be authenticated by Mission Control shell.',
  },
  {
    order: 2,
    title: 'Add x-mc-user header parsing',
    description: 'Parse the x-mc-user header to receive user info (id, name, role, permissions) from Mission Control.',
  },
  {
    order: 3,
    title: 'Add /manifest endpoint',
    description: 'Create a /manifest endpoint that returns module metadata for auto-discovery by the shell.',
  },
  {
    order: 4,
    title: 'Standardize API response format',
    description: 'Align all API responses to the shared spec format from @mission-control/shared.',
  },
  {
    order: 5,
    title: 'Add Redis event bus integration',
    description: 'Integrate with the shared Redis pub/sub event bus for cross-module communication.',
  },
  {
    order: 6,
    title: 'Export main UI as mountable React component',
    description: 'Refactor the module\'s UI entry point to export a mountable React component for the shell.',
  },
  {
    order: 7,
    title: 'Add database table prefixes',
    description: 'Add module-specific prefixes to all database tables to prevent naming collisions.',
  },
  {
    order: 8,
    title: 'Security audit and fixes',
    description: 'Add input validation, rate limiting, Helmet.js, and fix any security vulnerabilities.',
  },
  {
    order: 9,
    title: 'Testing — verify standalone operation',
    description: 'Run full test suite and verify the module works correctly after all integration changes.',
  },
  {
    order: 10,
    title: 'Code review and merge',
    description: 'Submit for code review, address feedback, and merge to main branch.',
  },
];
