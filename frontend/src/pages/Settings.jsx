import React from 'react'
import { Settings } from 'lucide-react'

const SettingsPage = () => {
  return (
    <div className="container-fluid py-4">
      <div className="container">
        <section className="card mb-4">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-3"><Settings className="me-2" size={20} />Settings</h2>
            <p className="text-muted mb-3">User preferences and account settings (placeholder).</p>
            <div className="mb-3">
              <label className="form-label">Display name</label>
              <input className="form-control" placeholder="Your display name" />
            </div>
            <div className="mb-3">
              <label className="form-label">Email notifications</label>
              <select className="form-select"><option>Enabled</option><option>Disabled</option></select>
            </div>
            <div className="d-flex justify-content-end">
              <button className="btn btn-primary">Save</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage
