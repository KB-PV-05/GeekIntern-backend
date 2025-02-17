import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import {PanGestureHandler, State} from 'react-native-gesture-handler';

const AlertNotification = ({user}) => {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const notifiedTasksRef = useRef(new Set());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `https://geekintern-backend-1.onrender.com/api/tasks/${user._id}`,
        );
        setTasks(response.data);
        checkNotifications(response.data);
      } catch (error) {
        console.log('Error fetching tasks:', error);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 60000); // Check every 60 seconds
    return () => clearInterval(interval);
  }, [user._id]);

  const addNotification = (type, title, message, taskId) => {
    if (!notifiedTasksRef.current.has(taskId)) {
      setNotifications(prev => [...prev, {id: taskId, type, title, message}]);
      notifiedTasksRef.current.add(taskId);
    }
  };

  const removeNotification = id => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    notifiedTasksRef.current.delete(id);
  };

  const checkNotifications = taskList => {
    const now = new Date();

    taskList.forEach(task => {
      if (!task.deadline || !task.status) return;

      const deadline = new Date(task.deadline);
      const timeLeft = deadline - now;

      if (task.status === 'Pending') {
        addNotification(
          'info',
          '📌 New Task Assigned',
          `📝 You have a new task: "${task.title}"`,
          task._id,
        );
      }

      if (timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000) {
        addNotification(
          'warning',
          '⏳ Task Deadline Approaching',
          `🚀 Your task "${task.title}" is due soon!`,
          `${task._id}-deadline`,
        );
      }

      if (timeLeft < 0 && task.status !== 'Completed') {
        addNotification(
          'error',
          '❗ Task Overdue',
          `⚠️ Your task "${task.title}" is overdue!`,
          `${task._id}-overdue`,
        );
        addNotification(
          'info',
          '⏳ Reminder to Complete Task',
          `🔔 Please mark "${task.title}" as completed!`,
          `${task._id}-reminder`,
        );
      }
    });
  };

  const renderNotification = ({item}) => {
    const translateX = new Animated.Value(0);

    const onGestureEvent = Animated.event(
      [{nativeEvent: {translationX: translateX}}],
      {useNativeDriver: true},
    );

    const onHandlerStateChange = event => {
      if (event.nativeEvent.state === State.END) {
        if (Math.abs(event.nativeEvent.translationX) > 100) {
          Animated.timing(translateX, {
            toValue: event.nativeEvent.translationX > 0 ? 300 : -300,
            duration: 300,
            useNativeDriver: true,
          }).start(() => removeNotification(item.id));
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      }
    };

    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View style={[styles.notification, {transform: [{translateX}]}]}>
          <Text style={styles.notificationText}>
            {item.title}: {item.message}
          </Text>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  return (
    <View>
      {/* Bell Icon with Badge */}
      <TouchableOpacity
  onPress={() => setShowDropdown(!showDropdown)}
  style={styles.bellContainer}>
  <View style={styles.bellBackground}>
    <Icon name="bell-o" size={30} color="#000" />
  </View>
  {notifications.length > 0 && (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{notifications.length}</Text>
    </View>
  )}
</TouchableOpacity>


      {/* Notification Dropdown */}
      {showDropdown && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownHeader}>Notifications</Text>
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderNotification}
          />
          {notifications.length === 0 && (
            <Text style={styles.noNotifications}>No new notifications</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    marginRight: 15,
    position: 'relative',
  },
  bellBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
  },  
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    top: 35,
    right: 0,
    backgroundColor: 'white',
    width: 250,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notification: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginVertical: 5,
    borderRadius: 5,
  },
  notificationText: {
    fontSize: 14,
  },
  noNotifications: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
});

export default AlertNotification;
