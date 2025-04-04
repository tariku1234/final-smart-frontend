"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./AdminStatistics.css"

const AdminStatistics = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    stakeholders: {
      total: 0,
      approved: 0,
      pending: 0,
      byLocation: {},
    },
    weredaAdmins: {
      total: 0,
      approved: 0,
      pending: 0,
      byLocation: {},
    },
    kifleketemaAdmins: {
      total: 0,
      approved: 0,
      pending: 0,
      byLocation: {},
    },
    kentibaAdmins: {
      total: 0,
    },
    citizens: {
      total: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Redirect if not logged in or not Kentiba Biro
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role !== "kentiba_biro") {
      navigate("/")
      return
    }
  }, [user, navigate])

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/api/admin/user-statistics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          setStats(data.stats)
        } else {
          setError(data.message || "Failed to fetch user statistics")
        }
      } catch (err) {
        console.error("Error fetching user statistics:", err)
        setError("Failed to connect to the server")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "kentiba_biro") {
      fetchUserStats()
    }
  }, [user])

  if (!user || user.role !== "kentiba_biro") {
    return null
  }

  return (
    <div className="admin-statistics-container">
      <h2 className="page-title">System User Statistics</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading statistics...</p>
      ) : (
        <>
          <div className="statistics-grid">
            <div className="stat-card">
              <h3 className="stat-title">Citizens</h3>
              <div className="stat-content">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{stats.citizens.total}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <h3 className="stat-title">Stakeholder Offices</h3>
              <div className="stat-content">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{stats.stakeholders.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Approved:</span>
                  <span className="stat-value">{stats.stakeholders.approved}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pending Approval:</span>
                  <span className="stat-value">{stats.stakeholders.pending}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <h3 className="stat-title">Wereda Administrators</h3>
              <div className="stat-content">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{stats.weredaAdmins.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Approved:</span>
                  <span className="stat-value">{stats.weredaAdmins.approved}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pending Approval:</span>
                  <span className="stat-value">{stats.weredaAdmins.pending}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <h3 className="stat-title">Kifleketema Administrators</h3>
              <div className="stat-content">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{stats.kifleketemaAdmins.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Approved:</span>
                  <span className="stat-value">{stats.kifleketemaAdmins.approved}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pending Approval:</span>
                  <span className="stat-value">{stats.kifleketemaAdmins.pending}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <h3 className="stat-title">Kentiba Biro Administrators</h3>
              <div className="stat-content">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{stats.kentibaAdmins.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stakeholder Offices by Location */}
          {stats.stakeholders.byLocation && Object.keys(stats.stakeholders.byLocation).length > 0 && (
            <div className="location-statistics">
              <h3 className="section-title">Stakeholder Offices by Location</h3>
              <div className="location-table-container">
                <table className="location-table">
                  <thead>
                    <tr>
                      <th>Kifleketema</th>
                      <th>Wereda</th>
                      <th>Total Offices</th>
                      <th>Approved</th>
                      <th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.stakeholders.byLocation).map(([kifleketema, weredas]) => (
                      <>
                        {Object.entries(weredas).map(([wereda, counts], index) => (
                          <tr key={`${kifleketema}-${wereda}`}>
                            {index === 0 ? <td rowSpan={Object.keys(weredas).length}>{kifleketema}</td> : null}
                            <td>{wereda}</td>
                            <td>{counts.total}</td>
                            <td>{counts.approved}</td>
                            <td>{counts.pending}</td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Wereda Administrators by Location */}
          {stats.weredaAdmins.byLocation && Object.keys(stats.weredaAdmins.byLocation).length > 0 && (
            <div className="location-statistics">
              <h3 className="section-title">Wereda Administrators by Location</h3>
              <div className="location-table-container">
                <table className="location-table">
                  <thead>
                    <tr>
                      <th>Kifleketema</th>
                      <th>Wereda</th>
                      <th>Total Admins</th>
                      <th>Approved</th>
                      <th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.weredaAdmins.byLocation).map(([kifleketema, weredas]) => (
                      <>
                        {Object.entries(weredas).map(([wereda, counts], index) => (
                          <tr key={`${kifleketema}-${wereda}`}>
                            {index === 0 ? <td rowSpan={Object.keys(weredas).length}>{kifleketema}</td> : null}
                            <td>{wereda}</td>
                            <td>{counts.total}</td>
                            <td>{counts.approved}</td>
                            <td>{counts.pending}</td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Kifleketema Administrators by Location */}
          {stats.kifleketemaAdmins.byLocation && Object.keys(stats.kifleketemaAdmins.byLocation).length > 0 && (
            <div className="location-statistics">
              <h3 className="section-title">Kifleketema Administrators by Location</h3>
              <div className="location-table-container">
                <table className="location-table">
                  <thead>
                    <tr>
                      <th>Kifleketema</th>
                      <th>Total Admins</th>
                      <th>Approved</th>
                      <th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.kifleketemaAdmins.byLocation).map(([kifleketema, counts]) => (
                      <tr key={kifleketema}>
                        <td>{kifleketema}</td>
                        <td>{counts.total}</td>
                        <td>{counts.approved}</td>
                        <td>{counts.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminStatistics

