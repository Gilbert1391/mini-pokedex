module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['pokedex', 'teams', 'core', 'common', 'state', 'cache']],
  },
};
