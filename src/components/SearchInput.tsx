import { useEffect, useRef, useState } from "react";

const terms = [
  "pancakes",
  "lasagna",
  "cookies",
  "sushi",
  "hamburger",
  "soup",
  "rainbows",
];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchInput({ value, onChange }: Props) {
  const [index, setIndex] = useState(0);
  const [focus, setFocus] = useState(false);
  const placeholder = terms[index];
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (focus) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      intervalRef.current = setInterval(() => {
        setIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % terms.length;
          return newIndex;
        });
      }, 3000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [focus]);

  return (
    <div className="w-full relative">
      <label
        htmlFor="food"
        className={`truncate max-w-full italic pointer absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 text-3xl px-8`}
      >
        {!focus && !value ? (
          <>
            {`try`}{" "}
            <span key={placeholder} className="animate-fade-in-up">
              &quot;{placeholder}&quot;
            </span>
          </>
        ) : (
          <span className="sr-only">Search</span>
        )}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={(e) => {
          if (!e.target.value.trim()) {
            setFocus(false);
          }
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            setFocus(false);
            e.currentTarget.blur();
          }
        }}
        className="w-full border border-amber-600 grow rounded-l-full p-2 px-8 text-3xl h-14 focus:outline-0 focus:border-amber-800"
        type="text"
        name="food"
        id="food"
      />
    </div>
  );
}
