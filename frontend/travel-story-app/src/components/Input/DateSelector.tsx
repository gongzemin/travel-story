import React, { useState } from 'react'
import { MdOutlineDateRange, MdClose } from 'react-icons/md'
import { DayPicker } from 'react-day-picker'
// import the locale object
import { zhCN } from 'react-day-picker/locale'
import moment from 'moment'

// 定义一个日期选择器组件 { date, setDate }   selected={date}
// onSelect = { setDate }
const DateSelector = ({ date, setDate }) => {
  // 定义一个状态变量，用于控制日期选择器的显示与隐藏
  const [openDatePicker, setOpenDatePicker] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <button
        className="inline-flex items-center gap-2 text-[13px] font-medium text-sky-600 bg-sky-200/40 hover:bg-sky-200/70 rounded px-2 py-1 cursor-pointer"
        onClick={() => {
          setOpenDatePicker(true)
        }}
      >
        <MdOutlineDateRange className="text-lg" />
        {date
          ? moment(date).format('YYYY-MM-DD')
          : moment().format('YYYY-MM-DD')}
      </button>

      {openDatePicker && (
        <div className="overflow-y-scroll p-5 bg-sky-50/80 rounded-lg relative pt-5">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-100 hover:bg-sky-100
           absolute top-2 right-2  cursor-pointer z-9"
            onClick={() => {
              setOpenDatePicker(false)
            }}
          >
            <MdClose className="text-xl text-sky-600" />
          </button>

          <DayPicker
            captionLayout="dropdown"
            mode="single"
            timeZone="+08:00"
            locale={zhCN}
            selected={date}
            onSelect={setDate}
            pagedNavigation
          />
        </div>
      )}
    </div>
  )
}
export default DateSelector
