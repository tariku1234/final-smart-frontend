"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { API_URL } from "../config"
import "./AdminRegister.css"

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idNumber: "",
    address: "",
    role: "wereda_anti_corruption", // Default role
    adminCode: "", // Special code for admin registration
    kifleketema: "",
    wereda: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    idNumber,
    address,
    role,
    adminCode,
    kifleketema,
    wereda,
  } = formData

  // Kifleketema options
  const kifleketemaOptions = [
    "Lemi Kura",
    "Arada",
    "Addis Ketema",
    "Lideta",
    "Kirkos",
    "Yeka",
    "Bole",
    "Akaky Kaliti",
    "Nifas Silk-Lafto",
    "Kolfe Keranio",
    "Gulele",
  ]

  // Wereda options based on selected Kifleketema
  const getWeredaOptions = (selectedKifleketema) => {
    const weredaMap = {
      "Lemi Kura": Array.from({ length: 10 }, (_, i) => `Wereda ${i + 1}`),
      Arada: Array.from({ length: 8 }, (_, i) => `Wereda ${i + 1}`),
      "Addis Ketema": Array.from({ length: 12 }, (_, i) => `Wereda ${i + 1}`),
      Lideta: Array.from({ length: 10 }, (_, i) => `Wereda ${i + 1}`),
      Kirkos: Array.from({ length: 10 }, (_, i) => `Wereda ${i + 1}`),
      Yeka: Array.from({ length: 12 }, (_, i) => `Wereda ${i + 1}`),
      Bole: Array.from({ length: 11 }, (_, i) => `Wereda ${i + 1}`),
      "Akaky Kaliti": Array.from({ length: 13 }, (_, i) => `Wereda ${i + 1}`),
      "Nifas Silk-Lafto": Array.from({ length: 13 }, (_, i) => `Wereda ${i + 1}`),
      "Kolfe Keranio": Array.from({ length: 11 }, (_, i) => `Wereda ${i + 1}`),
      Gulele: Array.from({ length: 10 }, (_, i) => `Wereda ${i + 1}`),
    }

    return selectedKifleketema ? weredaMap[selectedKifleketema] || [] : []
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // If kifleketema changes, reset wereda
    if (name === "kifleketema") {
      setFormData((prev) => ({ ...prev, [name]: value, wereda: "" }))
    } else if (name === "role") {
      // If role changes to kifleketema_anti_corruption, reset wereda
      // If role changes to kentiba_biro, reset both kifleketema and wereda
      if (value === "kifleketema_anti_corruption") {
        setFormData((prev) => ({ ...prev, [name]: value, wereda: "" }))
      } else if (value === "kentiba_biro") {
        setFormData((prev) => ({ ...prev, [name]: value, kifleketema: "", wereda: "" }))
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!adminCode) {
      setError("Admin registration code is required")
      return
    }

    // Validate Kifleketema and Wereda based on role
    if (role === "wereda_anti_corruption") {
      if (!kifleketema) {
        setError("Please select a Kifleketema")
        return
      }
      if (!wereda) {
        setError("Please select a Wereda")
        return
      }
    } else if (role === "kifleketema_anti_corruption") {
      if (!kifleketema) {
        setError("Please select a Kifleketema")
        return
      }
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/register-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          idNumber,
          address,
          role,
          adminCode,
          kifleketema,
          wereda,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Set success message
        setSuccess(data.message || "Registration successful!")

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          idNumber: "",
          address: "",
          role: "wereda_anti_corruption",
          adminCode: "",
          kifleketema: "",
          wereda: "",
        })

        // Navigate to login after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-register-container">
      <div className="form-container admin-register-form">
        <h2 className="form-title">Register as Administrator</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your first name"
                required
                disabled={loading || success}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your last name"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
                disabled={loading || success}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your phone number"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="idNumber" className="form-label">
              ID Number
            </label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={idNumber}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your ID number"
              required
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your address"
              required
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Administrator Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={handleChange}
              className="form-select"
              required
              disabled={loading || success}
            >
              <option value="wereda_anti_corruption">Wereda Anti-Corruption Officer</option>
              <option value="kifleketema_anti_corruption">Kifleketema Anti-Corruption Officer</option>
              <option value="kentiba_biro">Kentiba Biro</option>
            </select>
          </div>

          {/* Kifleketema selection - show for Wereda and Kifleketema roles */}
          {(role === "wereda_anti_corruption" || role === "kifleketema_anti_corruption") && (
            <div className="form-group">
              <label htmlFor="kifleketema" className="form-label">
                Kifleketema (Sub-City)
              </label>
              <select
                id="kifleketema"
                name="kifleketema"
                value={kifleketema}
                onChange={handleChange}
                className="form-select"
                required
                disabled={loading || success}
              >
                <option value="">Select Kifleketema</option>
                {kifleketemaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Wereda selection - only show for Wereda role */}
          {role === "wereda_anti_corruption" && kifleketema && (
            <div className="form-group">
              <label htmlFor="wereda" className="form-label">
                Wereda
              </label>
              <select
                id="wereda"
                name="wereda"
                value={wereda}
                onChange={handleChange}
                className="form-select"
                required
                disabled={loading || success}
              >
                <option value="">Select Wereda</option>
                {getWeredaOptions(kifleketema).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={loading || success}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adminCode" className="form-label">
              Administrator Registration Code
            </label>
            <input
              type="password"
              id="adminCode"
              name="adminCode"
              value={adminCode}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter the administrator registration code"
              required
              disabled={loading || success}
            />
            <small className="form-text">
              This code is provided by the system administrator to authorize admin registrations.
            </small>
          </div>

          <button type="submit" className="form-button" disabled={loading || success}>
            {loading ? "Registering..." : "Register as Administrator"}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="form-link">
              Login
            </Link>
          </p>
          <p>
            Register as a citizen?{" "}
            <Link to="/register" className="form-link">
              Citizen Registration
            </Link>
          </p>
          <p>
            Register as a stakeholder office?{" "}
            <Link to="/stakeholder-register" className="form-link">
              Stakeholder Registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminRegister

