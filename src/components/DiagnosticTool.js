"use client"

import { useState } from "react"
import { API_URL } from "../config"
import "./DiagnosticTool.css"

const DiagnosticTool = () => {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runDiagnostic = async (endpoint) => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      const data = await response.json()

      setResults({
        endpoint,
        status: response.status,
        data,
      })
    } catch (err) {
      console.error(`Error running diagnostic on ${endpoint}:`, err)
      setError(`Failed to run diagnostic: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="diagnostic-tool">
      <h2>Diagnostic Tool</h2>

      <div className="diagnostic-buttons">
        <button
          onClick={() => runDiagnostic("/api/diagnostic/db-status")}
          disabled={loading}
          className="btn btn-primary"
        >
          Check Database Status
        </button>

        <button
          onClick={() => runDiagnostic("/api/diagnostic/complaints-test")}
          disabled={loading}
          className="btn btn-primary"
        >
          Test Complaints Collection
        </button>

        <button onClick={() => runDiagnostic("/api/complaints-simple")} disabled={loading} className="btn btn-primary">
          Try Simplified Complaints Route
        </button>

        <button onClick={() => runDiagnostic("/api/complaints")} disabled={loading} className="btn btn-primary">
          Try Original Complaints Route
        </button>
      </div>

      {loading && <p className="loading-text">Running diagnostic...</p>}

      {error && <div className="alert alert-danger">{error}</div>}

      {results && (
        <div className="diagnostic-results">
          <h3>Results for {results.endpoint}</h3>
          <p>
            <strong>Status:</strong> {results.status}
          </p>
          <div className="json-result">
            <pre>{JSON.stringify(results.data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiagnosticTool

