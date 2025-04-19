"use client"

import { AnimatePresence } from "framer-motion"
import OptionItem from "./OptionItem"

export default function OptionList({
  options,
  selectedOptionId,
  onOptionSelect,
  colorScheme = "purple",
  disabled = false
}) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {options.map((option) => (
          <OptionItem
            key={option.id}
            option={option}
            isSelected={selectedOptionId === option.id}
            onSelect={onOptionSelect}
            colorScheme={colorScheme}
            disabled={disabled}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}