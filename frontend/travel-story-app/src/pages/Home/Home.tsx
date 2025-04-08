import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { MdAdd } from 'react-icons/md'
import TravelStoryCard from '../../components/Cards/TravelStoryCard'

import { ToastContainer, toast } from 'react-toastify'
import Modal from 'react-modal'
import AddEditTravelStory from './AddEditTravelStory'
import ViewTravelStory from './ViewTravelStory'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyCard from '../../components/Cards/EmptyCard'
import 'react-toastify/dist/ReactToastify.css'
import EmptyImg from '../../assets/images/noData-removebg.png'
import { DayPicker } from 'react-day-picker'
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle'
import { getEmptyCardMessage } from '../../utils/helper'
// import the locale object
import { zhCN } from 'react-day-picker/locale'
import moment from 'moment'

interface UserInfo {
  username: string
  password: string
}

interface TravelStory {
  _id: string
  imageUrl: string
  title: string
  story: string
  visitedDate: string
  visitedLocation: string
  isFavourite: boolean
  onEdit?: () => void // Add this prop
  onFavouriteClick: () => void
  onClick: () => void
}

const Home: React.FC = () => {
  const navigate = useNavigate()

  const [allStories, setAllStories] = useState<TravelStory[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: '',
    password: '',
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState({ from: null, to: null })

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: 'add',
    data: null,
  })

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: {} as TravelStory,
  })

  const handleAddStoryClick = () => {
    setOpenAddEditModal({
      isShown: true,
      type: 'add',
      data: null,
    })
  }

  // Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user')
      if (response.data && response.data.user) {
        setUserInfo(response.data.user)
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.clear()
        navigate('/login')
      }
    }
  }

  // Handle Edit Story Click
  const handleEdit = (data: TravelStory) => {
    setOpenAddEditModal({
      isShown: true,
      type: 'edit',
      data: data,
    })
  }

  // Handle Travel Story Click
  const handleViewStory = (data: TravelStory) => {
    // Implement view functionality
    setOpenViewModal({
      isShown: true,
      data: data,
    })
  }

  // Handle Update Favourite
  const updateIsFavourite = async (storyData: TravelStory) => {
    const storyId = storyData._id
    try {
      const response = await axiosInstance.put(
        `/update-is-favourite/${storyId}`,
        {
          isFavourite: !storyData.isFavourite,
        }
      )
      if (response.data && response.data.success) {
        toast.success('更新成功')
        if (filterType === 'search' && searchQuery) {
          onSearchStory(searchQuery)
        } else if (filterType === 'date') {
          filterStoriesByDate(dateRange)
        } else {
          getAllTravelStories()
        }
      }
    } catch (error) {
      console.error('An error occurred while updating isFavourite:', error)
    }
  }

  const deleteTravelStory = async data => {
    const storyId = data._id
    try {
      const response = await axiosInstance.delete(`/delete-story/${storyId}`)
      console.log('344', response)
      if (response.data && response.data.success) {
        toast.success('删除成功')
        setOpenViewModal(prevState => ({ ...prevState, isShown: false }))
        getAllTravelStories()
      }
    } catch (error) {
      console.error('An error occurred while deleting story:', error)
    }
  }

  // Get all travel stories
  const getAllTravelStories = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('/get-all-stories')
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories)
      }
    } catch (error) {
      console.error('An error occurred while fetching travel stories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 搜索笔记
  const onSearchStory = async query => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('search', {
        params: {
          searchQuery: query,
        },
      })
      if (response.data && response.data.stories) {
        setFilterType('search')
        setAllStories(response.data.stories)
      }
    } catch (error) {
      console.error('An error occurred while searching travel stories:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const handleClearSearch = () => {
    setFilterType('')
    getAllTravelStories()
  }

  // Handle Filter Travel Story By Date Range
  const filterStoriesByDate = async day => {
    setIsLoading(true)
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null
      const endDate = day.to ? moment(day.to).valueOf() : null
      if (startDate && endDate) {
        const response = await axiosInstance.get('/travel-stories/filter', {
          params: {
            startDate,
            endDate,
          },
        })
        if (response.data && response.data.stories) {
          setFilterType('date')
          setAllStories(response.data.stories)
        }
      }
    } catch (error) {
      console.error('An error occurred while filtering travel stories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Date Range Select
  const handleDayClick = day => {
    console.log('day', day)
    setDateRange(day)
    filterStoriesByDate(day)
  }

  const resetFilter = () => {
    setFilterType('')
    setDateRange({
      from: null,
      to: null,
    })
    getAllTravelStories()
  }

  useEffect(() => {
    const fetchData = async () => {
      await getUserInfo()
      await getAllTravelStories()
    }
    fetchData()
  }, [])

  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchNote={onSearchStory}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto py-10">
        <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => {
            resetFilter()
          }}
        />

        <div className="flex gap-7">
          <div className="flex-1 relative">
            {/* Main Content */}
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {allStories.map(item => (
                  <TravelStoryCard
                    key={item._id}
                    imgUrl={item.imageUrl}
                    title={item.title}
                    story={item.story}
                    date={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    onEdit={() => handleEdit(item)}
                    onClick={() => handleViewStory(item)}
                    onFavouriteClick={() => updateIsFavourite(item)}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard
                imgSrc={EmptyImg}
                message={getEmptyCardMessage(filterType)}
              />
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <LoadingSpinner />
              </div>
            )}
          </div>
          <div className="w-[350px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg>">
              <div className="p-3">
                <DayPicker
                  mode="range"
                  timeZone="+08:00"
                  locale={zhCN}
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pagedNavigation
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add & Edit Travel Story Model */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: 'add', data: null })
        }
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex: 999,
          },
        }}
        appElement={document.getElementById('root') as HTMLElement}
        className="model-box scrollbar"
      >
        <AddEditTravelStory
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: 'add', data: null })
          }}
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      {/* View Travel Story Model */}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex: 999,
          },
        }}
        appElement={document.getElementById('root') as HTMLElement}
        className="model-box scrollbar"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal(prevState => ({ ...prevState, isShown: false }))
          }}
          onEditClick={() => {
            setOpenViewModal(prevState => ({ ...prevState, isShown: false }))
            handleEdit(openViewModal.data as TravelStory)
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModal.data as TravelStory)
          }}
        />
      </Modal>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() => {
          handleAddStoryClick()
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
      <ToastContainer />
    </>
  )
}

export default Home
