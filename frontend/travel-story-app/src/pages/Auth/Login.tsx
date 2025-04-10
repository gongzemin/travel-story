import React, { useState } from 'react'
import PasswordInput from '../../components/Input/PasswordInput.tsx'
import { useNavigate } from 'react-router-dom'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import * as Sentry from '@sentry/react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const handleLogin = async e => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    if (!password) {
      setError('请输入密码')
      return
    }
    setError('')

    // Login API Call
    try {
      const res = await axiosInstance.post('/login', {
        email,
        password,
      })
      console.log('res---', res)

      // Handle successful login response
      if (res.data && res.data.accessToken) {
        localStorage.setItem('token', res.data.accessToken)
        navigate('/dashboard')
      }
    } catch (error) {
      Sentry.captureException(error)
      console.error('Login error:', error)
      setError(error?.response?.data?.message || '未知错误.')
    }
  }

  return (
    <div className="min-h-screen bg-cyan-50 overflow-hidden relative">
      <div className="login-ui-box right-10 -top-40" />
      <div className="login-ui-box bg-cyan-200 -bottom-40 right-1/2" />
      {/* md:rounded-r-none md:rounded-l-none */}
      <div className="container flex flex-col md:flex-row items-center justify-center px-6 md:px-20 mx-auto gap-6 py-10 ">
        <div className="w-full md:w-2/4 h-64 md:h-[90vh] flex items-end bg-login-bg-img bg-cover bg-center rounded-lg  p-6 md:p-10  mb-8 md:mb-0 z-50">
          <div>
            <h4 className="text-3xl md:text-5xl text-white font-semibold leading-snug md:leading-[58px]">
              记江湖十载
            </h4>
            <p className="text-sm md:text-[15px] text-white leading-6 mt-2 md:mt-4 pr-2 md:pr-7">
              结庐在人境，而无车马喧。
            </p>
          </div>
        </div>

        <div className="w-full md:w-2/4 bg-white rounded-lg  relative p-6 md:p-10 shadow-lg shadow-cyan-200/20 z-50">
          <form onSubmit={handleLogin}>
            <h4 className="text-xl md:text-2xl font-semibold mb-6">
              遇见你真好 :)
            </h4>
            <input
              type="text"
              placeholder="邮箱"
              className="input-box "
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
              登录
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">或</p>
            <button
              type="submit"
              className="travel-btn-primary travel-btn-light"
              onClick={() => {
                navigate('/signUp')
              }}
            >
              创建账号
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
export default Login
