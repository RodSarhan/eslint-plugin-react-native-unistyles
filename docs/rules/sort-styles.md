# Require createStyleSheet keys to be sorted

It's like [sort-keys](https://eslint.org/docs/rules/sort-keys), but just for react-native-unistyles.

Keeping your style definitions sorted is a common convention that helps with readability. This rule lets you enforce an ascending (default) or descending alphabetical order for both style names and inner style properties.

## Rule Details

The following patterns are considered warnings:

```js
const styles = StyleSheet.create({
  button: {
    width: 100,
    color: 'green',
  },
});
```

```js
const styles = StyleSheet.create({
  button: {},
  anchor: {},
});
```

The following patterns are not considered warnings:

```js
const styles = StyleSheet.create({
  button: {
    color: 'green',
    width: 100,
  },
});
```

```js
const styles = StyleSheet.create({
  anchor: {},
  button: {},
});
```

## Options

```typescript
{
    "react-native-unistyles/sort-styles": ["error", "asc", { "ignoreStyleNames": false, "ignoreStyleProperties": false }]
}
```

The 1st option is "asc" or "desc".

* `"asc"`  - enforce ascending order (default).
* `"desc"` - enforce descending order.

The 2nd option is an object which has 2 properties.

* `ignoreStyleNames` - if `true`, order will not be enforced on the style names level. Default is `false`.
* `ignoreStyleProperties` - if `true`, order will not be enforced on the inner style properties level. Default is `false`.

### desc

`/* eslint react-native-unistyles/sort-styles: ["error", "desc"] */`

The following patterns are considered warnings:

```js
const styles = StyleSheet.create({
  button: {
    color: 'green',
    width: 100,
  },
});
```

```js
const styles = StyleSheet.create({
  anchor: {},
  button: {},
});
```

The following patterns are not considered warnings:

```js
const styles = StyleSheet.create({
  button: {
    width: 100,
    color: 'green',
  },
});
```

```js
const styles = StyleSheet.create({
  button: {},
  anchor: {},
});
```

### ignoreStyleNames

`/* eslint react-native-unistyles/sort-styles: ["error", "asc", { "ignoreStyleNames": true }] */`

The following patterns are not considered warnings:

```js
const styles = StyleSheet.create({
  button: {
    color: 'green',
    width: 100,
  },
  anchor: {},
});
```

## ignoreStyleProperties

`/* eslint react-native-unistyles/sort-styles: ["error", "asc", { "ignoreStyleProperties": true }] */`

The following patterns are not considered warnings:

```js
const styles = StyleSheet.create({
  anchor: {},
  button: {
    width: 100,
    color: 'green',
  },
});
```
