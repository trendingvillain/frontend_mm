import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons from Lucide React
import { MapPin, Phone, Mail, Store, Package, Sprout, X } from 'lucide-react';

// API functions imported from the second code block
import { fetchProducts, submitInquiryPublic, fetchGallery } from '../../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Add isAuthenticated as a prop
const LandingPage = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', message: '' });
  const [products, setProducts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastSuccess, setIsToastSuccess] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsResponse = await fetchProducts();
        if (productsResponse.data.success) {
          setProducts(productsResponse.data.products.slice(0, 6));
        }
        const galleryResponse = await fetchGallery();
        if (galleryResponse.data.success) {
          setGallery(galleryResponse.data.images);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await submitInquiryPublic(inquiryForm);
      if (response.data.success) {
        setToastMessage('Inquiry submitted successfully! We will contact you soon.');
        setIsToastSuccess(true);
        setInquiryForm({ name: '', phone: '', message: '' });
      }
    } catch (error) {
      setToastMessage('Error submitting inquiry. Please try again.');
      setIsToastSuccess(false);
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const handleCloseDialog = () => setSelectedImage(null);

  // New function to handle product card clicks
  const handleProductClick = (productId) => {
    if (isAuthenticated) {
      // If the user is authenticated, navigate to the product detail page
      navigate(`/products/${productId}`);
    } else {
      // Otherwise, navigate to the login page
      navigate('/login');
    }
  };

  return (
    <div className="bg-gray-100 text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-stone-900 py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Premium Bananas, Globally Delivered 🌍
              </h1>
              <p className="mt-4 text-lg md:text-xl text-stone-300">
                Connecting global markets with the finest, farm-fresh bananas. Our commitment to quality ensures every fruit is a symbol of excellence.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold px-8 py-4 rounded-xl transition-transform transform hover:scale-105"
                  onClick={() => navigate('/products')}
                >
                  Explore Our Products
                </button>
                <button
                  className="text-white border-2 border-stone-600 hover:bg-stone-800 font-medium px-8 py-4 rounded-xl transition-colors"
                  onClick={() => (window.location.href = '#contact')}
                >
                  Get a Quote
                </button>
              </div>
            </div>
            <div className="relative p-4 rounded-3xl overflow-hidden group">
              <img
                src="https://thumbs.dreamstime.com/b/banana-plantation-tenerife-canary-islands-south-171627083.jpg"
                alt="Banana farm"
                className="w-full h-80 md:h-[400px] object-cover rounded-2xl shadow-2xl transition-transform duration-500 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* Gallery Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Our Gallery
          </h2>
          {gallery.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 break-inside-avoid-column relative group cursor-pointer"
                  onClick={() => setSelectedImage(`${API_BASE_URL}${item.image_url}`)}
                >
                  <img
                    src={`${API_BASE_URL}${item.image_url}`}
                    alt="Gallery"
                    className="w-full rounded-xl object-cover transition-transform duration-300 transform group-hover:scale-105 group-hover:shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No gallery images available.</p>
          )}
        </div>
      </section>

      {/* Lightbox Dialog */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="relative max-w-4xl max-h-full overflow-y-auto">
            <button
              onClick={handleCloseDialog}
              className="absolute top-4 right-4 text-white z-50 p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition"
            >
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Full-size gallery" className="w-full h-full object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* --- */}

      {/* Product Showcase */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
            Our Premium Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer" // Add cursor-pointer class
                // Change the onClick handler to use the new function
                onClick={() => handleProductClick(product.id)}
              >
                <div className="relative w-full h-64 overflow-hidden">
                  <img
                    src={`${API_BASE_URL}${product.image_urls?.[0] || '/uploads/products/default.jpg'}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">{product.name}</h3>
                    <p className="mt-2 text-gray-600 line-clamp-3">{product.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        <Package size={16} />
                        {product.packaging}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        <Sprout size={16} />
                        {product.shelf_life} days shelf life
                      </div>
                    </div>
                  </div>
                  <button
                    className="mt-6 w-full text-gray-700 border-2 border-gray-300 hover:bg-gray-200 font-medium py-3 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the parent div's onClick from firing
                      navigate('/login');
                    }}
                  >
                    Login to Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- */}

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Contact Info */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Let's Get in Touch
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Have questions or need a custom quote? We're here to help you find the perfect export solution.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={20} className="text-yellow-500" />
                  <span className="font-medium">+91 75300 59315</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={20} className="text-yellow-500" />
                  <span className="font-medium">info@bananaexport.com</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin size={20} className="text-yellow-500 mt-1" />
                  <span className="font-medium">123 Export Street, Trade City, India</span>
                </div>
              </div>
            </div>
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Send an Inquiry</h3>
              <form onSubmit={handleInquirySubmit} className="space-y-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                />
                <textarea
                  placeholder="Your Message..."
                  required
                  rows={5}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                />
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white hover:bg-gray-700 font-bold py-4 rounded-lg transition"
                >
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* --- */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Store size={24} className="text-yellow-400 mr-2" />
                <h3 className="text-2xl font-bold tracking-tight">Banana Export Co.</h3>
              </div>
              <p className="text-gray-400">
                Your trusted partner for premium banana exports worldwide. Our quality is our promise.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Home</a></li>
                <li><a href="/products" className="hover:text-yellow-400 transition-colors">Products</a></li>
                <li><a href="/login" className="hover:text-yellow-400 transition-colors">Login</a></li>
                <li><a href="/register" className="hover:text-yellow-400 transition-colors">Register</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>123 Export Street, Trade City, India</li>
                <li>+91 75300 59315</li>
                <li>info@bananaexport.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-700 pt-8 text-center text-gray-500">
            <p>&copy; 2025 Banana Export Co. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-8 right-8 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 ${isToastSuccess ? 'bg-green-600' : 'bg-red-600'
            }`}
          style={{ opacity: showToast ? 1 : 0 }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default LandingPage;