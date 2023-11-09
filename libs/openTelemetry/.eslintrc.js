/* eslint-disable i18next/no-literal-string */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'chai-friendly', 'import', 'mocha', 'i18next'],
  env: {
    browser: false,
    node: true,
  },
  ignorePatterns: ['dist/**', 'src/html/static/scripts/3party', 'scripts/**'],
  overrides: [
    {
      files: ['**/*.js'],
      rules: { '@typescript-eslint/explicit-function-return-type': 'off' },
    },
    {
      files: ['html/**/*'],
      env: {
        browser: true,
        jquery: true,
      },
      globals: { io: 'readonly' },
      rules: { '@typescript-eslint/no-unused-vars': 'off' },
    },
    {
      files: ['src/__tests__/**/*.ts'],
      rules: { 'i18next/no-literal-string': 0 },
    },
    {
      files: ['src/__tests__/**/*.test.ts'],
      env: { mocha: true },
      extends: ['plugin:mocha/recommended'],
      rules: {
        // for some reason it does not work
        'no-unused-expressions': 0,
        '@typescript-eslint/no-unused-expressions': 0, // chai.expect().to.be.true
        'i18next/no-literal-string': 0,
        'mocha/no-mocha-arrows': 0,
        'no-restricted-syntax': [
          'error',
          {
            // selector: "CallExpression > MemberExpression.callee > Identifier.property[name='firstCall']",
            selector:
              "MemberExpression[property.name='args'] > MemberExpression[property.name=/^.+Calls?$/]",
            message: 'Use .calledWithExactly instead of .args to gain argument type safety',
          },
        ],
      },
    },
    {
      files: ['migrations/**/*.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'no-useless-escape': 'off',
        'no-octal-escape': 'off',
        'global-require': 'off',
      },
    },
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'plugin:mocha/recommended',
  ],
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [['builtin', 'external'], ['internal', 'index', 'parent', 'sibling'], 'unknown'],
        pathGroups: [
          {
            pattern: '(utils|global|packages|providers|services|types)/**/*',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '*.css',
            patternOptions: { matchBase: true },
            group: 'unknown',
            position: 'after',
          },
          {
            pattern: '*.scss',
            patternOptions: { matchBase: true },
            group: 'unknown',
            position: 'after',
          },
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          'static-field',
          'field',
          'static-method',
          'constructor',
          'method',
          'signature'
        ],
      },
    ],
    'max-len': [
      'error',
      {
        code: 100,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreUrls: true,
      },
    ],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          multiline: true,
          consistent: true,
          minProperties: 2,
        },
        ObjectPattern: {
          multiline: true,
          consistent: true,
          minProperties: 2,
        },
        ImportDeclaration: { consistent: true },
        ExportDeclaration: {
          consistent: true,
          minProperties: 3,
        },
      },
    ],
    'object-property-newline': ['error', { allowMultiplePropertiesPerLine: false }],
    'array-bracket-newline': [
      'error',
      {
        multiline: true,
        minItems: 3,
      },
    ],
    'array-element-newline': [
      'error',
      {
        ArrayExpression: {
          multiline: true,
          minItems: 2,
        },
        ArrayPattern: 'consistent',
      },
    ],
    'prettier/prettier': [
      'off',
      { singleQuote: true },
      {
        usePrettierrc: false,
        fileInfoOptions: { withNodeModules: true },
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
      },
    ],
    indent: 'off',
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        SwitchCase: 1,
        flatTernaryExpressions: false,
        ignoredNodes: [
          'PropertyDefinition[decorators]',
          'TSUnionType',
          'FunctionExpression[params]:has(Identifier[decorators])',
          'TSTypeAnnotation',
          'TSTypeParameterInstantiation',
        ],
      },
    ],
    'dot-notation': 'off',
    'no-case-declarations': 'off',
    'no-console': 'error',
    semi: 'error',
    'no-lonely-if': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'max-classes-per-file': 'off',
    'import/prefer-default-export': 'off',
    'spaced-comment': [
      'error',
      'always',
      {
        exceptions: ['TODO', 'DEBUG', 'IMPLEMENT', 'FIXME'],
      },
    ],
    'jest/no-hooks': 'off',
    'prefer-template': 'off',
    'object-shorthand': 'off',
    'class-methods-use-this': 'off',
    'new-cap': [
      'error',
      {
        newIsCapExceptions: ['type'],
        capIsNewExceptions: ['Router'],
        capIsNewExceptionPattern: '@*',
      },
    ],
    'no-dupe-class-members': 'off',
    'no-plusplus': 'off',
    'no-loop-func': 'off',
    'prefer-destructuring': 'off',
    'no-unused-vars': 'off', // duplicated by @typescript-eslint/no-unused-vars
    // 'import/no-cycle': 'off',
    'no-await-in-loop': 'off',
    'padded-blocks': 'off',
    'no-param-reassign': 'off',
    'operator-linebreak': 'off',
    'no-underscore-dangle': 'off',
    'nonblock-statement-body-position': ['error', 'below'],
    // curly: ['error', 'multi'],
    curly: 'off',
    'implicit-arrow-linebreak': 'off',
    'brace-style': ['error', 'stroustrup', { allowSingleLine: false }],
    'func-names': 'off',
    'prefer-arrow-callback': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/typedef': [
      'off',
      {
        arrowParameter: true,
        variableDeclaration: true,
        variableDeclarationIgnoreFunction: false,
      },
    ],
    'no-return-await': 'off',
    'no-restricted-syntax': [
      'error',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement',
      // ForOfStatement is not an error
    ],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'warn',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'error',
    'lines-between-class-members': 'off', // duplicated by @typescript-eslint/lines-between-class-members
    '@typescript-eslint/lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterOverload: true,
        exceptAfterSingleLine: true,
      },
    ],
    '@typescript-eslint/type-annotation-spacing': ['error'],
    'i18next/no-literal-string': [
      'error',
      {
        validateTemplate: true,
        ignoreCallee: [
          'require',
          'on',
          'off',
          'db.collection',
          'routes',
          'route',
          'dt.isSame',
          'hbs.registerHelper',
          'path.join',
          'join',
          'formatDate',
          'log.error',
          'log.verbose',
          'log.warn',
          'log.debug',
          'log.info',
          'log.silly',
          'res.render',
          'res.cookie',
          'res.redirect',
          'res.header',
          'res.attachment',
          'adminApi.systemAction',
          'AuthenticationResponse.ui',
          'AuthenticationResponse.redirect',
          'addClass',
          'RegExp',
        ],
        ignore: [
          '^user/',
          '^users',
          '^users/',
          '^workspace/',
          '^workspaces',
          '^exportConfig',
          '^system/',
          '^config/',
          '^localization/',
          '^application/json$',
          '^utf-8$',
          '^.error',
          '^utf8$',
        ],
        ignoreProperty: [
          'redirect',
          'driver',
          'roles',
          'type',
          'template',
          'autocomplete',
          'action',
        ],
      },
    ],
  },
};
