import {StyleSheet} from 'react-native-unistyles';
import {View, Text} from 'react-native';
import type {Component, FC} from 'react';

const wrapper = (component: Component | FC) => component;

const styles = StyleSheet.create(() => ({
    container: {flex: 1, justifyContent: 'center'},
    foo1: {fontSize: 16},
    unusedStyle: {color: 'red'},
    someWrongOrderStyle: {margin: 10},
}));

const styles2 = StyleSheet['create']({
    container: {flex: 1, justifyContent: 'center'},
    foo3: {fontSize: 16, flex: 1},
    foo1: () => ({fontSize: 16, flex: 1}),
    foo2: () => {
        return {fontSize: 16, flex: 1};
    },
    foo0: function () {
        return {fontSize: 16, flex: 1};
    },
});

const App = () => (
    <View style={styles.container}>
        <Text style={styles.someWrongOrderStyle}>Hello, world!</Text>
    </View>
);

const MyComponent = wrapper(() => {
    return <Text style={styles2.foo1}>Hello</Text>;
});

const MyComponent2 = wrapper(function () {
    return <Text style={styles2.foo2()}>Hello</Text>;
});

function MyComponent3() {
    return wrapper(function namedfunc() {
        return <Text style={styles2.foo3()}>Hello</Text>;
    });
}
