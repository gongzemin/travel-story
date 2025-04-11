import React, { useState } from 'react'
import PasswordInput from '../../components/Input/PasswordInput.tsx'
import { useNavigate } from 'react-router-dom'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import LoadingSpinner from '../../components/LoadingSpinner'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const handleSignUp = async e => {
    e.preventDefault()

    if (!name) {
      setError('请输入你的名字')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Please enter a password')
      return
    }
    setError('')

    // Signup API Call
    try {
      const res = await axiosInstance.post('/create-account', {
        fullName: name,
        email,
        password,
      })

      // Handle successful login response
      if (res.data && res.data.accessToken) {
        localStorage.setItem('token', res.data.accessToken)
        navigate('/dashboard')
      }
    } catch (error) {
      setError(error?.response?.data?.message || '未知错误.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyan-50 overflow-hidden relative">
      <div className="login-ui-box right-10 -top-40" />
      <div className="login-ui-box bg-cyan-200 -bottom-40 right-1/2" />

      <div className="container flex flex-col md:flex-row items-center justify-center px-6 md:px-20 py-10 mx-auto gap-6">
        <div className="w-full md:w-1/2 h-60 md:h-[90vh] flex items-end bg-sign-bg-img bg-cover bg-center rounded-lg p-8 md:p-10 z-50 ">
          <div>
            <h4 className="text-3xl md:text-5xl text-white font-semibold leading-snug md:leading-[58px]">
              记江湖十载
            </h4>
            <p className="text-sm md:text-[15px] text-white leading-6 pr-3 md:pr-7 mt-4">
              结庐在人境，而无车马喧。
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white rounded-lg md:rounded-r-lg p-6 md:p-10 shadow-lg shadow-cyan-200/20 z-50">
          <form onSubmit={handleSignUp}>
            <h4 className="text-xl md:text-2xl font-semibold mb-6">
              遇见你真好 :)
            </h4>
            <input
              type="text"
              placeholder="用户名"
              className="input-box"
              value={name}
              onChange={({ target }) => {
                setName(target.value)
              }}
            />
            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={({ target }) => {
                setEmail(target.value)
              }}
            />
            <PasswordInput
              value={password}
              onChange={({ target }) => {
                setPassword(target.value)
              }}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
            <button type="submit" className="travel-btn-primary">
              创建账号
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">或</p>
            <button
              type="submit"
              className="travel-btn-primary travel-btn-light"
              onClick={() => {
                navigate('/signUp')
              }}
            >
              登录
            </button>
          </form>
        </div>
      </div>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[9999] flex justify-center items-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}
export default Signup
