'use client'

import { useState } from 'react'

type Tab = 'profile' | 'account' | 'notifications'

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [firstName, setFirstName] = useState('Jane')
  const [lastName, setLastName] = useState('Doe')
  const [email, setEmail] = useState('abc@gmail.com')
  const [workplace, setWorkplace] = useState('Other')
  const [country, setCountry] = useState('Kenya')
  const [industry, setIndustry] = useState('Other')
  const [showOptions, setShowOptions] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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

  const selectedCount = Object.values(focusAreas).filter(Boolean).length

  const toggleFocusArea = (key: keyof typeof focusAreas) => {
    setFocusAreas(prev => ({ ...prev, [key]: !prev[key] }))
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

  const handleReset = () => {
    setFirstName('Jane')
    setLastName('Doe')
    setEmail('abc@gmail.com')
    setWorkplace('Other')
    setCountry('Kenya')
    setIndustry('Other')
    setFocusAreas({
      macroeconomic: true,
      optimalTimes: true,
      political: true,
      sentiment: false,
    })
  }

  const handleSave = () => {
    console.log('Saving settings...')
    // TODO: API call to save settings
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
                  <path d="M11.334 2.00004C11.5091 1.82494 11.7169 1.68605 11.9457 1.59129C12.1745 1.49653 12.4197 1.44775 12.6673 1.44775C12.9149 1.44775 13.1601 1.49653 13.3889 1.59129C13.6177 1.68605 13.8256 1.82494 14.0007 2.00004C14.1757 2.17513 14.3146 2.383 14.4094 2.61178C14.5042 2.84055 14.5529 3.08575 14.5529 3.33337C14.5529 3.58099 14.5042 3.82619 14.4094 4.05497C14.3146 4.28374 14.1757 4.49161 14.0007 4.66671L5.00065 13.6667L1.33398 14.6667L2.33398 11L11.334 2.00004Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit photo
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Workplace */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Workplace</label>
                <select
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Other">Other</option>
                  <option value="Startup">Startup</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Government">Government</option>
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
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                  >
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Other">Other</option>
                  <option value="Finance">Finance</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
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
                  <div className="px-4 py-3 bg-white">
                    <div className="text-xs font-medium text-gray-500 mb-3">Selected</div>
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
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

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
                    <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-black transition-colors">
                      <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-7 shadow-sm">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
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
                    <p className="text-sm text-gray-600">Update your current subscription plan</p>
                  </div>
                  <button className="px-6 py-2.5 bg-white border border-gray-300 text-black rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Manage subscription
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
                  <button className="px-6 py-2.5 bg-white border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                      emailNotifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  >
                    {emailNotifications && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
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
                  <h3 className="text-base font-semibold text-black mb-3">ISI Notifications</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Notify when ISI drops below</span>
                    <select
                      value={isiThreshold}
                      onChange={(e) => setIsiThreshold(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-sm text-gray-900"
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
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    isiNotifications ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                      isiNotifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  >
                    {isiNotifications && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
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
                  <h3 className="text-base font-semibold text-black mb-3">METI Notifications</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Alert me when METI shifts to</span>
                    <select
                      value={metiAlert}
                      onChange={(e) => setMetiAlert(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-sm text-gray-900"
                    >
                      <option value="Optimal Entry">Optimal Entry</option>
                      <option value="Caution">Caution</option>
                      <option value="High Risk">High Risk</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setMetiNotifications(!metiNotifications)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    metiNotifications ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                      metiNotifications ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  >
                    {metiNotifications && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
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
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    weeklyUpdates ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                      weeklyUpdates ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  >
                    {weeklyUpdates && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute inset-0 m-auto">
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
              className="px-8 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
