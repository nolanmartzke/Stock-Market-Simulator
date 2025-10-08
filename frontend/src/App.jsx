import './App.css'
import React from 'react'
import NavBar from './components/NavBar'
import Home from './pages/Home'

export default function App() {
  return (

    <div className="app-root">
      <NavBar />
      <Home />
    </div>
  )
}
