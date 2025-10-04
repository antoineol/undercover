/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const prettierConfig = {
  plugins: ["prettier-plugin-tailwindcss"],
  importOrder: ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
  // importOrderSideEffects: false, or comment a single import: // sort-imports-ignore
};

export default prettierConfig;
