'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  User,
  CreditCard,
  Building,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react'

interface KYCStep {
  id: string
  title: string
  description: string
  required: boolean
}

const kycSteps: KYCStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Basic identity verification details',
    required: true
  },
  {
    id: 'identity',
    title: 'Identity Verification',
    description: 'Government-issued ID document upload',
    required: true
  },
  {
    id: 'address',
    title: 'Address Verification',
    description: 'Proof of residence document',
    required: true
  },
  {
    id: 'financial',
    title: 'Financial Information',
    description: 'Income and employment verification',
    required: true
  },
  {
    id: 'compliance',
    title: 'Compliance & Risk',
    description: 'AML and regulatory compliance checks',
    required: true
  }
]

export default function KYCPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [kycData, setKycData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn: '',
    phone: '',
    email: '',
    
    // Identity Documents
    idType: '',
    idNumber: '',
    idFrontImage: null as File | null,
    idBackImage: null as File | null,
    selfieImage: null as File | null,
    
    // Address Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    addressProofImage: null as File | null,
    
    // Financial Information
    employmentStatus: '',
    employer: '',
    annualIncome: '',
    sourceOfFunds: '',
    
    // Compliance
    isPoliticallyExposed: false,
    hasConvictions: false,
    agreeToTerms: false,
    agreeToPrivacy: false
  })

  const fileInputRefs = {
    idFront: useRef<HTMLInputElement>(null),
    idBack: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
    addressProof: useRef<HTMLInputElement>(null)
  }

  const handleInputChange = (field: string, value: any) => {
    setKycData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File) => {
    setKycData(prev => ({ ...prev, [field]: file }))
  }

  const nextStep = () => {
    if (currentStep < kycSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitKYC = async () => {
    try {
      const formData = new FormData()
      Object.entries(kycData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      })
      
      // Submit to backend for processing
      console.log('Submitting KYC data...')
      // await submitKYCData(formData)
    } catch (error) {
      console.error('KYC submission failed:', error)
    }
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={kycData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter your first name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={kycData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={kycData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Social Security Number *
          </label>
          <input
            type="password"
            value={kycData.ssn}
            onChange={(e) => handleInputChange('ssn', e.target.value)}
            className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="XXX-XX-XXXX"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={kycData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={kycData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="your@email.com"
            required
          />
        </div>
      </div>
    </div>
  )

  const renderIdentityVerification = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          ID Document Type *
        </label>
        <select
          value={kycData.idType}
          onChange={(e) => handleInputChange('idType', e.target.value)}
          className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        >
          <option value="">Select ID type</option>
          <option value="passport">Passport</option>
          <option value="drivers_license">Driver's License</option>
          <option value="national_id">National ID Card</option>
          <option value="state_id">State ID Card</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          ID Number *
        </label>
        <input
          type="text"
          value={kycData.idNumber}
          onChange={(e) => handleInputChange('idNumber', e.target.value)}
          className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Enter ID number"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            ID Front Image *
          </label>
          <div 
            onClick={() => fileInputRefs.idFront.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
          >
            {kycData.idFrontImage ? (
              <div className="text-emerald-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Front uploaded</p>
              </div>
            ) : (
              <div className="text-slate-400">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Upload front side</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRefs.idFront}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload('idFrontImage', e.target.files[0])}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            ID Back Image *
          </label>
          <div 
            onClick={() => fileInputRefs.idBack.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
          >
            {kycData.idBackImage ? (
              <div className="text-emerald-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Back uploaded</p>
              </div>
            ) : (
              <div className="text-slate-400">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Upload back side</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRefs.idBack}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload('idBackImage', e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Selfie Verification *
        </label>
        <div 
          onClick={() => fileInputRefs.selfie.current?.click()}
          className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors max-w-md mx-auto"
        >
          {kycData.selfieImage ? (
            <div className="text-emerald-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Selfie uploaded</p>
            </div>
          ) : (
            <div className="text-slate-400">
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Upload selfie photo</p>
              <p className="text-xs mt-1">Hold your ID next to your face</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRefs.selfie}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload('selfieImage', e.target.files[0])}
          className="hidden"
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-full px-6 py-3 mb-6">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm tracking-wide">SECURE VERIFICATION</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Identity Verification
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Complete your KYC verification to access all DhanAi features securely and compliantly
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300 font-medium">Progress</span>
            <span className="text-slate-400 text-sm">
              Step {currentStep + 1} of {kycSteps.length}
            </span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / kycSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full"
            />
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {kycSteps[currentStep].title}
            </h2>
            <p className="text-slate-300">
              {kycSteps[currentStep].description}
            </p>
          </div>

          {currentStep === 0 && renderPersonalInfo()}
          {currentStep === 1 && renderIdentityVerification()}
          {/* Add other steps here */}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStep === kycSteps.length - 1 ? (
            <motion.button
              onClick={submitKYC}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-bold rounded-xl shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <span>Submit for Review</span>
              <CheckCircle className="w-5 h-5" />
            </motion.button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
