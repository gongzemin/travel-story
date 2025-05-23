import { getInitials } from '../../utils/helper'

const ProfileInfo = ({ userInfo, onLogout }) => {
  return (
    userInfo && (
      <div className="flex items-center gap-3">
        {userInfo.password && (
          <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
            {getInitials(userInfo ? userInfo.fullName : '')}
          </div>
        )}
        <div className="flex flex-col">
          <p className="text-sm font-medium">{userInfo.fullName || ''}</p>
          {userInfo.password && (
            <button
              className="text-sm text-slate-700 underline"
              onClick={onLogout}
            >
              退出登录
            </button>
          )}
        </div>
      </div>
    )
  )
}
export default ProfileInfo
