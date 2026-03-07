export default function StepNavigation({ step, steps }) {
  return (
    <div className="mb-12">
      <div className="relative flex justify-between">
        {steps.map((label, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center flex-1"
          >
            {/* Line (except last step) */}
            {index < steps.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-1
                  ${
                    index < step
                      ? "bg-emerald-600"
                      : "bg-emerald-200"
                  }`}
                style={{ transform: "translateX(16px)" }}
              />
            )}

            {/* Circle */}
            <div
              className={`z-10 w-8 h-8 rounded-full flex items-center justify-center
                text-sm font-semibold transition-colors duration-300
                ${
                  index <= step
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-200 text-emerald-700"
                }`}
            >
              {index + 1}
            </div>

            {/* Label */}
            <p className="mt-3 text-sm text-center whitespace-nowrap">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
