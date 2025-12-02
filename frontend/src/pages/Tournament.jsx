import React, { useState } from 'react'
import { Trophy, TrendingUp, Users, Award, ArrowLeft, Calendar, DollarSign } from 'lucide-react'

// Placeholder tournament data
const tournaments = [
  {
    id: 1,
    name: 'Top 100 | 251112',
    status: 'Active',
    participants: '10,410 / 20,000',
    prize: '100 winners every week',
    image: 'https://t3.ftcdn.net/jpg/04/94/65/34/360_F_494653408_L5XoC3iFVyKkVz5K7e9kbmKrv0iDMaNt.jpg',
    endDate: '2025-12-31',
    description: '10 Primary + 90 Secondary Users Win!',
    prizes: [
      { place: '1st', amount: '60K High Stakes' },
      { place: '2nd', amount: '20K High Stakes' },
      { place: '3rd', amount: '10K High Stakes' },
      { place: '4th-5th', amount: '5K High Stakes' },
      { place: '6th-10th', amount: '5K High Stakes' },
      { place: '11-20th', amount: '11-20K Bootcamp Credits' },
      { place: '21-80th', amount: '$5 HUB CREDITS' },
      { place: '81-100th', amount: '$5 TTP HUB CREDITS' },
    ],
    rules: [
      'Only one position can be open at any given moment.',
      'Daily Loss: 5%'
    ],
    leaderboard: [
      { rank: 1, username: 'Nguyen H.', profit: '$11,758.25', flag: '🇻🇳' },
      { rank: 2, username: 'Miroslav N.', profit: '$11,273.82', flag: '🇷🇸' },
      { rank: 3, username: 'Brehima B.', profit: '$10,527.31', flag: '🇲🇱' },
      { rank: 4, username: 'HAIHONG L.', profit: '$9,241.91', flag: '🇨🇳' },
      { rank: 5, username: 'Trinh N.', profit: '$8,178.51', flag: '🇻🇳' },
      { rank: 6, username: 'Durga P.', profit: '$8,144.13', flag: '🇮🇳' },
      { rank: 7, username: 'Thembinkosi M.', profit: '$7,781.63', flag: '🇿🇦' },
      { rank: 8, username: 'DAN L.', profit: '$7,399.08', flag: '🇨🇳' },
      { rank: 9, username: 'Serviceindla N.', profit: '$7,326.39', flag: '🇮🇳' },
      { rank: 10, username: 'Umesh K.', profit: '$7,286.84', flag: '🇮🇳' },
    ],
    myRank: '----',
    myProfit: '----',
    myPL: '----'
  },
  {
    id: 2,
    name: 'Winter Championship 2025',
    status: 'Active',
    participants: '8,245 / 15,000',
    prize: 'Weekly prizes + Grand prize',
    image: 'https://media.istockphoto.com/id/1357434585/photo/two-esport-teams-of-pro-gamers-play-to-compete-in-video-game-on-a-championship-stylish-neon.jpg?s=612x612&w=0&k=20&c=tGBVvXpGtO2mJ3itmE_FnKiXDg65ilt51GT8xCB4vmo=',
    endDate: '2025-12-15',
    description: 'Compete for the ultimate trading title!',
    prizes: [
      { place: '1st', amount: '100K Grand Prize' },
      { place: '2nd', amount: '50K Prize' },
      { place: '3rd', amount: '25K Prize' },
      { place: '4th-10th', amount: '10K Each' },
    ],
    rules: [
      'Maximum 3 positions open simultaneously.',
      'Daily Loss: 3%',
      'Must trade at least 5 days per week'
    ],
    leaderboard: [
      { rank: 1, username: 'TradeMaster99', profit: '$24,532.10', flag: '🇺🇸' },
      { rank: 2, username: 'BullRun2025', profit: '$22,187.45', flag: '🇬🇧' },
      { rank: 3, username: 'WolfOfWallSt', profit: '$20,945.88', flag: '🇨🇦' },
      { rank: 4, username: 'DiamondHands', profit: '$19,234.22', flag: '🇦🇺' },
      { rank: 5, username: 'MarketWizard', profit: '$18,901.55', flag: '🇩🇪' },
    ],
    myRank: '----',
    myProfit: '----',
    myPL: '----'
  },
  {
    id: 3,
    name: 'Tech Stock Rally',
    status: 'Upcoming',
    participants: '2,134 / 10,000',
    prize: 'Tech-focused prizes',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSChvu-kYyR4X1pLne6Y8dvmvzMGuA3bNhQRw&s',
    endDate: '2026-01-15',
    description: 'Focus on technology sector stocks',
    prizes: [
      { place: '1st', amount: '50K Tech Package' },
      { place: '2nd', amount: '30K Prize' },
      { place: '3rd', amount: '20K Prize' },
    ],
    rules: [
      'Only tech sector stocks allowed.',
      'Daily Loss: 4%'
    ],
    leaderboard: [],
    myRank: '----',
    myProfit: '----',
    myPL: '----'
  },
  {
    id: 4,
    name: 'Beginner\'s Challenge',
    status: 'Inactive',
    participants: '15,890 / 20,000',
    prize: 'Learning resources + cash prizes',
    image: 'https://people.com/thmb/7Ilgu4KlGRFVuG2xkw7W6bm241w=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(665x0:667x2)/NBAs-Larry-OBrien-Championship-Trophy2-2000-307802d941484b30888bc4ee93faf023.jpg',
    endDate: '2025-11-10',
    description: 'Perfect for new traders',
    prizes: [
      { place: '1st', amount: '10K + Course Bundle' },
      { place: '2nd', amount: '5K + Course Bundle' },
      { place: '3rd', amount: '3K + Course Bundle' },
    ],
    rules: [
      'Account age must be less than 6 months.',
      'Daily Loss: 2%'
    ],
    leaderboard: [
      { rank: 1, username: 'NewbiePro', profit: '$5,432.10', flag: '🇺🇸' },
      { rank: 2, username: 'FirstTimer', profit: '$4,987.45', flag: '🇬🇧' },
      { rank: 3, username: 'LearningFast', profit: '$4,654.32', flag: '🇨🇦' },
    ],
    myRank: '----',
    myProfit: '----',
    myPL: '----'
  }
]

