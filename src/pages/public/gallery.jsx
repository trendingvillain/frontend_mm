import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import axios from 'axios';

// Replace this with your actual API base URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);

  // Fetch gallery data on component mount
  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery`);
      if (response.data.success) {
        setGallery(response.data.images);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    let timer;
    if (autoSlide && gallery.length > 0) {
      timer = setInterval(() => {
        setSelectedImageIndex((prevIndex) =>
          prevIndex === gallery.length - 1 ? 0 : prevIndex + 1
        );
      }, 10000); // Change image every 10 seconds
    }
    return () => clearInterval(timer);
  }, [selectedImageIndex, autoSlide, gallery.length]);

  const handleNext = () => {
    setAutoSlide(false); // Stop auto-slide on manual navigation
    setSelectedImageIndex((prevIndex) =>
      prevIndex === gallery.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setAutoSlide(false); // Stop auto-slide on manual navigation
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? gallery.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
          Our Gallery
        </h2>

        {gallery.length > 0 ? (
          <div className="relative flex items-center justify-center">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="z-10 absolute left-4 text-white p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-300"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Main Image */}
            <div className="relative w-[640px] h-[480px] sm:w-500 sm:h-500">
              <img
                src={`${API_BASE_URL}${gallery[selectedImageIndex].image_url}`}
                alt="Gallery"
                className="w-full h-full rounded-xl object-cover"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="z-10 absolute right-4 text-white p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-300"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No gallery images available.
          </p>
        )}
      </div>
    </section>
  );
};

export default Gallery;
