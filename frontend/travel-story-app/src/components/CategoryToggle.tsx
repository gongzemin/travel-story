import React from 'react'

interface CategoryToggleProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

const CategoryToggle: React.FC<CategoryToggleProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {categories.map(category => (
        <button
          key={category}
          className={`px-3 py-1 rounded-full border  transition
            ${
              selectedCategory === category
                ? 'bg-cyan-500 text-white border-cyan-500'
                : 'bg-white text-cyan-500 border-cyan-500 hover:bg-cyan-100'
            }
          `}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default CategoryToggle
