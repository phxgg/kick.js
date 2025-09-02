/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import('prettier').Config}
 */
const config = {
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 120,
  importOrder: [
    // Always load env bootstrap first
    '^(env$|env/.*)',
    '<THIRD_PARTY_MODULES>',
    '',
    // Winston logger (any of: "@/winston.logger", "./winston.logger", "../winston.logger", "winston", etc.)
    '^(?:@/|(?:\\.\\.?/)+)?winston(?:\\.logger)?$',
    // DB module (any of: "@/db", "@/db/...", "./db", "../db", etc.)
    '^(?:@/|(?:\\.\\.?/)+)?db(?:$|/.*)$',    
    '',
    '^types$',
    '^@/types/(.*)$',
    '^@/config/(.*)$',
    '^@/utils/(.*)$',
    '^@/lib/(.*)$',
    '^@/(.*)$',
    '',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
};

export default config;
