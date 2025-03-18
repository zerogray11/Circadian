import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import QuestionnaireUI from './QuestionnaireUI';

const StepByStepQuestionnaire = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    activityLevel: 'sedentary',
    fitnessGoal: 'weightLoss',
    wakeTime: '',
    sleepTime: '',
    bestTime: '',
    wakeDifficulty: '',
    mentalWorkTime: '',
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24HourFormat = (time) => {
    const [hours, minutes] = time.split(':');
    let parsedHours = parseInt(hours, 10);

    if (parsedHours < 12 && time.includes('PM')) {
      parsedHours += 12;
    }
    if (parsedHours === 12 && time.includes('AM')) {
      parsedHours = 0;
    }

    return `${parsedHours}:${minutes}`;
  };

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time) => {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
  };

  // Define questions
  const questions = [
    {
      id: 'name',
      question: 'What is your name?',
      type: 'text',
      placeholder: 'Enter your full name',
      validation: (value) => value.trim().length > 0,
    },
    {
      id: 'age',
      question: 'How old are you?',
      type: 'number',
      placeholder: 'Enter your age',
      validation: (value) => value > 0 && value < 120,
    },
    {
      id: 'height',
      question: 'What is your height?',
      type: 'number',
      placeholder: 'Height in cm',
      suffix: 'cm',
      validation: (value) => value > 0,
    },
    {
      id: 'weight',
      question: 'What is your weight?',
      type: 'number',
      placeholder: 'Weight in kg',
      suffix: 'kg',
      validation: (value) => value > 0,
    },
    {
      id: 'activityLevel',
      question: 'What is your activity level?',
      type: 'select',
      options: [
        { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
        { value: 'lightlyActive', label: 'Lightly Active (light exercise 1-3 days/week)' },
        { value: 'moderatelyActive', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
        { value: 'veryActive', label: 'Very Active (intense exercise 6-7 days/week)' },
      ],
    },
    {
      id: 'fitnessGoal',
      question: 'What is your primary fitness goal?',
      type: 'select',
      options: [
        { value: 'weightLoss', label: 'Weight Loss' },
        { value: 'muscleGain', label: 'Muscle Gain' },
        { value: 'generalWellness', label: 'General Wellness & Health' },
      ],
    },
    {
      id: 'wakeTime',
      question: 'What time would you prefer to wake up if you had no obligations?',
      type: 'time',
      placeholder: 'Select your wake time',
    },
    {
      id: 'sleepTime',
      question: 'What time would you prefer to go to sleep if you were free to plan?',
      type: 'time',
      placeholder: 'Select your sleep time',
    },
    {
      id: 'bestTime',
      question: 'At what time of day do you feel your best mentally and physically?',
      type: 'time',
      placeholder: 'Select your best time',
    },
    {
      id: 'wakeDifficulty',
      question: 'How easy is it for you to wake up in the morning?',
      type: 'select',
      options: [
        { value: 5, label: 'Very easy' },
        { value: 4, label: 'Somewhat easy' },
        { value: 3, label: 'Neutral' },
        { value: 2, label: 'Somewhat difficult' },
        { value: 1, label: 'Very difficult' },
      ],
    },
    {
      id: 'mentalWorkTime',
      question: 'If you had to do 2 hours of hard mental work, when would you prefer to do it?',
      type: 'time',
      placeholder: 'Select your mental work time',
    },
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle time input changes
  const handleTimeChange = (name, time) => {
    const time24Hour = convertTo24HourFormat(time);
    setFormData((prev) => ({
      ...prev,
      [name]: time24Hour,
    }));
  };

  // Navigate to next question
  const handleNext = () => {
    const currentQuestion = questions[currentStep];

    if (currentQuestion.validation && !currentQuestion.validation(formData[currentQuestion.id])) {
      showNotification('Please enter a valid value', 'error');
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate chronotype
  const calculateChronotype = (formData) => {
    const { wakeTime, sleepTime, bestTime, wakeDifficulty, mentalWorkTime } = formData;

    const wakeHour = parseInt(wakeTime.split(':')[0], 10);
    const sleepHour = parseInt(sleepTime.split(':')[0], 10);
    const bestHour = parseInt(bestTime.split(':')[0], 10);
    const mentalWorkHour = parseInt(mentalWorkTime.split(':')[0], 10);

    let score = 0;

    if (wakeHour <= 6) score += 2;
    else if (wakeHour <= 8) score += 1;
    else if (wakeHour >= 9) score -= 1;

    if (sleepHour >= 23) score -= 2;
    else if (sleepHour >= 22) score -= 1;
    else if (sleepHour <= 21) score += 1;

    if (bestHour < 12) score += 2;
    else if (bestHour >= 12 && bestHour < 16) score += 1;
    else if (bestHour >= 16) score -= 1;

    if (wakeDifficulty >= 4) score += 1;
    else if (wakeDifficulty <= 2) score -= 1;

    if (mentalWorkHour < 12) score += 1;
    else if (mentalWorkHour >= 12 && mentalWorkHour < 16) score += 0;
    else if (mentalWorkHour >= 16) score -= 1;

    if (score >= 5) return 'Morning Lark';
    if (score <= -5) return 'Night Owl';
    return 'Intermediate Type';
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });

    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const chronotype = calculateChronotype(formData);

      const processedData = {
        name: formData.name,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        activityLevel: formData.activityLevel,
        fitnessGoal: formData.fitnessGoal,
        wakeTime: formData.wakeTime,
        sleepTime: formData.sleepTime,
        bestTime: formData.bestTime,
        wakeDifficulty: formData.wakeDifficulty,
        mentalWorkTime: formData.mentalWorkTime,
        chronotype,
        createdAt: new Date().toISOString(),
      };

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, processedData, { merge: true });

      showNotification('Profile information saved successfully!', 'success');

      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error saving data:', error);
      setError(error.message);
      showNotification(error.message, 'error');
    }
  };

  return (
    <QuestionnaireUI
      formData={formData}
      currentStep={currentStep}
      questions={questions}
      handleChange={handleChange}
      handleTimeChange={handleTimeChange}
      handleNext={handleNext}
      handlePrevious={handlePrevious}
      handleSubmit={handleSubmit}
      notification={notification}
    />
  );
};

export default StepByStepQuestionnaire;