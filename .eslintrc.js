module.exports = {
    env: {
        node: true,
    },
    rules: {
        'import/newline-after-import': ['off'],
        'import/no-dynamic-require': ['off'],
        'import/no-unresolved': ['off'],
        'arrow-parens': ['error', 'always'],
        camelcase: ['error', { ignoreDestructuring: true, properties: 'never' }],
        'global-require': ['off'],
        indent: ['error', 4],
        'no-await-in-loop': ['off'],
        'no-cond-assign': ['error', 'except-parens'],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-restricted-syntax': [
            'error',
            {
              selector: 'ForInStatement',
              message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
            },
            {
              selector: 'LabeledStatement',
              message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
            },
            {
              selector: 'WithStatement',
              message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
            },
      ],
    },
    extends: 'airbnb-base',
};