// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Import slider image
import bgImg1 from "../assets/images/carousel1.jpg";
import bgImg2 from "../assets/images/carousel2.jpg";
import bgImg3 from "../assets/images/carousel3.jpg";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Slide from "./Slide";

export default function Carousel() {
  return (
    <div className="container px-6 py-10 mx-auto">
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        <SwiperSlide>
          <Slide
            image={bgImg1}
            text="Enthusiastically scale end-to-end total linkage without technically sound methodologies. Dramatically formulate."
          />
        </SwiperSlide>

        <SwiperSlide>
          <Slide
            image={bgImg2}
            text="Intrinsicly foster efficient deliverables vis-a-vis adaptive customer service. Completely visualize tactical content."
          />
        </SwiperSlide>

        <SwiperSlide>
          <Slide
            image={bgImg3}
            text="Authoritatively matrix inexpensive leadership through parallel quality vectors. Conveniently communicate."
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
