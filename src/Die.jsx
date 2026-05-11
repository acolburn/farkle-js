export default function Die({ value, isLocked, isSelected, onSelect }) {
  return (
    <button
      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-md shadow-md flex items-center justify-center overflow-hidden ${
        isLocked ? "opacity-60 cursor-not-allowed" : ""
      }`}
      aria-label={`Die ${value}`}
      onClick={isLocked ? undefined : onSelect}
      disabled={isLocked}
    >
      <img
        // src={
        //   isLocked
        //     ? `die${value}Locked.png`
        //     : isSelected
        //       ? `die${value}Held.png`
        //       : `die${value}.png`
        // }
        src={isSelected ? `die${value}Held.png` : `die${value}.png`}
        alt={`Die face ${value}`}
        className="w-full h-full object-cover pointer-events-none"
      />
    </button>
  );
}
