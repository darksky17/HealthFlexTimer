import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, SectionList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setTimers, updateTimerStatus, updateRemainingTime, resetTimer, markTimerAsCompleted } from '../redux/timersSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setHistory, addHistoryEntry } from '../redux/timersSlice';
import { sendNotification } from '../notificationService';
import Svg, { Circle } from 'react-native-svg';


const HomeScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const timers = useSelector((state) => state.timers.timers || []);
    const history = useSelector((state) => state.timers.history || []);

    const [expandedSections, setExpandedSections] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [completedTimerName, setCompletedTimerName] = useState('');

    useEffect(() => {
        const loadTimers = async () => {
            const storedTimers = await AsyncStorage.getItem('timers');
            const parsedTimers = storedTimers ? JSON.parse(storedTimers) : [];
            dispatch(setTimers(Array.isArray(parsedTimers) ? parsedTimers : []));
        };
        loadTimers();
    }, [dispatch]);

    useEffect(() => {
        const loadHistoryFromStorage = async () => {
            const storedHistory = await AsyncStorage.getItem('history');
            const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
            dispatch(setHistory(parsedHistory));  // Load history into Redux
        };
        loadHistoryFromStorage();
    }, [dispatch]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            timers.forEach((timer) => {
                if (timer.name == 'Physics'){
                console.log("Logging Timer", timer);}
                if (timer.status === 'Running' && timer.remainingTime > 0) {
                    dispatch(updateRemainingTime({ id: timer.id, remainingTime: timer.remainingTime - 1 }));
                }
                if (
                    timer.alertAtHalfway &&  // Check if user opted for 50% alert
                    timer.remainingTime === Math.floor(timer.duration / 2) // 50% reached
                ) {
                    sendNotification('Halfway There!', `${timer.name} is 50% completed.`);
                }
                if (timer.name == 'Physics'){
                    console.log("Logging Timer2222", timer.remainingTime, timer.status,timer.remainingTime === 0 && timer.status !== 'Completed');}
                 if (timer.remainingTime === 0 && timer.status !== 'Completed') {
                    console.log("Completed", timer.status);
                    dispatch(markTimerAsCompleted({ id: timer.id }));
                    console.log("Adding Modal", timer.name);
                    showModal(timer.name);
                }

            });
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timers, dispatch]);

    useEffect(() => {
        const saveTimersToStorage = async () => {
            await AsyncStorage.setItem('timers', JSON.stringify(timers));
        };
        if (timers.length > 0) {
            saveTimersToStorage();
        }
    }, [timers]);

    useEffect(() => {
        const saveHistoryToStorage = async () => {
            await AsyncStorage.setItem('history', JSON.stringify(history));
        };
        if (history.length > 0) {
            saveHistoryToStorage();
        }
    }, [history]);

    const showModal = (timerName) => {
        setCompletedTimerName(timerName);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setCompletedTimerName('');
    };

    const handleTimerAction = (id, status) => {
        const newStatus = status === 'Running' ? 'Paused' : 'Running';
        dispatch(updateTimerStatus({ id, status: newStatus }));
    };

    const handleReset = (id) => {
        const timerToReset = timers.find((timer) => timer.id === id);
        if (timerToReset) {
            dispatch(updateRemainingTime({ id, remainingTime: timerToReset.duration }));
            dispatch(updateTimerStatus({ id, status: 'Paused' }));
        }
    };

    const handleComplete = (id) => {
        dispatch(markTimerAsCompleted({ id }));
    };

    const handleBulkAction = (category, action) => {
        const categoryTimers = timers.filter((timer) => timer.category === category);
        categoryTimers.forEach((timer) => {
            if (action === 'Start') {
                dispatch(updateTimerStatus({ id: timer.id, status: 'Running' }));
            } else if (action === 'Pause') {
                dispatch(updateTimerStatus({ id: timer.id, status: 'Paused' }));
            } else if (action === 'Reset') {
                dispatch(updateRemainingTime({ id: timer.id, remainingTime: timer.originalDuration }));
                dispatch(updateTimerStatus({ id: timer.id, status: 'Paused' }));
            }
        });
    };

    const groupedTimers = Object.values(
        (timers || []).reduce((acc, timer) => {
            const { category } = timer;
            if (!acc[category]) {
                acc[category] = {
                    title: category,
                    data: [],
                };
            }
            acc[category].data.push(timer);
            return acc;
        }, {})
    );

    const toggleSection = (category) => {
        setExpandedSections((prevState) => ({
            ...prevState,
            [category]: !prevState[category],
        }));
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.addTimerButton} onPress={() => navigation.navigate('AddTimer')}>
                <Text style={styles.addTimerButtonText}>Add Timer</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={closeModal}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Congratulations!</Text>
                        <Text style={styles.modalText}>{completedTimerName} has completed!</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <SectionList
                sections={groupedTimers}
                renderItem={({ item }) => {
                    const percentage = item.originalDuration ? ((item.originalDuration - item.remainingTime) / item.originalDuration) * 100 : 0;
                    return (
                        <View>
                             
                        </View>
                    );
                }}
                renderSectionHeader={({ section }) => (
                    <View>
                        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section.title)}>
                            <Text style={styles.sectionHeaderText}>{section.title}</Text>
                        </TouchableOpacity>

                        <View style={styles.bulkActions}>
                            <TouchableOpacity style={styles.bulkActionButton} onPress={() => handleBulkAction(section.title, 'Start')}>
                                <Text style={styles.bulkActionText}>Start All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.bulkActionButton} onPress={() => handleBulkAction(section.title, 'Pause')}>
                                <Text style={styles.bulkActionText}>Pause All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.bulkActionButton} onPress={() => handleBulkAction(section.title, 'Reset')}>
                                <Text style={styles.bulkActionText}>Reset All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                extraData={expandedSections}
                renderSectionFooter={({ section }) =>
                    expandedSections[section.title] ? (
                        <FlatList
                            data={section.data}
                            renderItem={({ item }) => {
                                const percentage = item.originalDuration
                                    ? ((item.originalDuration - item.remainingTime) / item.originalDuration) * 100
                                    : 0;

                                return (
                                    <View style={styles.timerItem}>
                                        <View style={styles.timerRow}>
                                        <Text style={styles.timerName}>{item.name}</Text>
                                        <CircularProgress progress={1 - item.remainingTime / item.originalDuration} />
                                        </View>
                                        <Text style={styles.timerDetails}>Remaining: {item.remainingTime}s</Text>
                                        <Text style={styles.timerDetails}>Status: {Math.round(percentage)}% finished</Text>
                                        {item.status === 'Completed' && (
                                            <Text style={styles.completedText}>Completed</Text>
                                        )}

                                        <View style={styles.timerControls}>
                                            <TouchableOpacity
                                                style={styles.controlButton}
                                                onPress={() => handleTimerAction(item.id, item.status)}
                                            >
                                                <Text style={styles.controlButtonText}>{item.status === 'Running' ? 'Pause' : 'Start'}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.controlButton}
                                                onPress={() => handleReset(item.id)}
                                            >
                                                <Text style={styles.controlButtonText}>Reset</Text>
                                            </TouchableOpacity>
                                            {item.status !== 'Completed' && (
                                                <TouchableOpacity
                                                    style={styles.controlButton}
                                                    onPress={() => handleComplete(item.id)}
                                                >
                                                    <Text style={styles.controlButtonText}>Complete</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                );
                            }}
                            keyExtractor={(item) => item.id.toString()}
                        />
                    ) : null
                }
            />
            <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('History')}>
                <Text style={styles.historyButtonText}>View History</Text>
            </TouchableOpacity>
        </View>
    );
};

const CircularProgress = ({ progress }) => {
    const radius = 8;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - progress);

    return (
        <Svg height="50" width="50">
            <Circle cx="25" cy="25" r={radius} stroke="gray" strokeWidth={strokeWidth} fill="none" opacity={0.2} />
            <Circle
                cx="25"
                cy="25"
                r={radius}
                stroke="blue"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
            />
        </Svg>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    addTimerButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    addTimerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: 300,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    timerItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 5,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    timerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    timerDetails: {
        fontSize: 14,
        color: '#666',
    },
    completedText: {
        fontSize: 14,
        color: 'green',
        fontWeight: 'bold',
    },
    timerControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    controlButton: {
        backgroundColor: '#008CBA',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    controlButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    sectionHeader: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    bulkActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    bulkActionButton: {
        backgroundColor: '#f1c40f',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    bulkActionText: {
        color: '#fff',
        fontSize: 14,
    },
    historyButton: {
        backgroundColor: '#34495e',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    historyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    timerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',  // This ensures the text and circle are vertically aligned
    },
});

export default HomeScreen;