import React, { useState, useEffect } from 'react'
import { Trophy, TrendingUp, Users, Award, ArrowLeft, Calendar, DollarSign, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { 
  getAllTournaments, 
  createTournament, 
  enterTournament, 
  getTournamentLeaderboard,
  getUserTournaments 
} from '../api/TournamentApi'

const Tournament = () => {
  const { auth } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [userTournaments, setUserTournaments] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    maxParticipants: 100,
    initialCash: 10000,
    startDate: '',
    endDate: '',
    image: ''
  })

  useEffect(() => {
    fetchTournaments()
    if (auth) {
      fetchUserTournaments()
    }
  }, [auth])

  useEffect(() => {
    if (selectedTournament) {
      fetchLeaderboard(selectedTournament.id)
    }
  }, [selectedTournament])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const response = await getAllTournaments()
      setTournaments(response.data || [])
    } catch (error) {
      console.error('Failed to fetch tournaments:', error)
      setTournaments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTournaments = async () => {
    try {
      const response = await getUserTournaments(auth.id)
      const tournamentIds = new Set(response.data.map(t => t.id))
      setUserTournaments(tournamentIds)
    } catch (error) {
      console.error('Failed to fetch user tournaments:', error)
    }
  }

  const fetchLeaderboard = async (tournamentId) => {
    try {
      const response = await getTournamentLeaderboard(tournamentId)
      const formattedLeaderboard = response.data.map((entry, index) => ({
        rank: index + 1,
        username: entry.accountName,
        profit: `$${(entry.cash + entry.totalHoldingValue).toFixed(2)}`,
        flag: '🏆'
      }))
      setLeaderboard(formattedLeaderboard)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLeaderboard([])
    }
  }

  const handleCreateTournament = async (e) => {
    e.preventDefault()
    try {
      // Build tournament data - only include dates if provided
      const tournamentData = {
        name: createForm.name,
        maxParticipants: createForm.maxParticipants,
        initialCash: createForm.initialCash
      }
      // Include image URL if provided
      if (createForm.image) {
        tournamentData.image = createForm.image
      }
      
      // Only add dates if they're provided
      if (createForm.startDate) {
        tournamentData.startDate = createForm.startDate
      }
      if (createForm.endDate) {
        tournamentData.endDate = createForm.endDate
      }
      
      console.log('Sending tournament data:', tournamentData)
      await createTournament(tournamentData)
      setShowCreateModal(false)
      setCreateForm({
        name: '',
        maxParticipants: 100,
        initialCash: 10000,
        startDate: '',
        endDate: '',
        image: ''
      })
      await fetchTournaments()
      alert('Tournament created successfully!')
    } catch (error) {
      console.error('Failed to create tournament:', error)
      console.error('Error response:', error.response)
      const errorMsg = error.response?.data || error.message || 'Unknown error'
      alert(`Failed to create tournament: ${errorMsg}`)
    }
  }

  const handleEnterTournament = async (tournamentId) => {
    if (!auth) {
      alert('Please log in to enter tournaments')
      return
    }

    try {
      await enterTournament(tournamentId, auth.id)
      await fetchTournaments()
      await fetchUserTournaments()
      if (selectedTournament && selectedTournament.id === tournamentId) {
        await fetchLeaderboard(tournamentId)
      }
      alert('Successfully entered tournament!')
    } catch (error) {
      console.error('Failed to enter tournament:', error)
      const errorMsg = error.response?.data || 'Failed to enter tournament'
      alert(errorMsg)
    }
  }

  const isUserInTournament = (tournamentId) => {
    return userTournaments.has(tournamentId)
  }

  // Tournament List View
  if (!selectedTournament) {
    return (
      <div className="container-fluid py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 fw-bold mb-2">
                <Trophy className="me-2 text-warning" size={24} />
                Tournaments
              </h2>
              <p className="mb-0" style={{ color: '#aeb8de' }}>Compete with traders worldwide and win amazing prizes</p>
            </div>
            {auth && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} className="me-2" />
                Create Tournament
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="col-12 col-md-6 col-lg-4">
                  <div 
                    className="card h-100 shadow-sm hover-shadow transition" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedTournament(tournament)}
                  >
                    <img 
                      src={tournament.image} 
                      className="card-img-top" 
                      alt={tournament.name}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{tournament.name}</h5>
                        <span className={`badge ${
                          tournament.status === 'Active' ? 'bg-success' : 
                          tournament.status === 'Upcoming' ? 'bg-primary' : 
                          'bg-secondary'
                        }`}>
                          {tournament.status || 'Active'}
                        </span>
                      </div>
                      {isUserInTournament(tournament.id) && (
                        <span className="badge bg-info mb-2">Joined</span>
                      )}
                      
                      <div className="d-flex flex-column gap-2 small">
                        <div className="d-flex align-items-center text-muted">
                          <Users size={16} className="me-2" />
                          <span>{tournament.currentParticipants || 0} / {tournament.maxParticipants || 0}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted">
                          <Calendar size={16} className="me-2" />
                          <span>Ends: {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-transparent border-top-0">
                      <button className="btn btn-primary btn-sm w-100">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Tournament Modal */}
          {showCreateModal && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Create New Tournament</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowCreateModal(false)}
                    ></button>
                  </div>
                  <form onSubmit={handleCreateTournament}>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Tournament Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={createForm.name}
                          onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Max Participants</label>
                        <input
                          type="number"
                          className="form-control"
                          value={createForm.maxParticipants}
                          onChange={(e) => setCreateForm({...createForm, maxParticipants: parseInt(e.target.value)})}
                          min="2"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Initial Cash ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={createForm.initialCash}
                          onChange={(e) => setCreateForm({...createForm, initialCash: parseFloat(e.target.value)})}
                          min="1000"
                          step="1000"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Image URL</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="https://example.com/image.jpg"
                          value={createForm.image}
                          onChange={(e) => setCreateForm({...createForm, image: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Start Date</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={createForm.startDate}
                          onChange={(e) => setCreateForm({...createForm, startDate: e.target.value})}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">End Date</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={createForm.endDate}
                          onChange={(e) => setCreateForm({...createForm, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Create Tournament
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Tournament Detail View
  return (
    <div className="container-fluid py-4">
      <div className="container">
        {/* Back Button */}
        <button 
          className="btn btn-link text-decoration-none mb-3 p-0"
          onClick={() => setSelectedTournament(null)}
        >
          <ArrowLeft size={20} className="me-2" />
          Back to Tournaments
        </button>

        {/* Tournament Header */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <h2 className="h3 fw-bold mb-0">{selectedTournament.name}</h2>
                  <span className={`badge ${
                    selectedTournament.status === 'Active' ? 'bg-success' : 
                    selectedTournament.status === 'Upcoming' ? 'bg-primary' : 
                    'bg-secondary'
                  }`}>
                    {selectedTournament.status || 'Active'}
                  </span>
                </div>
                <div className="d-flex gap-4 flex-wrap">
                  <div className="d-flex align-items-center text-muted">
                    <Users size={18} className="me-2" />
                    <span><strong>Participants:</strong> {selectedTournament.currentParticipants || 0} / {selectedTournament.maxParticipants || 0}</span>
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    <Calendar size={18} className="me-2" />
                    <span><strong>Ends:</strong> {selectedTournament.endDate ? new Date(selectedTournament.endDate).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    <DollarSign size={18} className="me-2" />
                    <span><strong>Initial Cash:</strong> ${selectedTournament.initialCash || 10000}</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 mt-3 mt-lg-0">
                <img 
                  src={selectedTournament.image} 
                  className="img-fluid rounded" 
                  alt={selectedTournament.name}
                  style={{ maxHeight: '150px', objectFit: 'cover', width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Leaderboard */}
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4">
                  <Trophy className="me-2 text-warning" size={22} />
                  Leaderboard
                </h4>
                {leaderboard.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>User</th>
                          <th className="text-end">Total Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry) => (
                          <tr key={entry.rank}>
                            <td>
                              <span className={`fw-bold ${
                                entry.rank === 1 ? 'text-warning' :
                                entry.rank === 2 ? 'text-secondary' :
                                entry.rank === 3 ? 'text-danger' :
                                ''
                              }`}>
                                #{entry.rank}
                              </span>
                            </td>
                            <td>
                              <span className="me-2">{entry.flag}</span>
                              {entry.username}
                            </td>
                            <td className="text-end fw-semibold text-success">{entry.profit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    <Trophy size={48} className="mb-3 opacity-50" />
                    <p>No participants yet. Be the first to join!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tournament Info & Actions */}
          <div className="col-lg-4">
            {/* Tournament Info */}
            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Tournament Info</h5>
                <div className="mb-3">
                  <small className="text-muted">Status</small>
                  <div className="fw-semibold">{selectedTournament.status || 'Active'}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Start Date</small>
                  <div className="fw-semibold">
                    {selectedTournament.startDate 
                      ? new Date(selectedTournament.startDate).toLocaleString() 
                      : 'Not set'}
                  </div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">End Date</small>
                  <div className="fw-semibold">
                    {selectedTournament.endDate 
                      ? new Date(selectedTournament.endDate).toLocaleString() 
                      : 'Not set'}
                  </div>
                </div>
                <div>
                  <small className="text-muted">Initial Cash</small>
                  <div className="fw-semibold">${selectedTournament.initialCash || 10000}</div>
                </div>
              </div>
            </div>

            {/* Enter Tournament Button */}
            {auth && !isUserInTournament(selectedTournament.id) && (
              <button 
                className="btn btn-success w-100 mb-3"
                onClick={() => handleEnterTournament(selectedTournament.id)}
              >
                Enter Tournament
              </button>
            )}
            {auth && isUserInTournament(selectedTournament.id) && (
              <div className="alert alert-success" role="alert">
                ✓ You are participating in this tournament
              </div>
            )}
            {!auth && (
              <div className="alert alert-info" role="alert">
                Please log in to enter this tournament
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tournament
