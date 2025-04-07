import React, { FC, ChangeEvent, useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'

interface PasswordInputProps {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

const PasswordInput: FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [isShowPassword, setIsShowPassword] = useState(false)

  const toggleShowPassoword = () => {
    setIsShowPassword(!isShowPassword)
  }

  return (
    <div className="flex items-center bg-cyan-600/5 px-5 rounded mb-3">
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Password'}
        type={isShowPassword ? 'text' : 'password'}
        className="w-full text-sm bg-transparent py-3 mr-3 rounded outline-none"
      />
      {isShowPassword ? (
        <FaRegEye
          size={22}
          className="text-cyan-600 cursor-pointer"
          onClick={() => toggleShowPassoword()}
        />
      ) : (
        <FaRegEyeSlash
          size={22}
          className="text-slate-400 cursor-pointer"
          onClick={() => toggleShowPassoword()}
        />
      )}
    </div>
  )
}

export default PasswordInput
