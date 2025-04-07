import React from 'react'
import moment from 'moment'
import { MdOutlineClose } from 'react-icons/md'

const filterInfoTitle = ({ filterType, filterDates, onClear }) => {
  const DateRangeChip = ({ date }) => {
    const startDate = date?.from
      ? moment(date?.from).format('YYYY-MM-DD')
      : 'N/A'
    const endDate = date?.to ? moment(date?.to).format('YYYY-MM-DD') : 'N/A'

    return (
      <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded">
        <p className="text-xs font-medium">
          {startDate} - {endDate}
        </p>
        <button onClick={onClear} className="cursor-pointer">
          <MdOutlineClose className="text-slate-500 text-sm" />
        </button>
      </div>
    )
  }
  return (
    filterType && (
      <div className="mb-5">
        {filterType === 'search' ? (
          <h3 className="text-lg font-medium">查询结果</h3>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">查询日期范围</h3>
            <DateRangeChip date={filterDates} />
          </div>
        )}
      </div>
    )
  )
}
export default filterInfoTitle
