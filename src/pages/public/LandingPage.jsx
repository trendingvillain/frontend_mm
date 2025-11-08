import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Package,
  Sprout,
  Truck,
  Ship,
  Plane,
  X 
} from 'lucide-react';
import { fetchProducts, submitInquiryPublic, fetchGallery } from '../../config/api';
import logo from './../../logo.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
        setToastMessage('✅ Thank you! Your inquiry is confirmed. Our export team will reach out shortly.');
        setIsToastSuccess(true);
        setInquiryForm({ name: '', phone: '', message: '' });
      } else {
         setToastMessage('⚠️ Submission failed. Please check your network and try again.');
         setIsToastSuccess(false);
      }
    } catch (error) {
      setToastMessage('⚠️ Something went wrong. Please try again in a moment.');
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

  const handleCloseDialog = () => setSelectedImage(null);

  return (
    <div className="bg-white text-gray-900 font-serif">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900 py-20 md:py-48 text-center shadow-2xl">
        <div className="container mx-auto px-4">
          
          <p className="text-lg sm:text-xl font-medium text-amber-600 mb-4 tracking-widest uppercase">
            Sivanthi Banana Export – Where Quality Meets the World
          </p>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
            Your Gold Standard in Global Banana Exports
          </h1>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg mb-8 sm:mb-10">
            Delivering Freshness Across Continents
          </h1>

          <p className="mt-6 text-base sm:text-xl text-gray-400 max-w-3xl mx-auto px-2">
            Harvested in Thoothukudi, India – Our bananas meet the world’s strictest export benchmarks, <br/>
            shipped with care and commitment to your market.
          </p>
          
          <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <button
              className="bg-amber-600 text-gray-900 hover:bg-amber-700 font-bold px-8 py-3 sm:px-12 sm:py-4 rounded-none shadow-lg transition-all transform hover:scale-105 uppercase text-sm sm:text-base tracking-widest border-2 border-amber-600"
              onClick={() => navigate('/products')}
            >
              Explore Premium Varieties
            </button>
            <button
              className="text-white border-2 border-gray-700 hover:bg-gray-700 font-bold px-8 py-3 sm:px-12 sm:py-4 rounded-none transition-colors uppercase text-sm sm:text-base tracking-widest"
              onClick={() => (window.location.href = '#contact')}
            >
              Secure Your Shipment
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-white py-20 md:py-36">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-center mb-4 text-gray-900 tracking-tight">
            Our Premier Banana Selection
          </h2>
          <div className='w-24 h-1 bg-amber-600 mx-auto mb-12 md:mb-16'></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10">
            {products.map((product) => (
              <div key={product.id} className="col-span-1">
                <div
                  className="bg-white overflow-hidden rounded-none shadow-sm transition-all duration-300 transform hover:shadow-xl hover:-translate-y-0.5 cursor-pointer h-full flex flex-col border border-gray-200"
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Image */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
                    <img
                      src={`${API_BASE_URL}${product.image_urls?.[0] || '/uploads/products/default.jpg'}`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{product.name.toUpperCase()}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                       Rich taste, long shelf life, and export-ready packaging built for international journeys.
                    </p>
                    
                    {/* Tags/Details */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs sm:text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-1 text-gray-600"><Package size={14} /> {product.packaging}</div>
                      <div className="flex items-center gap-1 text-gray-600"><Sprout size={14} /> {product.shelf_life} days</div>
                    </div>
                    
                    <button
                      className="mt-6 w-full text-gray-900 bg-white border border-gray-900 hover:bg-gray-900 hover:text-white font-bold py-3 rounded-none transition-colors text-sm"
                      onClick={() => handleProductClick(product.id)}
                    >
                      View Export Specs
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12 sm:mt-16">
            <button
              className="text-gray-900 border-b border-gray-900 hover:text-amber-600 hover:border-amber-600 font-bold px-4 py-2 transition-colors uppercase tracking-widest text-sm sm:text-base"
              onClick={() => navigate('/products')}
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Delivery Section - Cleaned and Refined Content */}
      <section className="bg-gray-900 py-20 md:py-36 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Logistics of Excellence
          </h2>
          <div className='w-24 h-1 bg-amber-600 mx-auto mb-12 md:mb-16'></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {/* ROAD FREIGHT */}
            <div className="p-6 sm:p-8 rounded-none border border-gray-700 hover:border-amber-600 transition-colors duration-500">
              <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600 mx-auto mb-4 sm:mb-6 p-2 bg-gray-800 rounded-none" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2">ROAD FREIGHT</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Field to Quay: Precision-timed inland transfer ensures your cargo moves from our packing centers to the port loading dock swiftly and securely.
              </p>
            </div>
            {/* SEA FREIGHT */}
            <div className="p-6 sm:p-8 rounded-none border border-gray-700 hover:border-amber-600 transition-colors duration-500">
              <Ship className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600 mx-auto mb-4 sm:mb-6 p-2 bg-gray-800 rounded-none" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2">SEA FREIGHT</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Vessel Expertise: Dedicated global routing through Thoothukudi Harbour / VOC Port, offering high-volume, reliable solutions tailored to international shipping timelines.
              </p>
            </div>
            {/* AIR CARGO */}
            <div className="p-6 sm:p-8 rounded-none border border-gray-700 hover:border-amber-600 transition-colors duration-500">
              <Plane className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600 mx-auto mb-4 sm:mb-6 p-2 bg-gray-800 rounded-none" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2">AIR CARGO</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Expedited Service: Priority air movement via Thiruvananthapuram International Airport for premium orders and critical schedules where rapid transit is non-negotiable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-white py-20 md:py-36">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-center mb-4 text-gray-900 tracking-tight">
            Behind the Export – Our Operations
          </h2>
          <div className='w-24 h-1 bg-amber-600 mx-auto mb-12 md:mb-16'></div>
          
          {gallery.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 break-inside-avoid-column relative group cursor-pointer overflow-hidden shadow-sm"
                  onClick={() => setSelectedImage(`${API_BASE_URL}${item.image_url}`)}
                >
                  <img
                    src={`${API_BASE_URL}${item.image_url}`}
                    alt="Gallery"
                    className="w-full object-cover transition-transform duration-500 transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gray-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">A glimpse into our precision supply chain is on its way. Stay tuned.</p>
          )}
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 p-4 backdrop-blur-sm">
          <div className="relative max-w-full max-h-full overflow-y-auto">
            <button
              onClick={handleCloseDialog}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white z-50 p-2 sm:p-3 rounded-none bg-gray-800/80 hover:bg-gray-800 transition border-b-2 border-amber-600"
            >
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Selected" className="rounded-none shadow-2xl max-h-[90vh] w-auto max-w-full mx-auto border-4 border-amber-600/50" />
          </div>
        </div>
      )}

      {/* Contact Section - Cleaned and Refined Content */}
      <section id="contact" className="py-20 md:py-36 bg-gray-900">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Contact Info Block */}
          <div className="p-2 sm:p-4 text-white">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-amber-600 tracking-wider">
              Start Your Global Partnership Today
            </h2>
            <p className="text-base sm:text-lg text-gray-400 mb-8 sm:mb-10 border-l-4 border-amber-600 pl-4">
              Every client is paired with a dedicated export specialist to handle requirements, pricing, and smooth delivery – your success is our standard.
            </p>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-4 text-white text-sm sm:text-base">
                <Phone size={20} className="text-amber-600 flex-shrink-0" />
                <span className="font-semibold">+91 75300 59315</span>
              </div>
              <div className="flex items-center gap-4 text-white text-sm sm:text-base">
                <Mail size={20} className="text-amber-600 flex-shrink-0" />
                <span className="font-semibold">sivanthibananaexports@gmail.com</span>
              </div>
              <div className="flex items-start gap-4 text-white text-sm sm:text-base">
                <MapPin size={20} className="text-amber-600 mt-1 flex-shrink-0" />
                <span className="font-semibold">Mukkani, Thoothukudi, 628151, India</span>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="bg-white p-6 sm:p-10 rounded-none shadow-2xl border-t-8 border-amber-600">
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">Request an Export Quote</h3>
            <form onSubmit={handleInquirySubmit} className="space-y-4 sm:space-y-6">
              <input type="text" placeholder="Your Name / Company" required className="w-full p-3 sm:p-4 border border-gray-300 rounded-none focus:outline-none focus:ring-4 focus:ring-amber-100 transition duration-300 text-sm sm:text-base"
                value={inquiryForm.name} onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })} />
              <input type="tel" placeholder="Phone Number" required className="w-full p-3 sm:p-4 border border-gray-300 rounded-none focus:outline-none focus:ring-4 focus:ring-amber-100 transition duration-300 text-sm sm:text-base"
                value={inquiryForm.phone} onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })} />
              <textarea placeholder="Your Message (Specify product, quantity, and destination)" required rows={5} className="w-full p-3 sm:p-4 border border-gray-300 rounded-none focus:outline-none focus:ring-4 focus:ring-amber-100 transition duration-300 text-sm sm:text-base"
                value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} />
              <button type="submit" className="w-full bg-gray-900 text-white hover:bg-amber-600 hover:text-gray-900 font-bold py-3 sm:py-4 rounded-none transition shadow-lg uppercase tracking-wider text-sm sm:text-base">
                Send Your Inquiry Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer - Final Layout & Content */}
      <footer className="bg-gray-900 text-white py-10 border-t-4 border-amber-600">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          
          {/* Company Info & Contact - Combined for hierarchy (Col 1/2) */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center">
              <img src={logo} alt="Sivanthi Banana Export Logo" className="w-10 h-10 mr-3 filter brightness-200" />
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600">SIVANTHI.</h3>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">The standard for quality, consistency, and global export management.</p>
             <div className="pt-2">
                <h4 className="text-lg sm:text-xl font-bold mb-2 text-amber-600">CONTACT</h4>
                <ul className="space-y-1 text-gray-300 text-sm sm:text-base">
                    <li>+91 75300 59315</li>
                    <li>sivanthibananaexports@gmail.com</li>
                    <li>Mukkani, Thoothukudi, India</li>
                </ul>
            </div>
          </div>
          
          {/* Links (Col 3) */}
          <div>
            <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-amber-600">LINKS</h4>
            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li><a href="/" className="hover:text-amber-600 transition-colors">Home</a></li>
              <li><a href="/products" className="hover:text-amber-600 transition-colors">Products</a></li>
              {isAuthenticated ? (
                <>
                  <li><a href="/orders" className="hover:text-amber-600 transition-colors">Orders</a></li>
                  <li><a href="/profile" className="hover:text-amber-600 transition-colors">Profile</a></li>
                </>
              ) : (
                <>
                  <li><a href="/login" className="hover:text-amber-600 transition-colors">Exclusive Client Access</a></li>
                  <li><a href="/register" className="hover:text-amber-600 transition-colors">Join Our Export Network</a></li>
                </>
              )}
            </ul>
          </div>
          
          {/* Empty column (Col 4) - Re-purpose as Quick Info */}
          <div>
             <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-amber-600">QUICK LINKS</h4>
             <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li><a href="#contact" className="hover:text-amber-600 transition-colors">Get a Quote</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-500 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} Sivanthi Banana Export. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Toast */}
      {showToast && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-none shadow-2xl font-semibold text-white transition-all duration-500 ease-out transform ${isToastSuccess ? 'bg-green-600' : 'bg-red-600'} animate-toast-in`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
