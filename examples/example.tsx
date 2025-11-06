import {StyleSheet} from 'react-native-unistyles';
import {View, Text} from 'react-native';

const App = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.someWrongOrderStyle}>Hello, world!</Text>
        </View>
    );
};

const styles = StyleSheet.create(() => ({
    container: {flex: 1, justifyContent: 'center'},
    unusedStyle: {color: 'red'},
    someWrongOrderStyle: {margin: 10},
}));
