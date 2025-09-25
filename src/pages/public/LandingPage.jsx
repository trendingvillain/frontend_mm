import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Package, Sprout, Truck, Ship, Plane, ChevronRight, ChevronLeft } from 'lucide-react';
import { fetchProducts, submitInquiryPublic, fetchGallery } from '../../config/api';
import Gallery from './gallery';
import logo from './../../logo.png';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LandingPage = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', message: '' });
  const [products, setProducts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastSuccess, setIsToastSuccess] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsResponse = await fetchProducts();
        if (productsResponse.data.success) {
          setProducts(productsResponse.data.products);
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
        setToastMessage('✅ Inquiry submitted successfully! We will contact you soon.');
        setIsToastSuccess(true);
        setInquiryForm({ name: '', phone: '', message: '' });
      }
    } catch (error) {
      setToastMessage('❌ Error submitting inquiry. Please try again.');
      setIsToastSuccess(false);
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const handleProductClick = (productId) => {
    if (isAuthenticated) {
      navigate(`/products/${productId}`);
    } else {
      navigate('/login');
    }
  };

  // Custom Arrow Components
  const NextArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10 cursor-pointer p-2 rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors"
      onClick={onClick}
    >
      <ChevronRight className="text-white" />
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10 cursor-pointer p-2 rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors"
      onClick={onClick}
    >
      <ChevronLeft className="text-white" />
    </div>
  );

  // Slick Slider Settings for Products
  const productSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, nextArrow: <NextArrow />, prevArrow: <PrevArrow /> } },
      { breakpoint: 600, settings: { slidesToShow: 1, nextArrow: <NextArrow />, prevArrow: <PrevArrow /> } },
    ],
  };

  // Slick Slider Settings for Gallery
  const gallerySliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, nextArrow: <NextArrow />, prevArrow: <PrevArrow /> } },
      { breakpoint: 600, settings: { slidesToShow: 2, nextArrow: <NextArrow />, prevArrow: <PrevArrow /> } },
    ],
  };

  return (
    <div className="bg-gray-100 text-gray-900">
      {/* 1. Hero Section: The Hook */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-stone-900 py-24 md:py-32">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              From Thoothukudi to the World 🌍 <br />
              Premium Bananas for Global Markets
            </h1>
            <p className="mt-4 text-lg md:text-xl text-stone-300">
              Direct from our farms to your business. Export-quality bananas with guaranteed freshness and excellence in every shipment.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold px-8 py-4 rounded-xl transition-transform transform hover:scale-105"
                onClick={() => navigate('/products')}
              >
                Explore Products
              </button>
              <button
                className="text-white border-2 border-stone-600 hover:bg-stone-800 font-medium px-8 py-4 rounded-xl transition-colors"
                onClick={() => (window.location.href = '#contact')}
              >
                Request a Quote
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
      </section>

      {/* 2. About Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Story: Rooted in Trust, Growing Globally
            </h2>
            <p className="text-lg text-gray-600">
              Sivanthi Banana Export is more than a business – it’s a legacy. Rooted in the fertile lands of **Thoothukudi, India**, we work directly with farmers to deliver bananas of unmatched freshness and quality.
            </p>
            <p className="text-lg text-gray-600 mt-4">
              Every shipment reflects our commitment to excellence, ensuring that businesses worldwide receive bananas that meet global export standards.
            </p>
          </div>
          <div className="relative p-4 rounded-3xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1574226516831-e1dff42a4943?q=80&w=1740&auto=format&fit=crop"
              alt="Workers on banana farm"
              className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-xl transition-transform duration-500 transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* 3. Products Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">Our Premium Products</h2>
          <Slider {...productSliderSettings}>
            {products.map((product) => (
              <div key={product.id} className="p-2">
                <div
                  className="bg-gray-50 overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="relative w-full h-64 overflow-hidden">
                    <img
                      src={`${API_BASE_URL}${product.image_urls?.[0] || '/uploads/products/default.jpg'}`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-gray-900">{product.name}</h3>
                    <p className="mt-2 text-gray-600 line-clamp-3">{product.description}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-1"><Package size={16} /> {product.packaging}</div>
                      <div className="flex items-center gap-1"><Sprout size={16} /> {product.shelf_life} days</div>
                    </div>
                    <button
                      className="mt-6 w-full text-gray-700 border-2 border-gray-300 hover:bg-gray-200 font-medium py-3 rounded-lg"
                      onClick={(e) => { e.stopPropagation(); handleProductClick(product.id); }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* 4. Delivery & Transport Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">Flexible Delivery & Transport</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            We offer multiple, reliable transport options to meet your business needs, ensuring our bananas arrive fresh and on time, anywhere in the world.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <Truck className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Road Transport</h3>
              <p className="text-gray-600 mt-2">Efficient road delivery from Tiruchendur farms to major hubs.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <Ship className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Sea Transport</h3>
              <p className="text-gray-600 mt-2">Global shipments handled via Thoothukudi Harbour / Port.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <Plane className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Air Cargo</h3>
              <p className="text-gray-600 mt-2">Quick exports for urgent deliveries via Thiruvananthapuram International Airport.</p>
            </div>
          </div>
          <p className="mt-8 text-gray-600 max-w-2xl mx-auto">
            Customers may choose their preferred mode of transport. We handle all logistics, from packaging to delivery coordination, while shipping and payments are managed directly by the customer.
          </p>
        </div>
      </section>

      {/* 5. Gallery: The Proof */}
      <Gallery gallery={gallery} />

      {/* 6. Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Get in Touch</h2>
            <p className="text-lg text-gray-600 mb-8">Have questions or need a custom quote? We’re here to help your business grow.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700"><Phone size={20} className="text-yellow-500" /> <span className="font-medium">+91 75300 59315</span></div>
              <div className="flex items-center gap-3 text-gray-700"><Mail size={20} className="text-yellow-500" /> <span className="font-medium">sivanthibananaexports@gmail.com</span></div>
              <div className="flex items-start gap-3 text-gray-700"><MapPin size={20} className="text-yellow-500 mt-1" /> <span className="font-medium">Sivanthi Banana Export,<br />Arun Lodge, Mukkani,<br />Thoothukudi, 628151</span></div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Send an Inquiry</h3>
            <form onSubmit={handleInquirySubmit} className="space-y-6">
              <input type="text" placeholder="Your Name" required className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={inquiryForm.name} onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })} />
              <input type="tel" placeholder="Phone Number" required className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={inquiryForm.phone} onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })} />
              <textarea placeholder="Your Message..." required rows={5} className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} />
              <button type="submit" className="w-full bg-gray-900 text-white hover:bg-gray-700 font-bold py-4 rounded-lg transition">Send Inquiry</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src={logo} alt="Sivanthi Banana Export Logo" className="w-10 h-10 mr-2" />
              <h3 className="text-2xl font-bold">Sivanthi Banana Export</h3>
            </div>
            <p className="text-gray-400">Your trusted partner for premium banana exports worldwide. Freshness and quality you can rely on.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-yellow-400">Home</a></li>
              <li><a href="/products" className="hover:text-yellow-400">Products</a></li>
              {isAuthenticated ? (
                <>
                  <li><a href="/orders" className="hover:text-yellow-400">Orders</a></li>
                  <li><a href="/cart" className="hover:text-yellow-400">Cart</a></li>
                  <li><a href="/profile" className="hover:text-yellow-400">Profile</a></li>
                  <li><a href="/inquiry" className="hover:text-yellow-400">Inquiries</a></li>
                </>
              ) : (
                <>
                  <li><a href="/login" className="hover:text-yellow-400">Login</a></li>
                  <li><a href="/register" className="hover:text-yellow-400">Register</a></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Sivanthi Banana Export,<br />Arun Lodge, Mukkani,<br />Thoothukudi - 628151</li>
              <li>+91 75300 59315</li>
              <li>sivanthibananaexports@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-700 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Sivanthi Banana Export. All rights reserved.</p>
        </div>
      </footer>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 ${isToastSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
