import React from 'react'
import LOGO from '../assets/images/logo.svg'
import ProfileInfo from './Cards/ProfileInfo'
import { useNavigate } from 'react-router-dom'
import SearchBar from './Input/SearchBar'

interface NavbarProps {
  userInfo: any // Replace 'any' with your specific user info type if available
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearchNote: (query: string) => void
  handleClearSearch: () => void
}

const Navbar: React.FC<NavbarProps> = ({
  userInfo,
  searchQuery,
  setSearchQuery,
  onSearchNote,
  handleClearSearch,
}) => {
  const isToken = localStorage.getItem('token')
  const navigate = useNavigate()

  const onLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery) {
      onSearchNote(searchQuery)
    }
  }

  const onClearSearch = () => {
    handleClearSearch()
    setSearchQuery('')
  }

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
      <img src={LOGO} alt="travel story" className="h-9" />

      {isToken && (
        <>
          <SearchBar
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
            }}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
          <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
        </>
      )}
    </div>
  )
}

export default Navbar
