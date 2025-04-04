"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { API_URL } from "../config"
import "./ComplaintForm.css"

const ComplaintForm = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const locationHook = useLocation()

  // Check if we're in second stage mode
  const isSecondStage = locationHook.search.includes("stage=second")
  const complaintId = new URLSearchParams(locationHook.search).get("complaintId")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    officeType: "",
    location: "",
    attachments: [],
    kifleketema: "",
    wereda: "",
  })

  const [secondStageData, setSecondStageData] = useState({
    additionalDetails: "",
    attachments: [],
  })

  const [originalComplaint, setOriginalComplaint] = useState(null)
  const [stakeholderOffices, setStakeholderOffices] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingOffices, setFetchingOffices] = useState(true)
  const [fetchingOriginalComplaint, setFetchingOriginalComplaint] = useState(isSecondStage)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [availableOfficeTypes, setAvailableOfficeTypes] = useState([])
  const [availableLocations, setAvailableLocations] = useState({})

  const { title, description, officeType, location, kifleketema, wereda } = formData
  const { additionalDetails } = secondStageData

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

  // Fetch approved stakeholder offices
  useEffect(() => {
    const fetchStakeholderOffices = async () => {
      try {
        const response = await fetch(`${API_URL}/api/stakeholders/approved`)
        const data = await response.json()

        if (response.ok) {
          console.log("Fetched stakeholder offices:", data.stakeholders)
          setStakeholderOffices(data.stakeholders)

          // Process available office types and locations
          const officeTypes = [...new Set(data.stakeholders.map((office) => office.officeType))]
          setAvailableOfficeTypes(officeTypes)

          // Create a map of available locations for each office type
          const locationMap = {}
          officeTypes.forEach((type) => {
            locationMap[type] = {}

            // Get all offices of this type
            const officesOfType = data.stakeholders.filter((office) => office.officeType === type)

            // Group by kifleketema and wereda
            officesOfType.forEach((office) => {
              if (office.kifleketema && office.wereda) {
                if (!locationMap[type][office.kifleketema]) {
                  locationMap[type][office.kifleketema] = []
                }
                if (!locationMap[type][office.kifleketema].includes(office.wereda)) {
                  locationMap[type][office.kifleketema].push(office.wereda)
                }
              }
            })
          })

          setAvailableLocations(locationMap)
        } else {
          setError("Failed to fetch stakeholder offices")
        }
      } catch (err) {
        console.error("Error fetching stakeholder offices:", err)
        setError("Failed to connect to the server")
      } finally {
        setFetchingOffices(false)
      }
    }

    fetchStakeholderOffices()
  }, [])

  // Fetch original complaint if in second stage mode
  useEffect(() => {
    const fetchOriginalComplaint = async () => {
      if (!isSecondStage || !complaintId) return

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/api/complaints/${complaintId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (response.ok) {
          // Check if the complaint has a response and is in the correct stage
          if (
            (data.complaint.currentStage === "stakeholder_first" || data.complaint.currentStage === "wereda_first") &&
            data.complaint.responses &&
            data.complaint.responses.length > 0 &&
            data.complaint.status === "in_progress"
          ) {
            setOriginalComplaint(data.complaint)
            // Pre-fill some data from the original complaint
            setFormData((prevData) => ({
              ...prevData,
              title: `Follow-up: ${data.complaint.title}`,
              description: "", // Ensure description is empty to be filled by user
              officeType: data.complaint.stakeholderOffice.officeType,
              location: data.complaint.location,
              kifleketema: data.complaint.kifleketema,
              wereda: data.complaint.wereda,
            }))
          } else {
            setError(
              "This complaint is not eligible for a second stage submission. It must have a response from the current handler.",
            )
            setTimeout(() => {
              navigate("/citizen-complaints")
            }, 3000)
          }
        } else {
          setError("Failed to fetch original complaint details")
        }
      } catch (err) {
        console.error("Error fetching original complaint:", err)
        setError("Failed to connect to the server")
      } finally {
        setFetchingOriginalComplaint(false)
      }
    }

    fetchOriginalComplaint()
  }, [isSecondStage, complaintId, navigate])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target

    // If office type changes, reset kifleketema and wereda
    if (name === "officeType") {
      setFormData((prev) => ({ ...prev, [name]: value, kifleketema: "", wereda: "" }))
    }
    // If kifleketema changes, reset wereda
    else if (name === "kifleketema") {
      setFormData((prev) => ({ ...prev, [name]: value, wereda: "" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSecondStageChange = (e) => {
    setSecondStageData({ ...secondStageData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachments: e.target.files })
  }

  const handleSecondStageFileChange = (e) => {
    setSecondStageData({ ...secondStageData, attachments: e.target.files })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form fields
    if (isSecondStage) {
      // For second stage, validate title, description, and additionalDetails
      if (!title || !description || !additionalDetails) {
        console.log("Second stage validation failed:", { title, description, additionalDetails })
        setError("Please fill in all required fields")
        return
      }
    } else {
      // For first stage, validate all fields
      if (!title || !description || !officeType || !location || !kifleketema || !wereda) {
        console.log("First stage validation failed:", { title, description, officeType, location, kifleketema, wereda })
        setError("Please fill in all required fields")
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")

      // Debug: Log all stakeholder offices to see what's available
      console.log("All stakeholder offices:", stakeholderOffices)
      console.log("Looking for office with type:", officeType, "in", kifleketema, wereda)

      // Find the appropriate stakeholder office based on officeType, kifleketema, and wereda
      let stakeholderOfficeId

      if (isSecondStage) {
        // For second stage, use the original complaint's stakeholder office
        stakeholderOfficeId = originalComplaint.stakeholderOffice._id
        console.log("Using original complaint's stakeholder office:", stakeholderOfficeId)
      } else {
        // For first stage, find the matching office
        const matchingOffice = stakeholderOffices.find((office) => {
          // Debug: Log each office being checked
          console.log(
            "Checking office:",
            office.officeName,
            "Type:",
            office.officeType,
            "Kifleketema:",
            office.kifleketema,
            "Wereda:",
            office.wereda,
          )

          // More flexible matching (case-insensitive)
          return (
            office.officeType.toLowerCase() === officeType.toLowerCase() &&
            office.kifleketema?.toLowerCase() === kifleketema.toLowerCase() &&
            office.wereda?.toLowerCase() === wereda.toLowerCase()
          )
        })

        // Debug: Log the result of the matching
        console.log("Matching office found:", matchingOffice)

        // If no matching office is found, show error
        if (!matchingOffice) {
          // First, check if any office of this type exists at all
          const anyOfficeOfType = stakeholderOffices.find(
            (office) => office.officeType.toLowerCase() === officeType.toLowerCase(),
          )

          if (anyOfficeOfType) {
            setError(
              `No ${officeType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} found in ${kifleketema}, ${wereda}. Please select a different location.`,
            )
          } else {
            setError(
              `No ${officeType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} offices are currently registered in the system.`,
            )
          }

          setLoading(false)
          return
        }

        stakeholderOfficeId = matchingOffice._id
      }

      // Create form data for file uploads
      const formDataObj = new FormData()
      formDataObj.append("title", title)
      formDataObj.append("description", description)
      formDataObj.append("stakeholderOfficeId", stakeholderOfficeId)
      formDataObj.append("location", location || (originalComplaint ? originalComplaint.location : ""))
      formDataObj.append("kifleketema", kifleketema || (originalComplaint ? originalComplaint.kifleketema : ""))
      formDataObj.append("wereda", wereda || (originalComplaint ? originalComplaint.wereda : ""))

      // If this is a second stage submission, add the original complaint ID
      if (isSecondStage && complaintId) {
        formDataObj.append("originalComplaintId", complaintId)
        formDataObj.append("isSecondStage", "true")
        formDataObj.append("additionalDetails", additionalDetails)
      }

      // Append files if any
      if (formData.attachments && formData.attachments.length > 0) {
        for (let i = 0; i < formData.attachments.length; i++) {
          formDataObj.append("attachments", formData.attachments[i])
        }
      }

      // Append second stage files if any
      if (isSecondStage && secondStageData.attachments && secondStageData.attachments.length > 0) {
        for (let i = 0; i < secondStageData.attachments.length; i++) {
          formDataObj.append("attachments", secondStageData.attachments[i])
        }
      }

      console.log("Submitting complaint with data:", {
        title,
        description,
        stakeholderOfficeId,
        location: location || (originalComplaint ? originalComplaint.location : ""),
        kifleketema: kifleketema || (originalComplaint ? originalComplaint.kifleketema : ""),
        wereda: wereda || (originalComplaint ? originalComplaint.wereda : ""),
        isSecondStage: isSecondStage ? "true" : "false",
        originalComplaintId: complaintId || "",
        additionalDetails: additionalDetails || "",
      })

      const response = await fetch(`${API_URL}/api/complaints`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      setSuccess(true)
      // Reset form
      setFormData({
        title: "",
        description: "",
        officeType: "",
        location: "",
        attachments: [],
        kifleketema: "",
        wereda: "",
      })

      setSecondStageData({
        additionalDetails: "",
        attachments: [],
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/citizen-complaints")
      }, 3000)
    } catch (err) {
      console.error("Error submitting complaint:", err)
      setError(err.message || "Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }

  // Get available weredas for the selected office type and kifleketema
  const getAvailableWeredas = () => {
    if (!officeType || !kifleketema || !availableLocations[officeType]) {
      return []
    }

    return availableLocations[officeType][kifleketema] || []
  }

  // Get available kifleketemas for the selected office type
  const getAvailableKifleketemas = () => {
    if (!officeType || !availableLocations[officeType]) {
      return []
    }

    return Object.keys(availableLocations[officeType])
  }

  if (!user) {
    return null
  }

  const isLoading = fetchingOffices || (isSecondStage && fetchingOriginalComplaint)

  return (
    <div className="complaint-form-container">
      <div className="form-container complaint-form">
        <h2 className="form-title">
          {isSecondStage
            ? `Submit Second Stage Complaint (${
                originalComplaint?.currentStage === "stakeholder_first"
                  ? "Stakeholder"
                  : originalComplaint?.currentStage === "wereda_first"
                    ? "Wereda"
                    : "Kifleketema"
              })`
            : "Report a Complaint"}
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Your complaint has been submitted successfully! You will be redirected shortly.
          </div>
        )}

        {isLoading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {isSecondStage && originalComplaint && (
              <div className="original-complaint-summary">
                <h3>Original Complaint Reference</h3>
                <div className="summary-item">
                  <span className="summary-label">Original Complaint:</span>
                  <span className="summary-value">{originalComplaint.title}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Status:</span>
                  <span className="summary-value">{originalComplaint.status.replace("_", " ")}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Submitted:</span>
                  <span className="summary-value">{new Date(originalComplaint.submittedAt).toLocaleDateString()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Office:</span>
                  <span className="summary-value">{originalComplaint.stakeholderOffice.officeName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Kifleketema:</span>
                  <span className="summary-value">{originalComplaint.kifleketema}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Wereda:</span>
                  <span className="summary-value">{originalComplaint.wereda}</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Complaint Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter a brief title for your complaint"
                required
                disabled={loading || success}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Complaint Description
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Provide detailed information about your complaint"
                required
                disabled={loading || success}
              ></textarea>
            </div>

            {!isSecondStage && (
              <>
                <div className="form-group">
                  <label htmlFor="officeType" className="form-label">
                    Office Type
                  </label>
                  <select
                    id="officeType"
                    name="officeType"
                    value={officeType}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={loading || success}
                  >
                    <option value="">Select Office Type</option>
                    {/* Get unique office types from available stakeholder offices */}
                    {availableOfficeTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  {stakeholderOffices.length === 0 && (
                    <small className="form-text text-warning">
                      No approved stakeholder offices found. Please try again later.
                    </small>
                  )}
                </div>

                <div className="form-row">
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
                      disabled={loading || success || !officeType}
                    >
                      <option value="">Select Kifleketema</option>
                      {getAvailableKifleketemas().map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {officeType && getAvailableKifleketemas().length === 0 && (
                      <small className="form-text text-warning">No locations available for this office type.</small>
                    )}
                  </div>

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
                      disabled={loading || success || !kifleketema}
                    >
                      <option value="">Select Wereda</option>
                      {getAvailableWeredas().map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {kifleketema && getAvailableWeredas().length === 0 && (
                      <small className="form-text text-warning">No Weredas available for this Kifleketema.</small>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={location}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter the location related to the complaint"
                    required
                    disabled={loading || success}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="attachments" className="form-label">
                Attachments (Optional)
              </label>
              <input
                type="file"
                id="attachments"
                name="attachments"
                onChange={handleFileChange}
                className="form-input"
                multiple
                disabled={loading || success}
              />
              <small className="form-text">
                You can upload images, documents, or other evidence related to your complaint.
              </small>
            </div>

            {isSecondStage && (
              <div className="second-stage-section">
                <h3>Second Stage Information</h3>
                <div className="form-group">
                  <label htmlFor="additionalDetails" className="form-label">
                    Additional Details for Second Stage
                  </label>
                  <textarea
                    id="additionalDetails"
                    name="additionalDetails"
                    value={additionalDetails}
                    onChange={handleSecondStageChange}
                    className="form-textarea"
                    placeholder="Provide additional information for the second stage of your complaint"
                    required
                    disabled={loading || success}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="secondStageAttachments" className="form-label">
                    Additional Attachments (Optional)
                  </label>
                  <input
                    type="file"
                    id="secondStageAttachments"
                    name="secondStageAttachments"
                    onChange={handleSecondStageFileChange}
                    className="form-input"
                    multiple
                    disabled={loading || success}
                  />
                  <small className="form-text">
                    You can upload additional evidence for the second stage of your complaint.
                  </small>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="form-button"
              disabled={loading || success || (!isSecondStage && stakeholderOffices.length === 0)}
            >
              {loading ? "Submitting..." : isSecondStage ? "Submit Second Stage Complaint" : "Submit Complaint"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ComplaintForm

