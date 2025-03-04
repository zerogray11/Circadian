import { useState } from 'react'



function App() {
  const [name, setName] = useState('')
  const [sleepTime, setSleepTime]=useState('')
  const[wakeTime, setWakeTime]=useState('')

  const handleSubmit= async (e) => {
    e.preventDefault()
    
    await fetch ('http://localhost:5000/add-user'), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body:JSON.stringify({ uid: 'test123', name, sleepTime, wakeTime}),

    }
    alert('User data added!')
  }

  return (
    <>
    <h1>Circadian App</h1>
    <form onsubmit={handleSubmit}>
      <input placeholder='Name' onChange={(e)=> setName(e.target.value)} />
      <input  placeholder='Time' onChange={(e)=> setSleepTime(e.target.value)}/>
      <input placeholder='Time' onChange={(e)=> setWakeTime(e.target.value)}/>
      <button type='submit'>Save</button>
    </form>
    </>
  )
}

export default App
