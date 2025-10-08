import React from 'react'

export default function NavBar() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <div className="brand">VirtualStock</div>
      </div>
      <ul className="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">Portfolio</a></li>
        <li><a href="#">Trade</a></li>
        <li><a href="#">History</a></li>
      </ul>
      <div className="nav-right">
        <button className="btn primary">Sign In</button>
      </div>
    </nav>
  )
}
