# Detect unused Unistyles styles in React components

When working on a component over a longer period of time, you could end up with unused unistyles styles that you forgot to delete.

## Rule Details

The following patterns are considered warnings:

```js
const styleSheet = createStyleSheet({
  text: {}
});

const MyComponent = () => {
  const {styles} = useStyles(styleSheet);
  return <Text>Hello</Text>
};
```

The following patterns are not considered warnings:

```js
const styleSheet = createStyleSheet({
  text: {}
});

const MyComponent = () => {
  const {styles} = useStyles(styleSheet);
  return <Text style={styles.text}>Hello</Text>
};
```

```js
const styleSheet = createStyleSheet({
  text: {}
});

const MyComponent = () => {
  const {styles: myStyles} = useStyles(styleSheet);
  return <Text textStyle={myStyles.text}>Hello</Text>
};
```

Styles referenced in a Style arrays are marked as used.

Styles referenced in a conditional and logical expressions are marked as used.

Style are also marked as used when they are used in tags that contain the word `style`.

There should be at least one component in the file for this rule to take effect.
