import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileIcon = ({ user, onLogout, updateStatus, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState(user.status || 'Offline');
  const [editMode, setEditMode] = useState(false);
  const [userInfo, setUserInfo] = useState({ ...user });
  const [profilePic, setProfilePic] = useState(null); // State for profile picture


  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`https://geekintern-backend-1.onrender.com/api/profile/${user._id}`);
      setUserInfo(response.data);
      
      let profilePicPath = response.data.profilePic;
  
      if (profilePicPath && profilePicPath.startsWith("/")) {
        profilePicPath = profilePicPath.substring(1); // Remove leading slash
      }
  
      if (!profilePicPath.startsWith("uploads/")) {
        profilePicPath = `uploads/${profilePicPath}`; // Add 'uploads/' if not present
      }
  
      const updatedProfilePic = `https://geekintern-backend-1.onrender.com/${profilePicPath}?t=${new Date().getTime()}`;
      console.log("Profile Picture URL after fetch:", updatedProfilePic);
      setProfilePic(updatedProfilePic);
    } catch (error) {
      if (error.response) {
        // If there's a response error (e.g., 404, 500)
        console.error('Error fetching profile:', error.response.data);
      } else if (error.request) {
        // If the request was made but no response received
        console.error('Error making request:', error.request);
      } else {
        // If there's an error in setting up the request
        console.error('Request Error:', error.message);
      }
    }
  };
  

  useEffect(() => {
    if (user.profilePic) {
        let profilePicPath = user.profilePic;
        if (profilePicPath.startsWith("/")) {
          profilePicPath = profilePicPath.substring(1); // Remove leading slash
        }
        
        // Add 'uploads/' only if it's not already part of the path
        if (!profilePicPath.startsWith("uploads/")) {
          profilePicPath = `uploads/${profilePicPath}`;
        }
        const profilePicUrl = `https://geekintern-backend-1.onrender.com/${profilePicPath}`;
        console.log("Profile Picture URL:", profilePicUrl);
        setProfilePic(profilePicUrl);
    }
}, [user.profilePic]);

  



  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      const userId = user._id;
      const response = await axios.put(
        `https://geekintern-backend-1.onrender.com/api/profile/${userId}/update`,
        { status: newStatus }
      );
      if (response.data.message === 'Profile updated successfully') {
        alert('Status updated successfully');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating status');
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSaveChanges = async () => {
    const updatedUserInfo = {
      ...userInfo,
      name: userInfo.name,
      email: userInfo.email,
      role: userInfo.role,
    };

    setUserInfo(updatedUserInfo);

    try {
      const userId = user._id;
      const response = await axios.put(
        `https://geekintern-backend-1.onrender.com/api/profile/${userId}/update`,
        {
          name: userInfo.name,
          email: userInfo.email,
          status: status,
          role: userInfo.role,
        }
      );
      if (response.data.message === 'Profile updated successfully') {
        setEditMode(false);
        alert('Profile updated successfully');
      } else {
        setUserInfo(updatedUserInfo);
        alert('Error updating profile');
      }
    } catch (error) {
      console.error(error);
      setUserInfo(updatedUserInfo);
      alert('Error updating profile');
    }
  };

  const handleLogout = () => {
    onLogout();
    navigation.navigate('Login');
  };

  const handleUploadProfilePic = async () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.error('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets[0]) {
        const { uri, fileName, type } = response.assets[0];
        setProfilePic(uri); // Update UI immediately with the selected image
  
        try {
          const formData = new FormData();
          formData.append('profilePic', {
            uri,
            name: fileName || `profile-pic.${uri.split('.').pop()}`,
            type: type || 'image/jpeg', // Default type if not provided
          });
  
          const userId = user._id;
          console.log('Uploading profile picture for user:', userId);
  
          const uploadResponse = await axios.post(
            `https://geekintern-backend-1.onrender.com/api/profile/${userId}/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
  
          if (uploadResponse.data.user && uploadResponse.data.user.profilePic) {
            let profilePicPath = uploadResponse.data.user.profilePic;
            
            // Ensure the path does not already include 'uploads/'
            if (profilePicPath.startsWith("/")) {
              profilePicPath = profilePicPath.substring(1); // Remove leading slash
            }
            
            
          
            const updatedProfilePic = `https://geekintern-backend-1.onrender.com/${profilePicPath}?t=${new Date().getTime()}`;
            console.log("Profile Picture URL after upload:", updatedProfilePic);
            setProfilePic(updatedProfilePic);
            alert('Profile picture updated successfully');
          } else {
            alert('Error retrieving profile picture URL');
          }
             
        } catch (error) {
          console.error('Upload Error:', error);
          alert('Error uploading profile picture');
        }
      }
    });
  };
  

  return (
    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View style={styles.profileIcon}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
          ) : (
            <Icon name="user" size={30} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Icon name="times" size={25} color="#000" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{userInfo.name}</Text>
            <Text style={styles.modalText}>Email: {userInfo.email}</Text>
            <Text style={styles.modalText}>Role: {userInfo.role}</Text>

            {editMode ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={userInfo.name}
                  onChangeText={(text) => setUserInfo({ ...userInfo, name: text })}
                  placeholder="Edit Name"
                />
                <TextInput
                  style={styles.input}
                  value={userInfo.email}
                  onChangeText={(text) => setUserInfo({ ...userInfo, email: text })}
                  placeholder="Edit Email"
                />
                <TextInput
                  style={styles.input}
                  value={userInfo.role}
                  onChangeText={(text) => setUserInfo({ ...userInfo, role: text })}
                  placeholder="Edit Role"
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.modalText}>Status: {status}</Text>
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: 'green' }]}
                    onPress={() => handleStatusChange('Online')}
                  >
                    <Text style={styles.statusButtonText}>Online</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: 'red' }]}
                    onPress={() => handleStatusChange('Offline')}
                  >
                    <Text style={styles.statusButtonText}>Offline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: 'orange' }]}
                    onPress={() => handleStatusChange('Lunch')}
                  >
                    <Text style={styles.statusButtonText}>Lunch</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: 'black' }]}
                    onPress={() => handleStatusChange('Leave')}
                  >
                    <Text style={styles.statusButtonText}>Leave</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadProfilePic}>
              <Text style={styles.uploadButtonText}>Upload Profile Picture</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
              <Text style={styles.editButtonText}>{editMode ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    paddingRight: 10,
  },
  profileIcon: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  statusButton: {
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#cc0002',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileIcon;
