import React, { useState, useRef, useEffect } from 'react'

export default function MultiSelectDropdown({ 
  title, 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = "Select options...",
  loading = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState('bottom')
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Close dropdown when clicking outside and handle positioning
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handlePositioning = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        
        // If there's not enough space below (less than 280px for dropdown), show above
        if (spaceBelow < 280 && spaceAbove > spaceBelow) {
          setDropdownPosition('top')
        } else {
          setDropdownPosition('bottom')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handlePositioning)
    window.addEventListener('resize', handlePositioning)
    
    if (isOpen) {
      handlePositioning()
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handlePositioning)
      window.removeEventListener('resize', handlePositioning)
    }
  }, [isOpen])

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleOption = (option) => {
    const updated = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option]
    onChange(updated)
  }

  const handleSelectAll = () => {
    onChange(filteredOptions)
  }

  const handleClearAll = () => {
    onChange([])
  }

  const getDisplayText = () => {
    if (loading) return "Loading..."
    if (selectedValues.length === 0) return placeholder
    if (selectedValues.length === 1) return selectedValues[0]
    return `${selectedValues.length} selected`
  }

  if (!options || options.length === 0) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
        
        {/* Dropdown Button */}
        <button
          ref={buttonRef}
          onClick={() => !loading && setIsOpen(!isOpen)}
          disabled={loading}
          className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-left text-white text-sm transition-colors flex items-center justify-between ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'
          }`}
        >
          <span className="truncate">{getDisplayText()}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className={`absolute z-[9999] w-full bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-64 overflow-hidden left-0 ${
          dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`} style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>
          {/* Search Input */}
          <div className="p-2 border-b border-slate-600">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-500 rounded text-white text-sm placeholder-slate-400"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Action Buttons */}
          <div className="p-2 border-b border-slate-600 flex gap-2">
            <button
              onClick={handleSelectAll}
              className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Options List */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-slate-400 text-sm text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleToggleOption(option)}
                    className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-slate-300 truncate">{option}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}