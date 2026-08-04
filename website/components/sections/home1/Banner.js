"use client";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import getImageUrl from "@/components/utils/getImageUrl";

export default function Banner({ HomeSlides }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";
  console.log(HomeSlides);

  return (
    <section className="banner-section p_relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        spaceBetween={0}
        autoplay={{
          delay: 500000,
          disableOnInteraction: false,
        }}
        pagination={false}
        dir="ltr"
        loop
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onSwiper={(swiper) => {
          setTimeout(() => {
            if (
              swiper.params.navigation &&
              typeof swiper.params.navigation !== "boolean"
            ) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;

              swiper.navigation.destroy();
              swiper.navigation.init();
              swiper.navigation.update();
            }
          });
        }}
        className="banner-carousel no-banner-pagination"
      >
        {HomeSlides?.map((slide, idx) => (
          <SwiperSlide key={idx} className="slide-item p_relative">
            <div
              className="image-layer"
              style={{
                backgroundImage: `url(${getImageUrl(slide.imageUrl)})`,
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation */}
      <div className="banner-nav">
        <div className="banner-prev" ref={prevRef}>
          {lang === "ar" ? (
            <i className="fas fa-chevron-right"></i>
          ) : (
            <i className="fas fa-chevron-left"></i>
          )}
        </div>
        <div className="banner-next" ref={nextRef}>
          {lang === "ar" ? (
            <i className="fas fa-chevron-left"></i>
          ) : (
            <i className="fas fa-chevron-right"></i>
          )}
        </div>
      </div>
    </section>
  );
}
