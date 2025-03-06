import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      {userData ? (
        <div>
          <p>Age: {userData.age}</p>
          <p>Height: {userData.height} cm</p>
          <p>Weight: {userData.weight} kg</p>
          <p>Activity Level: {userData.activityLevel}</p>
          <p>Sleep Time: {userData.sleepTime}</p>
          <p>Fitness Goal: {userData.fitnessGoal}</p>
          <p>Chronotype: {userData.chronotype}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserProfile;