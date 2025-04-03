"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import ComplaintCard from "../components/ComplaintCard"
import { API_URL, USER_ROLES, COMPLAINT_STAGES } from "../config"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    escalated: 0,
  })

  // Performance stats for Kentiba Biro
  const [performanceStats, setPerformanceStats] = useState({
    stakeholderOffices: [],
    weredaAdmins: [],
    kifleketemaAdmins: [],
  })
  const [loadingPerformance, setLoadingPerformance] = useState(false)

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.role === USER_ROLES.CITIZEN) {
      navigate("/")
      return
    }
  }, [user, navigate])

  // Fetch complaints based on admin role
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user) return

      try {
        const token = localStorage.getItem("token")
        let url = `${API_URL}/api/complaints`

        // For Kentiba Biro, only show complaints escalated to Kentiba level
        if (user.role === USER_ROLES.KENTIBA_BIRO) {
          url += `?stage=${COMPLAINT_STAGES.KENTIBA}`
        }

        // Add query parameters based on filter
        if (filter !== "all") {
          url += user.role === USER_ROLES.KENTIBA_BIRO ? `&status=${filter}` : `?status=${filter}`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()
        setComplaints(data.complaints || [])

        // Calculate stats from the complaints
        const complaintStats = {
          total: data.complaints ? data.complaints.length : 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          escalated: 0,
        }

        if (data.complaints && data.complaints.length > 0) {
          data.complaints.forEach((complaint) => {
            switch (complaint.status) {
              case "pending":
                complaintStats.pending++
                break
              case "in_progress":
                complaintStats.inProgress++
                break
              case "resolved":
                complaintStats.resolved++
                break
              case "escalated":
                complaintStats.escalated++
                break
              default:
                break
            }
          })
        }

        setStats(complaintStats)
      } catch (err) {
        console.error("Error fetching complaints:", err)
        setError(`Failed to load data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role !== USER_ROLES.CITIZEN) {
      fetchComplaints()
    }
  }, [user, filter])

  // Fetch performance statistics for Kentiba Biro
  useEffect(() => {
    const fetchPerformanceStats = async () => {
      if (!user || user.role !== USER_ROLES.KENTIBA_BIRO) return

      setLoadingPerformance(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/api/admin/performance-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()
        setPerformanceStats(data.stats)
      } catch (err) {
        console.error("Error fetching performance stats:", err)
        // Don't set main error to avoid disrupting the UI
      } finally {
        setLoadingPerformance(false)
      }
    }

    if (user && user.role === USER_ROLES.KENTIBA_BIRO) {
      fetchPerformanceStats()
    }
  }, [user])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setLoading(true)
  }

  const getRoleName = (role) => {
    switch (role) {
      case USER_ROLES.STAKEHOLDER_OFFICE:
        return "Stakeholder Office"
      case USER_ROLES.WEREDA_ANTI_CORRUPTION:
        return "Wereda Anti-Corruption"
      case USER_ROLES.KIFLEKETEMA_ANTI_CORRUPTION:
        return "Kifleketema Anti-Corruption"
      case USER_ROLES.KENTIBA_BIRO:
        return "Kentiba Biro"
      default:
        return "Administrator"
    }
  }

  if (!user || user.role === USER_ROLES.CITIZEN) {
    return null
  }

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">{getRoleName(user.role)} Dashboard</h2>

      <div className="stats-container">
        <div className="stat-card">
          <h3 className="stat-title">Total</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Pending</h3>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">In Progress</h3>
          <p className="stat-value">{stats.inProgress}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Resolved</h3>
          <p className="stat-value">{stats.resolved}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Escalated</h3>
          <p className="stat-value">{stats.escalated}</p>
        </div>
      </div>

      {user.role === USER_ROLES.KENTIBA_BIRO && (
        <div className="performance-dashboard">
          <h3 className="section-title">Office Performance Statistics</h3>

          {loadingPerformance ? (
            <p className="loading-text">Loading performance statistics...</p>
          ) : (
            <>
              {/* Stakeholder Offices Performance */}
              <div className="performance-section">
                <h4 className="subsection-title">Stakeholder Offices Performance</h4>
                {performanceStats.stakeholderOffices.length === 0 ? (
                  <p className="no-data">No stakeholder office data available.</p>
                ) : (
                  <div className="performance-table-container">
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>Office Name</th>
                          <th>Office Type</th>
                          <th>Total Complaints</th>
                          <th>Resolved</th>
                          <th>Escalated</th>
                          <th>Resolution Rate</th>
                          <th>Avg. Resolution Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceStats.stakeholderOffices.map((office) => (
                          <tr key={office._id}>
                            <td>{office.officeName}</td>
                            <td>{office.officeType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</td>
                            <td>{office.totalComplaints}</td>
                            <td>{office.resolvedComplaints}</td>
                            <td>{office.escalatedComplaints}</td>
                            <td>
                              {office.totalComplaints > 0
                                ? `${Math.round((office.resolvedComplaints / office.totalComplaints) * 100)}%`
                                : "N/A"}
                            </td>
                            <td>
                              {office.averageResolutionTime > 0
                                ? `${office.averageResolutionTime.toFixed(1)} days`
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Wereda Admins Performance */}
              <div className="performance-section">
                <h4 className="subsection-title">Wereda Anti-Corruption Performance</h4>
                {performanceStats.weredaAdmins.length === 0 ? (
                  <p className="no-data">No Wereda admin data available.</p>
                ) : (
                  <div className="performance-table-container">
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>Admin Name</th>
                          <th>Total Complaints</th>
                          <th>Resolved</th>
                          <th>Escalated</th>
                          <th>Resolution Rate</th>
                          <th>Avg. Resolution Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceStats.weredaAdmins.map((admin) => (
                          <tr key={admin._id}>
                            <td>{`${admin.firstName} ${admin.lastName}`}</td>
                            <td>{admin.totalComplaints}</td>
                            <td>{admin.resolvedComplaints}</td>
                            <td>{admin.escalatedComplaints}</td>
                            <td>
                              {admin.totalComplaints > 0
                                ? `${Math.round((admin.resolvedComplaints / admin.totalComplaints) * 100)}%`
                                : "N/A"}
                            </td>
                            <td>
                              {admin.averageResolutionTime > 0
                                ? `${admin.averageResolutionTime.toFixed(1)} days`
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Kifleketema Admins Performance */}
              <div className="performance-section">
                <h4 className="subsection-title">Kifleketema Anti-Corruption Performance</h4>
                {performanceStats.kifleketemaAdmins.length === 0 ? (
                  <p className="no-data">No Kifleketema admin data available.</p>
                ) : (
                  <div className="performance-table-container">
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>Admin Name</th>
                          <th>Total Complaints</th>
                          <th>Resolved</th>
                          <th>Escalated</th>
                          <th>Resolution Rate</th>
                          <th>Avg. Resolution Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceStats.kifleketemaAdmins.map((admin) => (
                          <tr key={admin._id}>
                            <td>{`${admin.firstName} ${admin.lastName}`}</td>
                            <td>{admin.totalComplaints}</td>
                            <td>{admin.resolvedComplaints}</td>
                            <td>{admin.escalatedComplaints}</td>
                            <td>
                              {admin.totalComplaints > 0
                                ? `${Math.round((admin.resolvedComplaints / admin.totalComplaints) * 100)}%`
                                : "N/A"}
                            </td>
                            <td>
                              {admin.averageResolutionTime > 0
                                ? `${admin.averageResolutionTime.toFixed(1)} days`
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="filter-container">
        <label htmlFor="filter" className="filter-label">
          Filter by Status:
        </label>
        <select id="filter" value={filter} onChange={handleFilterChange} className="filter-select">
          <option value="all">All Complaints</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p className="no-complaints">No complaints found.</p>
      ) : (
        <div className="complaints-container">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

