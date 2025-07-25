import { InspirationResponse } from "@/services/tacoService";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import cn from "@/lib/cn";

import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";

import "swiper/css";
import { useRef } from "react";
type Props = {
  className?: string;
};
export default function InspirationCarousel({ className }: Props) {
  const { data: inspiration, error } = useQuery({
    refetchOnWindowFocus: false,
    refetchInterval: false,
    queryKey: ["inspiration"],
    queryFn: async () => {
      const res = await fetch("/api/food/inspiration");
      return res.json();
    },
    staleTime: Infinity,
  });

  const swiperRef = useRef<SwiperRef>(null);
  if (error) return <div>Failed to load</div>;
  if (!inspiration) return <div>Loading...</div>;

  return (
    <div className={cn("", className)}>
      <h2 className="text-2xl font-light text-center mb-4">
        Need some inspiration?
      </h2>
      <div className="relative">
        <Swiper
          ref={swiperRef}
          slidesPerView={3}
          breakpoints={{
            0: {
              slidesPerView: 1.5,
            },
            640: {
              slidesPerView: 3,
            },
          }}
          spaceBetween={30}
          className="flex h-full !-mx-8 !pl-8 sm:!mx-0 sm:!pl-0"
          loop
        >
          {inspiration.map((inspo: InspirationResponse) => (
            <SwiperSlide key={inspo.id} className="!h-auto flex">
              <Link
                href={`/recipe/${inspo.recipe.uuid}`}
                className="flex flex-col justify-center hover:bg-slate-50 border border-slate-300 p-4 h-full rounded"
              >
                <p className="italic text-base text-slate-700">
                  with {inspo.query}:
                </p>
                <h3 className="font-bold">{inspo.title}</h3>
                <p className="my-2">
                  {inspo.ingredients ? "✅" : "❌"} {inspo.verdict}
                </p>
                <span className="mt-auto block text-center text-sm rounded-full border border-amber-600 text-amber-700 px-4 py-2 cursor-pointer bg-white hover:bg-amber-600 focus:bg-amber-600 hover:text-white focus:text-white transition-colors">
                  get the recipe →
                </span>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="hidden sm:flex justify-between -left-9 -right-9 top-1/2 -translate-y-1/2 absolute">
          <button
            type="button"
            onClick={() => swiperRef.current?.swiper.slidePrev()}
            className="w-8 h-8 hover:bg-slate-100 cursor-pointer rounded-full transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.swiper.slideNext()}
            className="w-8 h-8 hover:bg-slate-100 cursor-pointer rounded-full transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
