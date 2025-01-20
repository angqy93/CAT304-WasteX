import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import Pic1 from 'public/images/Pic1.jpg';
import Pic2 from 'public/images/Pic2.jpg';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useEffect } from "react";
import A05 from 'aos';

export default function Hero() {
  useEffect(() => {
    A05.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: false,
      mirror: false,
    });
}, []);

return (
    <section id="hero-slider" className='hero-slider'>
        <div className="container-md" data-aos="fade-in">
            <div className="row">
                <div className="col-12">
                    <Swiper>
                        
                    </Swiper>
                </div>
            </div>
        </div>
    </section>
)
}