const Tournament = () => {
  const [selectedTournament, setSelectedTournament] = useState(null)

  // Tournament List View
  if (!selectedTournament) {
    return (
      <div className="container-fluid py-4">
        <div className="container">
          <div className="mb-4">
            <h2 className="h3 fw-bold mb-2">
              <Trophy className="me-2 text-warning" size={24} />
              Tournaments
            </h2>
            <p className="mb-0" style={{ color: '#aeb8de' }}>Compete with traders worldwide and win amazing prizes</p>
          </div>

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
                        {tournament.status}
                      </span>
                    </div>
                    <p className="card-text text-muted small mb-3">{tournament.description}</p>
                    
                    <div className="d-flex flex-column gap-2 small">
                      <div className="d-flex align-items-center text-muted">
                        <Users size={16} className="me-2" />
                        <span>{tournament.participants}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted">
                        <Award size={16} className="me-2" />
                        <span>{tournament.prize}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted">
                        <Calendar size={16} className="me-2" />
                        <span>Ends: {tournament.endDate}</span>
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
                    {selectedTournament.status}
                  </span>
                </div>
                <p className="text-muted mb-3">{selectedTournament.description}</p>
                <div className="d-flex gap-4 flex-wrap">
                  <div className="d-flex align-items-center text-muted">
                    <Users size={18} className="me-2" />
                    <span><strong>Participants:</strong> {selectedTournament.participants}</span>
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    <Calendar size={18} className="me-2" />
                    <span><strong>Ends:</strong> {selectedTournament.endDate}</span>
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

        {/* My Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <Trophy className="text-primary me-2" size={20} />
                  <h6 className="mb-0 text-muted">My Rank</h6>
                </div>
                <h3 className="mb-0 fw-bold">{selectedTournament.myRank}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <TrendingUp className="text-success me-2" size={20} />
                  <h6 className="mb-0 text-muted">My Profit</h6>
                </div>
                <h3 className="mb-0 fw-bold">{selectedTournament.myProfit}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <DollarSign className="text-warning me-2" size={20} />
                  <h6 className="mb-0 text-muted">P/L</h6>
                </div>
                <h3 className="mb-0 fw-bold">{selectedTournament.myPL}</h3>
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
                {selectedTournament.leaderboard.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>User</th>
                          <th className="text-end">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTournament.leaderboard.map((entry) => (
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
                    <p>Leaderboard will be available when tournament starts</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prizes & Rules */}
          <div className="col-lg-4">
            {/* Prizes */}
            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">
                  <Award className="me-2 text-warning" size={20} />
                  Prizes
                </h5>
                <div className="list-group list-group-flush">
                  {selectedTournament.prizes.map((prize, index) => (
                    <div key={index} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">{prize.place} Place:</span>
                      <span className="text-muted small">{prize.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Rules</h5>
                <ul className="list-unstyled mb-0">
                  {selectedTournament.rules.map((rule, index) => (
                    <li key={index} className="mb-2 text-muted small">
                      <span className="text-primary me-2">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tournament
