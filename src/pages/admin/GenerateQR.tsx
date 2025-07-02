"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { QrCode, Download, Search, User } from "lucide-react"
import QRCode from "qrcode"
import { googleSheetsService } from "../../services/googleSheets"
import { googleDriveService } from "../../services/googleDrive"
import type { Intern } from "../../types"

const GenerateQR: React.FC = () => {
  const [selectedIntern, setSelectedIntern] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadInterns()
  }, [])

  const loadInterns = async () => {
    try {
      setLoading(true)
      const internsData = await googleSheetsService.getInterns()

      // Convert Google Drive file IDs to viewable URLs
      const internsWithPhotos = internsData.map((intern) => ({
        ...intern,
        photo: intern.photo
          ? googleDriveService.getPhotoUrl(intern.photo)
          : "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
      }))

      setInterns(internsWithPhotos)
    } catch (error) {
      console.error("Error loading interns:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInterns = interns.filter(
    (intern) =>
      `${intern.firstName} ${intern.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.uniqueId.includes(searchTerm) ||
      intern.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const generateQRCode = async () => {
    if (!selectedIntern) return

    const intern = interns.find((i) => i.id === selectedIntern)
    if (!intern) return

    try {
      // Create the verification URL that will be embedded in the QR code
      const verificationUrl = `${window.location.origin}/verify/${intern.uniqueId}`

      // Generate QR code with higher error correction for logo overlay
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H", // High error correction for logo overlay
      })

      // Create canvas to add circular logo
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 400
      canvas.height = 400

      // Draw QR code
      const qrImage = new Image()
      qrImage.crossOrigin = "anonymous"
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 0, 0, 400, 400)

        // Add circular company logo in center
        const logo = new Image()
        logo.crossOrigin = "anonymous"
        logo.onload = () => {
          const logoSize = 60 // Smaller size for better scanning
          const logoX = (400 - logoSize) / 2
          const logoY = (400 - logoSize) / 2

          // Save context state
          ctx.save()

          // Create circular clipping path
          ctx.beginPath()
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 5, 0, 2 * Math.PI)
          ctx.fillStyle = "white"
          ctx.fill()

          // Create smaller circle for logo
          ctx.beginPath()
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, 2 * Math.PI)
          ctx.clip()

          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)

          // Restore context
          ctx.restore()

          setQrCodeUrl(canvas.toDataURL())
        }
        logo.src = "/Green_white-removebg.png"
      }
      qrImage.src = qrDataUrl
    } catch (error) {
      console.error("Error generating QR code:", error)
      alert("Error generating QR code. Please try again.")
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl || !selectedIntern) return

    const intern = interns.find((i) => i.id === selectedIntern)
    if (!intern) return

    const link = document.createElement("a")
    link.download = `qr-code-${intern.uniqueId}-${intern.firstName}-${intern.lastName}.png`
    link.href = qrCodeUrl
    link.click()
  }

  const selectedInternData = interns.find((i) => i.id === selectedIntern)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading interns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Generate QR Code</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create QR codes for intern certificate verification with company logo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Intern Selection */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Intern</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, ID, or email..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Intern</label>
                <select
                  value={selectedIntern}
                  onChange={(e) => setSelectedIntern(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose an intern...</option>
                  {filteredInterns.map((intern) => (
                    <option key={intern.id} value={intern.id}>
                      {intern.firstName} {intern.lastName} (ID: {intern.uniqueId})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInternData && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-500" />
                    Selected Intern
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>{" "}
                      {selectedInternData.firstName} {selectedInternData.lastName}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">ID:</span>{" "}
                      {selectedInternData.uniqueId}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>{" "}
                      {selectedInternData.email}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Fields:</span>{" "}
                      {selectedInternData.internshipFields.length}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Total Weeks:</span>{" "}
                      {selectedInternData.totalOnlineWeeks + selectedInternData.totalOfflineWeeks}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                      <span
                        className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          selectedInternData.certificateIssued
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {selectedInternData.certificateIssued ? "Certified" : "In Progress"}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={generateQRCode}
                disabled={!selectedIntern}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Generate QR Code with Logo
              </button>
            </div>

            {/* QR Code Display */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">QR Code Preview</h3>

                {qrCodeUrl ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg inline-block shadow-lg">
                      <img
                        src={qrCodeUrl || "/placeholder.svg"}
                        alt="QR Code with Logo"
                        className="w-80 h-80 mx-auto"
                      />
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>
                        QR Code for:{" "}
                        <span className="font-medium">
                          {selectedInternData?.firstName} {selectedInternData?.lastName}
                        </span>
                      </p>
                      <p>
                        Unique ID: <span className="font-medium">{selectedInternData?.uniqueId}</span>
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">✓ Company logo embedded</p>
                    </div>

                    <button
                      onClick={downloadQRCode}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center mx-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    <QrCode className="h-24 w-24 mx-auto mb-4 opacity-50" />
                    <p>
                      Select an intern and click "Generate QR Code" to create a verification QR code with company logo
                    </p>
                  </div>
                )}
              </div>

              {qrCodeUrl && selectedInternData && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">QR Code Features</h4>
                  <div className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                    <p>• High-resolution 400x400px image</p>
                    <p>• Company logo embedded in center</p>
                    <p>• Links to intern's verification page</p>
                    <p>• Error correction for damaged codes</p>
                    <p>• Perfect for printing on certificates</p>
                    <p>• Unique to intern ID: {selectedInternData.uniqueId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateQR
