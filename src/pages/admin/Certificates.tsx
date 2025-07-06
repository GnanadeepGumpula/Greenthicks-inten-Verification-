"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { FileText, Download, Search, User, Award } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import QRCode from "qrcode"
import { googleSheetsService } from "../../services/googleSheets"
import { googleDriveService } from "../../services/googleDrive"
import type { Intern } from "../../types"

const Certificates: React.FC = () => {
  const [selectedIntern, setSelectedIntern] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedField, setSelectedField] = useState("")
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [qrLoading, setQrLoading] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadInterns()
  }, [])

  const loadInterns = async () => {
    try {
      setLoading(true)
      const internsData = await googleSheetsService.getInterns()

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

  const generateQRCode = async (internId: string) => {
    const intern = interns.find((i) => i.id === internId)
    if (!intern) {
      console.error("No intern found for ID:", internId)
      return
    }

    try {
      setQrLoading(true)
      console.log("Generating QR code for intern:", intern.uniqueId)

      const verificationUrl = `${window.location.origin}/verify/${intern.uniqueId}`
      console.log("Verification URL:", verificationUrl)

      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      })

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("Failed to get 2D context for canvas")
        setQrLoading(false)
        return
      }

      canvas.width = 400
      canvas.height = 400

      const qrImage = new Image()
      qrImage.crossOrigin = "anonymous"
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 0, 0, 400, 400)

        const logo = new Image()
        logo.crossOrigin = "anonymous"
        logo.onload = () => {
          const logoSize = 60
          const logoX = (400 - logoSize) / 2
          const logoY = (400 - logoSize) / 2

          ctx.save()
          ctx.beginPath()
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 5, 0, 2 * Math.PI)
          ctx.fillStyle = "white"
          ctx.fill()

          ctx.beginPath()
          ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, 2 * Math.PI)
          ctx.clip()
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
          ctx.restore()

          const newQrCodeUrl = canvas.toDataURL()
          setQrCodeUrl(newQrCodeUrl)
          console.log("QR code generated successfully:", newQrCodeUrl)
          setQrLoading(false)
        }
        logo.onerror = () => {
          console.error("Failed to load logo image")
          setQrLoading(false)
        }
        logo.src = "/Greenthicks_Tech_Logo.png"
      }
      qrImage.onerror = () => {
        console.error("Failed to load QR image")
        setQrLoading(false)
      }
      qrImage.src = qrDataUrl
    } catch (error) {
      console.error("Error generating QR code:", error)
      alert("Error generating QR code. Please try again.")
      setQrLoading(false)
    }
  }

  useEffect(() => {
    if (selectedIntern && selectedField) {
      console.log("Triggering QR code generation for intern:", selectedIntern)
      generateQRCode(selectedIntern)
    } else {
      setQrCodeUrl("")
      console.log("Clearing QR code due to missing intern or field")
    }
  }, [selectedIntern, selectedField])

  const filteredInterns = interns.filter(
    (intern) =>
      `${intern.firstName} ${intern.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.uniqueId.includes(searchTerm) ||
      intern.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedInternData = interns.find((i) => i.id === selectedIntern)
  const selectedFieldData = selectedInternData?.internshipFields.find((f) => f.id === selectedField)

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

  const generateCertificate = async () => {
    if (!certificateRef.current || !selectedInternData || !selectedFieldData) {
      console.error("Cannot generate certificate: missing ref or data")
      return
    }

    try {
      const canvas = await html2canvas(certificateRef.current!, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("landscape", "mm", "a4")

      const imgWidth = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`certificate-${selectedInternData.uniqueId}-${selectedFieldData.fieldName.replace(/\s+/g, "-")}.pdf`)
    } catch (error) {
      console.error("Error generating certificate:", error)
      alert("Error generating certificate. Please try again.")
    }
  }

  const downloadImage = async () => {
    if (!certificateRef.current || !selectedInternData || !selectedFieldData) {
      console.error("Cannot download image: missing ref or data")
      return
    }

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const link = document.createElement("a")
      link.download = `certificate-${selectedInternData.uniqueId}-${selectedFieldData.fieldName.replace(/\s+/g, "-")}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error("Error downloading image:", error)
      alert("Error downloading image. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Certificate Generator</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create and download professional certificates for interns
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls */}
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
                  onChange={(e) => {
                    setSelectedIntern(e.target.value)
                    setSelectedField("")
                  }}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Internship Field
                  </label>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a field...</option>
                    {selectedInternData.internshipFields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.fieldName} ({field.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedInternData && selectedFieldData && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-500" />
                    Certificate Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Intern:</span>{" "}
                      {selectedInternData.firstName} {selectedInternData.lastName}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Field:</span>{" "}
                      {selectedFieldData.fieldName}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>{" "}
                      {selectedFieldData.duration}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>{" "}
                      {selectedFieldData.type}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Period:</span>{" "}
                      {new Date(selectedFieldData.startDate ?? "").toLocaleDateString()} - 
                      {new Date(selectedFieldData.endDate ?? "").toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={generateCertificate}
                  disabled={!selectedInternData || !selectedFieldData || qrLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Download PDF
                </button>

                <button
                  onClick={downloadImage}
                  disabled={!selectedInternData || !selectedFieldData || qrLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Image
                </button>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="lg:col-span-2">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certificate Preview</h3>

                {selectedInternData && selectedFieldData ? (
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                    <div
                      ref={certificateRef}
                      className="w-full aspect-[1.414/1] p-12 bg-gradient-to-br from-green-50 via-white to-blue-50 relative"
                      style={{ minHeight: "600px" }}
                    >
                      {/* Certificate Border */}
                      <div className="absolute inset-4 border-4 border-green-600 rounded-lg"></div>
                      <div className="absolute inset-6 border-2 border-green-300 rounded-lg"></div>

                      {/* Header */}
                      <div className="text-center mb-8">
                        <div className="flex justify-center items-center mb-4">
                          <img src="/Greenthicks_Tech_Logo.png" alt="Green Thicks Logo" className="h-16 w-auto" />
                        </div>
                        <h1 className="text-4xl font-bold text-green-700 mb-2">Green Thicks</h1>
                        <p className="text-lg text-gray-600">Fresh From Farm To Table</p>
                      </div>

                      {/* Certificate Title */}
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Certificate of Completion</h2>
                        <p className="text-lg text-gray-600">This is to certify that</p>
                      </div>

                      {/* Intern Name */}
                      <div className="text-center mb-8">
                        <h3 className="text-4xl font-bold text-blue-700 border-b-2 border-blue-300 pb-2 inline-block">
                          {selectedInternData.firstName} {selectedInternData.lastName}
                        </h3>
                      </div>

                      {/* Certificate Body */}
                      <div className="text-center mb-8">
                        <p className="text-lg text-gray-700 mb-4">
                          has successfully completed the internship program in
                        </p>
                        <h4 className="text-2xl font-bold text-green-700 mb-4">{selectedFieldData.fieldName}</h4>
                        <p className="text-lg text-gray-700">
                          Duration: {selectedFieldData.duration} ({selectedFieldData.type})
                        </p>
                        <p className="text-lg text-gray-700">
                          Period: {new Date(selectedFieldData.startDate ?? "").toLocaleDateString()} - 
                                  {new Date(selectedFieldData.endDate ?? "").toLocaleDateString()}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-end mt-12">
                        <div className="text-center">
                          <div className="border-t-2 border-gray-400 pt-2 w-48">
                            <p className="text-sm text-gray-600">Program Director</p>
                            <p className="font-semibold text-gray-800">Dr. Sarah Johnson</p>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="bg-white p-2 border border-gray-300 rounded">
                            {qrLoading ? (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-200 text-xs text-gray-500">
                                Loading QR...
                              </div>
                            ) : (
                              <img
                                src={qrCodeUrl || "/placeholder.svg"}
                                alt="QR Code with Logo"
                                className="w-16 h-16"
                                onError={() => console.error("QR code image failed to load:", qrCodeUrl)}
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Scan to verify</p>
                        </div>

                        <div className="text-center">
                          <div className="border-t-2 border-gray-400 pt-2 w-48">
                            <p className="text-sm text-gray-600">Date of Issue</p>
                            <p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Certificate ID */}
                      <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                          Certificate ID: GT-{selectedInternData.uniqueId}-{selectedFieldData.id}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-12 text-center">
                    <Award className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select an intern and field to preview the certificate</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certificates