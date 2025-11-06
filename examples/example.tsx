import {StyleSheet} from 'react-native-unistyles';
import {View, Text} from 'react-native';

const MyComponent = wrapper(() => {
    return <Text style={styles.foo}>Hello</Text>;
});

const App = () => (
    <View style={styles.container}>
        <Text style={styles.someWrongOrderStyle}>Hello, world!</Text>
    </View>
);

const styles = StyleSheet.create(() => ({
    container: {flex: 1, justifyContent: 'center'},
    foo: {fontSize: 16},
    unusedStyle: {color: 'red'},
    someWrongOrderStyle: {margin: 10},
}));
