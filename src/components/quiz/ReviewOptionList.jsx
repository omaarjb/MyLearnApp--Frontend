import ReviewOptionItem from "./ReviewOptionItem"

export default function ReviewOptionList({
  questions,
  selectedOptions
}) {
  return (
    <div className="space-y-6">
      <h4 className="font-medium text-lg">Révision des questions:</h4>
      {questions.map((question, index) => (
        <ReviewOptionItem
          key={question.id}
          question={question}
          index={index}
          selectedOptionId={selectedOptions[question.id]}
        />
      ))}
    </div>
  )
}