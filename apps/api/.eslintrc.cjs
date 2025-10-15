module.exports = {
  extends: ['@soulstone/eslint-config'],
  env: {
    node: true,
  },
  settings: {
    'import/core-modules': ['@jest/globals'],
  },
};
