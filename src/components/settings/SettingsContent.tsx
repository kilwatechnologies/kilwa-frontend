'use client'

import { useState, useEffect } from 'react'
import { authApi, countriesApi, stripeApi, notificationApi } from '@/lib/api'
import { saveCountryPreference } from '@/lib/countryPreference'

type Tab = 'profile' | 'account' | 'notifications'

interface SettingsContentProps {
  onContentReady?: () => void
}

export default function SettingsContent({ onContentReady }: SettingsContentProps) {
  // Check URL params for tab on mount
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab === 'account' || tab === 'notifications') {
        return tab as Tab
      }
    }
    return 'profile'
  })
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [profilePictureBlob, setProfilePictureBlob] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [country, setCountry] = useState('')
  const [industry, setIndustry] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [managingSubscription, setManagingSubscription] = useState(false)

  const [focusAreas, setFocusAreas] = useState({
    macroeconomic: true,
    optimalTimes: true,
    political: true,
    sentiment: false,
  })

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [isiNotifications, setIsiNotifications] = useState(true)
  const [isiThreshold, setIsiThreshold] = useState('50')
  const [metiNotifications, setMetiNotifications] = useState(true)
  const [metiAlert, setMetiAlert] = useState('Optimal Entry')
  const [weeklyUpdates, setWeeklyUpdates] = useState(true)
  const [savingNotifications, setSavingNotifications] = useState(false)

  const selectedCount = Object.values(focusAreas).filter(Boolean).length

  const toggleFocusArea = (key: keyof typeof focusAreas) => {
    setFocusAreas(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getCountryFlag = (countryName: string): string | null => {
    const flagMap: { [key: string]: string } = {
      'Nigeria': '/assets/nigeria.svg',
      'Ghana': '/assets/ghana.svg',
      'Kenya': '/assets/kenya.svg',
      'South Africa': '/assets/south-africa.svg',
      'Egypt': '/assets/egypt.svg',
      'Morocco': '/assets/morocco.svg',
      'Ethiopia': '/assets/ethiopia.svg',
      'Tanzania': '/assets/tanzania.svg',
      'Botswana': '/assets/botswana.svg',
      'Rwanda': '/assets/rwanda.svg',
      'Tunisia': '/assets/tunisia.svg',
      'Mauritius': '/assets/mauritius.svg',
    }
    return flagMap[countryName] || null
  }

  // Check for payment success/cancel on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const payment = params.get('payment')

      if (payment === 'success') {
        showToast('Subscription updated successfully!', 'success')
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname + '?tab=account')
      } else if (payment === 'canceled') {
        showToast('Payment was canceled', 'error')
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname + '?tab=account')
      }
    }
  }, [])

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (token) {
          const response = await authApi.getCurrentUser(token)
          console.log('User data response:', response.data)

          // Handle both response.data.user and response.data.data.user
          const responseData: any = response.data
          const userData = responseData.user || responseData.data?.user
          const userPreferences = responseData.preferences || responseData.data?.preferences

          if (userData) {
            setFirstName(userData.first_name || '')
            setLastName(userData.last_name || '')
            setEmail(userData.email || '')
            setProfilePicture(userData.profile_picture || '')
            setProfilePictureBlob(userData.profile_picture_blob || '')
            setJobTitle(userData.job_title || '')
            setCountry(userData.country || '')
            setIndustry(userData.industry || '')
            setUserId(userData.id || null)
            setUserPlan(userData.subscription_plan || 'free')

            // Load focus area preferences from user preferences
            console.log('User preferences:', userPreferences)
            if (userPreferences?.selected_goals) {
              const selectedGoalsArray = userPreferences.selected_goals
              console.log('Loading selected goals:', selectedGoalsArray)

              // Convert array of goal names to object format
              const loadedFocusAreas = {
                macroeconomic: Array.isArray(selectedGoalsArray) ? selectedGoalsArray.includes('macroeconomic') : false,
                optimalTimes: Array.isArray(selectedGoalsArray) ? selectedGoalsArray.includes('optimalTimes') : false,
                political: Array.isArray(selectedGoalsArray) ? selectedGoalsArray.includes('political') : false,
                sentiment: Array.isArray(selectedGoalsArray) ? selectedGoalsArray.includes('sentiment') : false,
              }
              console.log('Setting focus areas to:', loadedFocusAreas)
              setFocusAreas(loadedFocusAreas)
            }

            // Load notification preferences
            if (userData.id) {
              try {
                const prefsResponse = await notificationApi.getPreferences(userData.id)
                if (prefsResponse.data.success && prefsResponse.data.data) {
                  const prefs = prefsResponse.data.data
                  setEmailNotifications(prefs.email_notifications ?? true)
                  setWeeklyUpdates(prefs.weekly_isi_updates ?? true)
                  setIsiNotifications(prefs.isi_notifications ?? true)
                  setIsiThreshold(prefs.isi_threshold?.toString() ?? '50')
                  setMetiNotifications(prefs.meti_notifications ?? true)
                  setMetiAlert(prefs.meti_alert_type ?? 'Optimal Entry')
                }
              } catch (error) {
                console.error('Failed to load notification preferences:', error)
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Notify parent when data is loaded
  useEffect(() => {
    if (!loading && onContentReady) {
      onContentReady()
    }
  }, [loading, onContentReady])

  const handleReset = () => {
    // Reset to original loaded values - would need to store original values
    // For now, reload from API
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (token) {
          const response = await authApi.getCurrentUser(token)
          const responseData: any = response.data
          const userData = responseData.user || responseData.data?.user

          if (userData) {
            setFirstName(userData.first_name || '')
            setLastName(userData.last_name || '')
            setEmail(userData.email || '')
            setProfilePicture(userData.profile_picture || '')
            setProfilePictureBlob(userData.profile_picture_blob || '')
            setJobTitle(userData.job_title || '')
            setCountry(userData.country || '')
            setIndustry(userData.industry || '')
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }
    loadUserData()
  }

  const handleEditPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error')
      return
    }

    try {
      setUploadingPhoto(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/upload/profile-picture`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.public_url) {
        setProfilePicture(data.public_url)
        setProfilePictureBlob(data.blob_name)

        // Update profile immediately
        await authApi.updateProfile(email, undefined, undefined, data.public_url, data.blob_name)
        showToast('Profile picture updated successfully!', 'success')
      } else {
        showToast('Failed to upload image. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showToast('Failed to upload image. Please try again.', 'error')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    try {
      setProfilePicture('')
      setProfilePictureBlob('')

      // Update profile to remove picture
      await authApi.updateProfile(email, undefined, undefined, '', '')
      showToast('Profile picture removed successfully!', 'success')
    } catch (error) {
      console.error('Remove error:', error)
      showToast('Failed to remove profile picture. Please try again.', 'error')
    }
  }

  const handleSave = async () => {
    try {
      const response = await authApi.updateProfile(email, firstName, lastName, undefined, undefined, jobTitle, industry, country)
      console.log('Profile update response:', response)

      // Update localStorage with new email if it was changed (though email is disabled)
      if (email) {
        localStorage.setItem('user_email', email)
        localStorage.setItem('userEmail', email)
      }

      // Save country preference to localStorage for use across the app
      if (country) {
        try {
          const countriesResponse = await countriesApi.getAfricanCountries()
          if (countriesResponse.data.success && countriesResponse.data.data) {
            const selectedCountry = countriesResponse.data.data.find(
              (c: any) => c.name === country
            )
            if (selectedCountry) {
              saveCountryPreference({
                id: selectedCountry.id,
                name: selectedCountry.name,
                isoCode: selectedCountry.isoCode
              })
              console.log('Country preference saved:', selectedCountry.name)
            }
          }
        } catch (error) {
          console.error('Failed to save country preference:', error)
        }
      }

      // Save focus area preferences
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          // Convert focusAreas object to array of selected goal names
          const selectedGoalsArray: string[] = []
          if (focusAreas.macroeconomic) selectedGoalsArray.push('macroeconomic')
          if (focusAreas.optimalTimes) selectedGoalsArray.push('optimalTimes')
          if (focusAreas.political) selectedGoalsArray.push('political')
          if (focusAreas.sentiment) selectedGoalsArray.push('sentiment')

          await authApi.updatePreferences({
            selected_goals: selectedGoalsArray
          }, token)
          console.log('Focus area preferences saved:', selectedGoalsArray)
        } catch (error) {
          console.error('Failed to save focus area preferences:', error)
        }
      }

      showToast('Settings saved successfully!', 'success')

      // Optionally reload the page to update header
      // window.location.reload()
    } catch (error) {
      console.error('Failed to save settings:', error)
      showToast('Failed to save settings. Please try again.', 'error')
    }
  }

  const handleChangePassword = async () => {
    try {
      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields', 'error')
        return
      }

      if (newPassword !== confirmPassword) {
        showToast('New password and confirm password do not match', 'error')
        return
      }

      if (newPassword.length < 8) {
        showToast('New password must be at least 8 characters long', 'error')
        return
      }

      await authApi.changePassword(email, currentPassword, newPassword)

      showToast('Password changed successfully!', 'success')

      // Clear form and go back
      setShowChangePassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Failed to change password:', error)
      const errorMessage = error?.response?.data?.detail || 'Failed to change password. Please try again.'
      showToast(errorMessage, 'error')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        showToast('Authentication required', 'error')
        return
      }

      await authApi.deleteAccount(token)

      // Clear all user data from localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_email')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('country_preference')

      showToast('Account deleted successfully', 'success')

      // Redirect to welcome/onboarding page after a short delay
      setTimeout(() => {
        window.location.href = '/onboarding'
      }, 2000)
    } catch (error: any) {
      console.error('Failed to delete account:', error)
      const errorMessage = error?.response?.data?.detail || 'Failed to delete account. Please try again.'
      showToast(errorMessage, 'error')
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true)

      if (!userId) {
        showToast('User ID not found. Please refresh the page.', 'error')
        return
      }

      await notificationApi.updatePreferences(userId, {
        email_notifications: emailNotifications,
        weekly_isi_updates: weeklyUpdates,
        isi_notifications: isiNotifications,
        isi_threshold: parseInt(isiThreshold),
        meti_notifications: metiNotifications,
        meti_alert_type: metiAlert
      })

      showToast('Notification preferences saved successfully!', 'success')
    } catch (error: any) {
      console.error('Failed to save notification preferences:', error)
      const errorMessage = error?.response?.data?.detail || 'Failed to save notification preferences. Please try again.'
      showToast(errorMessage, 'error')
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setManagingSubscription(true)

      if (!userId) {
        showToast('User ID not found. Please refresh the page.', 'error')
        return
      }

      console.log('Managing subscription for user:', userId, 'plan:', userPlan)

      // Temporary: Redirect all users to plan selection until Customer Portal is configured
      // TODO: Once Stripe Customer Portal is configured, use the code below for paid users
      window.location.href = '/onboarding/step-5?returnTo=settings'
      return

      // // For free tier users, redirect to onboarding step 5 to select a plan
      // if (userPlan === 'free') {
      //   window.location.href = '/onboarding/step-5'
      //   return
      // }

      // // For paid users, open Stripe Customer Portal
      // console.log('Creating portal session...')
      // const response = await stripeApi.createPortalSession(
      //   userId,
      //   `${window.location.origin}/settings?tab=account`
      // )

      // console.log('Portal session response:', response.data)

      // if (response.data.success && response.data.data?.portal_url) {
      //   // Redirect to Stripe Customer Portal
      //   window.location.href = response.data.data.portal_url
      // } else if (!response.data.success) {
      //   // Subscription record missing in database - redirect to re-purchase
      //   const errorMsg = (response.data as any).error || 'Failed to create portal session'
      //   showToast(`Subscription issue: ${errorMsg}. Redirecting to upgrade page...`, 'error')
      //   setTimeout(() => {
      //     window.location.href = '/onboarding/step-5'
      //   }, 2000)
      // } else {
      //   throw new Error('Failed to create portal session')
      // }
    } catch (error: any) {
      console.error('Failed to manage subscription:', error)
      console.error('Error response:', error?.response)
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.error || 'Failed to open subscription management. Please try again.'
      showToast(errorMessage, 'error')
    } finally {
      setManagingSubscription(false)
    }
  }

  return (
    <div className="bg-white min-h-full p-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-black mb-8">Settings</h1>

      {/* Tabs */}
      <div className="inline-flex gap-1 mb-8 p-1 rounded-lg" style={{ backgroundColor: '#F8FAFB' }}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-white text-black shadow-sm'
              : 'bg-transparent text-gray-500 hover:text-black'
          }`}
        >
          Profile details
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'account'
              ? 'bg-white text-black shadow-sm'
              : 'bg-transparent text-gray-500 hover:text-black'
          }`}
        >
          Account details
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'notifications'
              ? 'bg-white text-black shadow-sm'
              : 'bg-transparent text-gray-500 hover:text-black'
          }`}
        >
          Notifications
        </button>
      </div>

      {/* Profile Details Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-4xl">
          {/* Avatar Section */}
          <div className="mb-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#F8FAFB' }}>
              <h2 className="text-lg font-semibold text-black mb-4">Avatar</h2>
              <div className="flex items-center gap-4">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white text-2xl font-bold">
                    {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : 'JD'}
                  </div>
                )}
                <input
                  type="file"
                  id="profile-picture-input"
                  accept="image/*"
                  onChange={handleEditPhoto}
                  className="hidden"
                />
                <button
                  onClick={() => document.getElementById('profile-picture-input')?.click()}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
                    <path d="M11.334 2.00004C11.5091 1.82494 11.7169 1.68605 11.9457 1.59129C12.1745 1.49653 12.4197 1.44775 12.6673 1.44775C12.9149 1.44775 13.1601 1.49653 13.3889 1.59129C13.6177 1.68605 13.8256 1.82494 14.0007 2.00004C14.1757 2.17513 14.3146 2.383 14.4094 2.61178C14.5042 2.84055 14.5529 3.08575 14.5529 3.33337C14.5529 3.58099 14.5042 3.82619 14.4094 4.05497C14.3146 4.28374 14.1757 4.49161 14.0007 4.66671L5.00065 13.6667L1.33398 14.6667L2.33398 11L11.334 2.00004Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {uploadingPhoto ? 'Uploading...' : 'Edit photo'}
                </button>
                <button
                  onClick={handleRemovePhoto}
                  disabled={!profilePicture || uploadingPhoto}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
                    <path d="M12 4L4 12M4 4L12 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#F8FAFB' }}>
              <h2 className="text-lg font-semibold text-black mb-4">Personal Information</h2>
              <div className="grid grid-cols-3 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900 bg-white"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900 bg-white"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Job Title</label>
                <select
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none  bg-white text-gray-900"
                >
                  <option value="">Select your job title</option>
                  <option value="CEO">CEO</option>
                  <option value="CFO">CFO</option>
                  <option value="CTO">CTO</option>
                  <option value="Managing Director">Managing Director</option>
                  <option value="Director">Director</option>
                  <option value="Senior Manager">Senior Manager</option>
                  <option value="Manager">Manager</option>
                  <option value="Investment Analyst">Investment Analyst</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                  <option value="Portfolio Manager">Portfolio Manager</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Advisor">Advisor</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Country</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    {getCountryFlag(country) && (
                      <img
                        src={getCountryFlag(country)!}
                        alt={country}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg outline-none  bg-white appearance-none text-gray-900"
                  >
                    <option value="">Select your country</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Mauritius">Mauritius</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none  bg-white text-gray-900"
                >
                  <option value="">Select your industry</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Energy & Resources">Energy & Resources</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Government">Government</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              </div>
            </div>
          </div>

          {/* Personalization */}
          <div className="mb-8">
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#F8FAFB' }}>
              <h2 className="text-lg font-semibold text-black mb-2">Personalization</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select your primary markets to tailor a dashboard that aligns with your trading focus.
              </p>

              <div className="mb-2">
                <label className="text-sm text-gray-600">Checkbox (Group)</label>
              </div>

              <div className="border border-gray-200 rounded-lg bg-white">
              {/* Checkbox Group Header */}
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg"
              >
                <div className="text-sm text-gray-700">{selectedCount} focus areas selected</div>
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  className={`transform transition-transform ${showOptions ? 'rotate-180' : ''}`}
                >
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Expanded Options */}
              {showOptions && (
                <div className="border-t border-gray-200">
                  {selectedCount > 0 && (
                    <>
                      <div className="px-4 py-3 bg-white">
                        <div className="text-xs font-medium text-gray-500 mb-3">Selected</div>
                        <div className="space-y-3">
                          {focusAreas.macroeconomic && (
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={focusAreas.macroeconomic}
                                onChange={() => toggleFocusArea('macroeconomic')}
                                className="w-5 h-5 rounded border-gray-300 accent-black focus:ring-black focus:ring-2"
                              />
                              <span className="text-sm text-gray-700">Track macroeconomic risk</span>
                            </label>
                          )}
                          {focusAreas.optimalTimes && (
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={focusAreas.optimalTimes}
                                onChange={() => toggleFocusArea('optimalTimes')}
                                className="w-5 h-5 rounded border-gray-300 accent-black focus:ring-black focus:ring-2"
                              />
                              <span className="text-sm text-gray-700">Find optimal times to enter a market</span>
                            </label>
                          )}
                          {focusAreas.political && (
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={focusAreas.political}
                                onChange={() => toggleFocusArea('political')}
                                className="w-5 h-5 rounded border-gray-300 accent-black focus:ring-black focus:ring-2"
                              />
                              <span className="text-sm text-gray-700">Monitor political & regulatory risks</span>
                            </label>
                          )}
                          {focusAreas.sentiment && (
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={focusAreas.sentiment}
                                onChange={() => toggleFocusArea('sentiment')}
                                className="w-5 h-5 rounded border-gray-300 accent-black focus:ring-black focus:ring-2"
                              />
                              <span className="text-sm text-gray-700">Analyze news & sentiment trends</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-200"></div>
                    </>
                  )}

                  <div className="px-4 py-3">
                    <div className="text-xs font-medium text-gray-500 mb-3">Options</div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={focusAreas.macroeconomic}
                          onChange={() => toggleFocusArea('macroeconomic')}
                          className="w-5 h-5 rounded border-gray-300 accent-black focus:ring-black focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">Track macroeconomic risk</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={focusAreas.optimalTimes}
                          onChange={() => toggleFocusArea('optimalTimes')}
                          className="w-5 h-5 rounded border-gray-300 accent-black focus:ring-black focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">Find optimal times to enter a market</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={focusAreas.political}
                          onChange={() => toggleFocusArea('political')}
                          className="w-5 h-5 rounded border-gray-300 accent-black focus:ring-black focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">Monitor political & regulatory risks</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={focusAreas.sentiment}
                          onChange={() => toggleFocusArea('sentiment')}
                          className="w-5 h-5 rounded border-gray-300 accent-black focus:ring-black focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">Analyze news & sentiment trends</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Save changes
            </button>
          </div>
        </div>
      )}

      {/* Account Details Tab */}
      {activeTab === 'account' && (
        <div>
          {!showChangePassword ? (
            <>
              {/* Security Settings Section */}
              <div className="mb-8">
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#F8FAFB' }}>
                  <h2 className="text-xl pb-6 border-b border-gray-200 font-semibold text-black mb-6">Security Settings</h2>

                  {/* Password Section */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-black mb-1">Password</h3>
                        <p className="text-sm text-gray-600">Change your current password</p>
                      </div>
                      <button
                        onClick={() => setShowChangePassword(true)}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-black rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Change password
                      </button>
                    </div>
                  </div>

                  {/* Two Factor Authentication Section */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-black mb-1">Two Factor Authentication (2FA)</h3>
                      <p className="text-sm text-gray-600">You have enabled the two step verification</p>
                    </div>
                    <button className="relative inline-flex h-6 w-10 items-center rounded-full bg-black transition-colors">
                      <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-[18px] shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
                          <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Subscription Section */}
              <div className="mb-4">
                <div className="rounded-2xl p-6 flex items-center justify-between" style={{ backgroundColor: '#F8FAFB' }}>
                  <div>
                    <h3 className="text-base font-semibold text-black mb-1">Subscription</h3>
                    <p className="text-sm text-gray-600">
                      {userPlan === 'free'
                        ? 'Upgrade your plan to unlock more features'
                        : `Current plan: ${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}`}
                    </p>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={managingSubscription}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-black rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {managingSubscription ? 'Loading...' : (userPlan === 'free' ? 'Upgrade plan' : 'Manage subscription')}
                  </button>
                </div>
              </div>

              {/* Delete Account Section */}
              <div className="mb-4">
                <div className="rounded-2xl p-6 flex items-center justify-between" style={{ backgroundColor: '#F8FAFB' }}>
                  <div>
                    <h3 className="text-base font-semibold text-black mb-1">Delete account</h3>
                    <p className="text-sm text-gray-600">You can delete your account permanently.</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-2.5 bg-white border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Change Password Form */
            <div className="rounded-2xl p-8" style={{ backgroundColor: '#F8FAFB' }}>
              <h2 className="text-2xl font-semibold text-black mb-2">Change Password</h2>
              <p className="text-sm text-gray-600 mb-8">Your password must be a strong combination of letters, alphabets and numbers.</p>

              {/* Current Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="off"
                  data-form-type="other"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none  bg-white text-gray-900"
                  placeholder="**************"
                />
              </div>

              {/* New Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  data-form-type="other"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white text-gray-900"
                  placeholder="Enter New Password"
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  data-form-type="other"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none bg-white text-gray-900"
                  placeholder="Re-enter your Password"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => {
                    setShowChangePassword(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleChangePassword}
                  className="px-8 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Save changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          <div className="rounded-2xl p-8" style={{ backgroundColor: '#F8FAFB' }}>
            <h2 className="text-2xl font-semibold text-black mb-2">Notifications</h2>
            <p className="text-sm text-gray-600 mb-6">Choose which notifications Kilwa should send you.</p>

            <div className="border-t border-gray-200 mb-6"></div>

            {/* Email Notifications */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-black mb-1">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email at the address specified in your{' '}
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="text-black underline hover:text-gray-700"
                    >
                      Profile
                    </button>
                    .
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      emailNotifications ? 'translate-x-[18px]' : 'translate-x-[2px]'
                    }`}
                  >
                    {emailNotifications && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
                        <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* ISI Notifications */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-black mb-2">ISI Notifications</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Notify when ISI drops below</span>
                    <select
                      value={isiThreshold}
                      onChange={(e) => setIsiThreshold(e.target.value)}
                      className="px-4 py-1 border border-gray-300 rounded-full outline-none  bg-transparent text-sm text-gray-900"
                    >
                      <option value="30">30</option>
                      <option value="40">40</option>
                      <option value="50">50</option>
                      <option value="60">60</option>
                      <option value="70">70</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setIsiNotifications(!isiNotifications)}
                  className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                    isiNotifications ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      isiNotifications ? 'translate-x-[18px]' : 'translate-x-[2px]'
                    }`}
                  >
                    {isiNotifications && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
                        <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* METI Notifications */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-black mb-2">METI Notifications</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Alert me when METI shifts to</span>
                    <select
                      value={metiAlert}
                      onChange={(e) => setMetiAlert(e.target.value)}
                      className="px-4 py-1 border border-gray-300 rounded-full outline-none  bg-transparent text-sm text-gray-900"
                    >
                      <option value="Early Entry">Early Entry</option>
                      <option value="Optimal Entry">Optimal Entry</option>
                      <option value="Late Entry">Late Entry</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setMetiNotifications(!metiNotifications)}
                  className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                    metiNotifications ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      metiNotifications ? 'translate-x-[18px]' : 'translate-x-[2px]'
                    }`}
                  >
                    {metiNotifications && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
                        <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Weekly Updates */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-black mb-1">Weekly Updates</h3>
                  <p className="text-sm text-gray-600">Stay informed with curated weekly insights</p>
                </div>
                <button
                  onClick={() => setWeeklyUpdates(!weeklyUpdates)}
                  className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                    weeklyUpdates ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      weeklyUpdates ? 'translate-x-[18px]' : 'translate-x-[2px]'
                    }`}
                  >
                    {weeklyUpdates && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
                        <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <button
              onClick={() => {
                setEmailNotifications(true)
                setIsiNotifications(true)
                setIsiThreshold('50')
                setMetiNotifications(true)
                setMetiAlert('Optimal Entry')
                setWeeklyUpdates(true)
              }}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotifications}
              disabled={savingNotifications}
              className="px-8 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingNotifications ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in z-50 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
              <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
              <path d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-black mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  handleDeleteAccount()
                }}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
