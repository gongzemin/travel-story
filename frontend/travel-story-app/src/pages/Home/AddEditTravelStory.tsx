import React, { useState } from 'react'
import { MdAdd, MdDeleteOutline, MdUpdate, MdClose } from 'react-icons/md'
import DateSelector from '../../components/Input/DateSelector'
import ImageSelector from '../../components/Input/ImageSelector'
import TagInput from '../../components/Input/TagInput'
import axiosInstance from '../../utils/axiosInstance'
import moment from 'moment'
import { toast } from 'react-toastify'
import uploadImage from '../../utils/uploadImage'
import axios from 'axios'

const SpinnerIcon = () => (
  <div className="w-5 h-5 border-solid border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
)

const AddEditTravelStory = ({
  storyInfo,
  type,
  onClose,
  getAllTravelStories,
}) => {
  // 定义标题、故事、图片、去过的地方、访问日期、错误信息、加载状态等状态
  const [title, setTitle] = useState(storyInfo?.title || '')
  const [storyImg, setStoryImg] = useState<File | null>(
    storyInfo?.imageUrl || null
  )
  const [story, setStory] = useState(storyInfo?.story || '')
  const [visitedLocation, setVisitedLocation] = useState(
    storyInfo?.visitedLocation || []
  )
  const [visitedDate, setVisitedDate] = useState(storyInfo?.visitedDate)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Add New Travel Story
  const addNewTravelStory = async () => {
    setLoading(true) // Start loading
    try {
      let imageUrl = ''
      // Upload image if present
      if (storyImg) {
        const imgUploadRes = await uploadImage(storyImg)
        // Get image url
        imageUrl = imgUploadRes.imageUrl || ''
      }
      const response = await axiosInstance.post('/mine/add-travel-story', {
        title,
        story,
        imageUrl: imageUrl || '',
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
      })
      console.log('response---', response)
      if (response.data && response.data.success) {
        toast.success('新增成功')
        getAllTravelStories()
        onClose()
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Axios-specific error handling
        setError(error.response?.data?.message || '发生错误，请稍后再试')
      } else {
        // Handle non-Axios errors
        setError('发生错误，请稍后再试')
      }
    } finally {
      setLoading(false) // Stop loading no matter success or fail
    }
  }

  // Update Travel Story
  const updateTravelStory = async () => {
    const storyId = storyInfo?._id
    setLoading(true) // Start loading
    try {
      let imageUrl = ''
      let postData = {
        title,
        story,
        imageUrl: storyInfo.imageUrl || '',
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
      }
      if (typeof storyImg === 'object') {
        // Upload New Image
        const imgUploadRes = await uploadImage(storyImg)
        // console.log('image', imgUploadRes)
        imageUrl = imgUploadRes.imageUrl || ''
        postData = {
          ...postData,
          imageUrl,
        }
      }
      const response = await axiosInstance.put(
        `/mine/edit-story/${storyId}`,
        postData
      )
      console.log('response---', response)
      if (response.data && response.data.success) {
        toast.success('修改成功')
        getAllTravelStories()
        onClose()
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Axios-specific error handling
        setError(error.response?.data?.message || '发生错误，请稍后再试')
      } else {
        // Handle non-Axios errors
        setError('发生错误，请稍后再试')
      }
    } finally {
      setLoading(false) // Stop loading no matter success or fail
    }
  }

  const handleAddOrUpdateClick = () => {
    console.log('Input Data:', {
      title,
      storyImg,
      story,
      visitedLocation,
      visitedDate,
    })
    if (!title) {
      setError('请输入标题')
      return
    }
    if (!story) {
      setError('请输入故事')
      return
    }
    setError('')
    if (type === 'edit') {
      updateTravelStory()
    } else {
      addNewTravelStory()
    }
  }

  // Delete story image and Update the story
  const handleDeleteStoryImg = async () => {
    // 删除图片
    const deleteImgRes = await axiosInstance.delete('/mine/delete-image', {
      params: {
        imageUrl: storyInfo?.imageUrl,
      },
    })
    if (deleteImgRes.data && deleteImgRes.data.success) {
      // 更新故事
      const postData = {
        title,
        story,
        imageUrl: '',
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
      }
      const response = await axiosInstance.put(
        `/mine/edit-story/${storyInfo?._id}`,
        postData
      )
      setStoryImg(null)
    }
  }
  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-medium text-slate-700">
          {type === 'add' ? '新增' : '更新'}
        </h5>

        <div>
          <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
            <button
              className="btn-small"
              onClick={handleAddOrUpdateClick}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-1">
                  <SpinnerIcon />
                  保存中...
                </div>
              ) : type === 'add' ? (
                <>
                  <MdAdd className="text-lg" />
                  新增笔记
                </>
              ) : (
                <>
                  <MdUpdate className="text-lg" />
                  更新笔记
                </>
              )}
            </button>
            {/* {type === 'add' ? (
              <button className="btn-small" onClick={handleAddOrUpdateClick}>
                <MdAdd className="text-lg" />
                新增笔记
              </button>
            ) : (
              <>
                <button className="btn-small" onClick={handleAddOrUpdateClick}>
                  <MdUpdate className="text-lg" />
                  更新笔记
                </button>
              </>
            )} */}

            <button className="" onClick={onClose}>
              <MdClose className="text-xl text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <div className="flex-1 flex flex-col gap-2 pt-4">
          <label className="input-label">标题</label>
          <input
            type="text"
            className="text-2xl text-slate-950 outline-none"
            placeholder="请输入"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />

          <div className="my-3">
            <DateSelector date={visitedDate} setDate={setVisitedDate} />
          </div>

          <ImageSelector
            image={storyImg}
            setImage={setStoryImg}
            handleDeleteImg={handleDeleteStoryImg}
          />

          <div className="flex flex-col gap-2 mt-4">
            <label className="input-label">故事</label>
            <textarea
              className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
              placeholder="请输入"
              rows={10}
              value={story}
              onChange={({ target }) => setStory(target.value)}
            />
          </div>

          <div className="pt-3">
            <label className="input-label">去过的地方</label>
            <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default AddEditTravelStory
