import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AlertNotification from './AlertNotification';


const TaskScreen = ({ route }) => {
  const { user } = route.params; 
  const [tasks, setTasks] = useState([]);
  const [userStatus, setUserStatus] = useState('Online');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

 



  // also this one is to give task to the user : 'https://geekintern-backend-1.onrender.com/api/tasks'
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`https://geekintern-backend-1.onrender.com/api/tasks/${user._id}`); 
        setTasks(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTasks();
  }, [user._id]);

  const updateStatus = async (taskId, status) => {
    try {
      await axios.put(`https://geekintern-backend-1.onrender.com/api/tasks/${taskId}`, { status });
      Alert.alert('Status Updated', `Task is now ${status}`);
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? { ...task, status } : task
      ));
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to update status');
    }
  };
  const updateUserStatus = async (status) => {
    setUserStatus(status);
    Alert.alert('Status Updated', `User is now ${status}`);
  };






  


  // startStopTimer to handle button states
  const startStopTimer = async (taskId, action) => {
    if (!taskId || !action || !user._id) {
      console.error("Missing taskId, action, or userId");
      return;
    }
  
    try {
      const response = await axios.put(
        `https://geekintern-backend-1.onrender.com/api/tasks/${taskId}/updateTaskTimer`,
        { taskId, action, userId: user._id }
      );
      console.log("Backend Response:", response.data);
  
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? { ...task, ...response.data } : task
        )
      );
  
      
      setIsTimerRunning(response.data.timeStarted !== 0);
  
    } catch (error) {
      console.error("Error updating timer:", error.response ? error.response.data : error);
    }
  };
  
  
  
  
  
  
  
  

  const renderTask = ({ item }) => {
    console.log('Rendering Task:', item);
    const timeStarted = item.timeStarted !== null;
  
    return (
      <View style={styles.taskContainer}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskText}>Description: {item.description}</Text>
        <Text style={styles.taskText}>Assigned To: {item.assignedTo ? item.assignedTo.name : 'N/A'}</Text>
        <Text style={styles.taskText}>Assigned By: {item.assignedBy ? item.assignedBy.name : 'N/A'}</Text>
        <Text style={styles.taskText}>Deadline: {new Date(item.deadline).toLocaleString()}</Text>
        <Text style={styles.taskText}>Status: {item.status}</Text>
        <Text style={styles.taskText}>
          Time Spent: {item.timeSpent ? `${item.timeSpent} seconds` : 'Not tracked'}
        </Text>
        <Text style={styles.taskText}>Timer Started: {timeStarted ? 'Yes' : 'No'}</Text> 
      
        <View style={styles.buttonGroup}>
        <TouchableOpacity
  style={styles.button}
  onPress={() => startStopTimer(item._id, 'start')}
  disabled={isTimerRunning || item.timeStarted !== null} 
>
  <Text style={styles.buttonText}>Start Timer</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.button}
  onPress={() => startStopTimer(item._id, 'stop')}
  disabled={!isTimerRunning || item.timeStarted === null} 
>
  <Text style={styles.buttonText}>Stop Timer</Text>
</TouchableOpacity>

        </View>

  
        <View style={styles.statusButtonGroup}>
          <TouchableOpacity style={[styles.statusButton, styles.pendingButton]} onPress={() => updateStatus(item._id, 'Pending')}>
            <Text style={styles.statusButtonText}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statusButton, styles.inProgressButton]} onPress={() => updateStatus(item._id, 'In Progress')}>
            <Text style={styles.statusButtonText}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statusButton, styles.completedButton]} onPress={() => updateStatus(item._id, 'Completed')}>
            <Text style={styles.statusButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  taskText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  statusButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statusButton: {
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    width: '30%',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingButton: {
    backgroundColor: '#f0ad4e',
  },
  inProgressButton: {
    backgroundColor: '#5bc0de',
  },
  completedButton: {
    backgroundColor: '#5cb85c',
  },
  userStatusButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  userStatusButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  onlineButton: {
    backgroundColor: 'green',
  },
  offlineButton: {
    backgroundColor: 'red',
  },
  lunchButton: {
    backgroundColor: 'orange',
  },
  leaveButton: {
    backgroundColor: 'black',
  },
});

export default TaskScreen;
