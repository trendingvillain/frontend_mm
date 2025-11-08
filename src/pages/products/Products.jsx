import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Package, 
  Calendar, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Store,
  Shield,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <--- ADDED: Import useNavigate
import { useAuth } from '../../context/AuthContext';
import { fetchProducts } from '../../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- STANDALONE ALERT COMPONENT ---
// (Extracted from main function)
const AppAlert = ({ type, title, children, onClose, className = '' }) => {
  const alertStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconStyles = {
    success: CheckCircle,
    error: X,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = iconStyles[type];

  return (
    <div className={`border-2 p-4 rounded-none ${alertStyles[type]} ${className}`}>
      <div className="flex items-start">
        <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" /> 
        <div className="flex-grow">
          {title && (
            <h3 className="font-bold text-lg mb-1">{title}</h3>
          )}
          <div>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// --- STANDALONE BADGE COMPONENT ---
// (Extracted from main function)
const AppBadge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '',
  onClick
}) => {
  const baseStyles = 'inline-flex items-center font-bold rounded-none transition-all duration-300 border-2';
  
  const variants = {
    default: 'bg-gray-900 text-yellow-500 border-gray-900',
    success: 'bg-green-600 text-white border-green-600',
    error: 'bg-red-600 text-white border-red-600',
    warning: 'bg-yellow-600 text-white border-yellow-600',
    outline: 'bg-white text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-yellow-500'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const clickableStyles = onClick ? 'cursor-pointer hover:opacity-80' : '';

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

// --- STANDALONE LOADING SKELETON COMPONENT ---
// (Extracted from main function)
const LoadingSkeleton = ({ 
  className = "h-4 bg-gray-300 rounded animate-pulse", 
  count = 1 
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={className} />
      ))}
    </>
  );
};

// --- STANDALONE PENDING USER ALERT COMPONENT ---
// (Extracted from main function)
const PendingUserAlert = () => {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <AppAlert type="warning" className="border-yellow-600">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-yellow-600 mr-3" />
            <div>
              <strong>CLIENT ACCOUNT PENDING:</strong> Access is restricted. Please wait for administrator approval to proceed with orders.
            </div>
          </div>
        </AppAlert>
      </div>
    );
};

// --- STANDALONE SEARCH AND FILTER COMPONENT ---
const SearchAndFilter = ({ searchTerm, setSearchTerm, productTypes, selectedFilter, setSelectedFilter }) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row items-center justify-center gap-6">
      {/* Search Input */}
      <div className="relative max-w-md w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-yellow-600" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-20 transition-all duration-200"
          placeholder="Search Product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center text-gray-900 font-bold">
          <Filter className="w-4 h-4 mr-1 text-yellow-600" />
          FILTER:
        </div>
        {productTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type)}
            className={`px-3 py-1.5 border-2 font-bold text-sm transition-all duration-300 ${
              selectedFilter === type
                ? 'bg-gray-900 text-yellow-500 border-gray-900'
                : 'bg-white text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-yellow-500'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- STANDALONE PRODUCT CARD COMPONENT ---
const ProductCard = ({ product, handleProductClick, isAuthenticated }) => {
  // Determine if image URL is valid (basic check)
  const imageUrl = product.image_urls?.[0] 
    ? `${API_BASE_URL}${product.image_urls[0]}` 
    : "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg";

  return (
    <div 
        className="group bg-white border-2 border-gray-300 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-yellow-600 flex flex-col min-h-[500px]"
        onClick={() => handleProductClick(product.id)}
    >
      {/* Product Image */}
      <div className="h-56 overflow-hidden border-b border-gray-200">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg";
          }}
        />
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-grow p-6 bg-gray-50">
        <h3 className="text-xl font-black text-gray-900 mb-2 uppercase group-hover:text-yellow-600 transition-colors duration-300">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm italic mb-4 flex-grow">
          {product.description || 'Rich taste, long shelf life, and export-ready packaging built for international journeys.'}
        </p>

        {/* Product Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center px-2 py-1 bg-white border-2 border-gray-900 text-gray-900 text-xs font-bold">
            <Package className="w-3 h-3 mr-1 text-yellow-600" />
            {product.packaging.toUpperCase()}
          </div>
          <div className="flex items-center px-2 py-1 bg-white border-2 border-gray-900 text-gray-900 text-xs font-bold">
            <Calendar className="w-3 h-3 mr-1 text-yellow-600" />
            {product.shelf_life} DAYS
          </div>
        </div>

        {/* Stock Information */}
        <div className="flex justify-between items-center mb-4 pt-3 border-t border-dashed border-gray-400">
          <span className="text-gray-900 font-bold text-sm uppercase">
            Stock: {product.available_stock} {product.packaging ? 'Units' : 'Pieces'}
          </span>
          <AppBadge 
            variant={product.is_active ? 'success' : 'error'} 
            size="sm"
          >
            <div className="flex items-center gap-1">
              {product.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {product.is_active ? 'ONLINE' : 'OFFLINE'}
            </div>
          </AppBadge>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleProductClick(product.id);
          }}
          disabled={!isAuthenticated || !product.is_active}
          className={`w-full py-3 font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            isAuthenticated && product.is_active
              ? 'bg-gray-900 text-white hover:bg-yellow-600 hover:text-gray-900'
              : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          }`}
        >
          <Eye className="w-4 h-4" />
          {isAuthenticated ? 'VIEW SPECIFICATIONS' : 'LOGIN TO ACCESS'}
        </button>
      </div>
    </div>
  );
};


// --- MAIN PRODUCTS COMPONENT ---
const Products = () => {
  // --- Initialization ---
  const navigate = useNavigate(); // <--- ADDED: Initialize useNavigate
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchProducts();
        if (response.data.success && response.data.products) {
          setProducts(response.data.products);
        } else {
          setError('Failed to fetch products.');
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError('An error occurred while loading products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const productTypes = useMemo(() => {
    const types = new Set(products.map(p => p.packaging).filter(Boolean));
    return ['All', ...Array.from(types)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    let result = products;

    if (selectedFilter !== 'All') {
      result = result.filter(product => product.packaging === selectedFilter);
    }

    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    return result;
  }, [searchTerm, selectedFilter, products]);

  // --- FIX: Updated handleProductClick to use useNavigate ---
  const handleProductClick = (productId) => {
    if (!isAuthenticated) {
      // Navigate to login if not authenticated
      navigate('/login'); 
    } else {
      // Navigate to product details page
      navigate(`/products/${productId}`); 
    }
  };
  // --------------------------------------------------------

  // Product Grid Component
  const ProductGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white border-2 border-gray-300 shadow-lg min-h-[500px]">
              <LoadingSkeleton className="h-56 bg-gray-300" />
              <div className="p-6 space-y-4">
                <LoadingSkeleton className="h-6 bg-gray-300 w-3/4" />
                <LoadingSkeleton className="h-4 bg-gray-300 w-full" count={2} />
                <div className="flex gap-2">
                  <LoadingSkeleton className="h-8 bg-gray-300 w-20" />
                  <LoadingSkeleton className="h-8 bg-gray-300 w-24" />
                </div>
                <LoadingSkeleton className="h-12 bg-gray-300 w-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="text-center py-20">
          <Store className="w-20 h-20 text-yellow-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 mb-4">NO MATCHES FOUND</h2>
          <p className="text-gray-600 text-lg">
            {searchTerm 
              ? 'Try adjusting your search terms or filter settings.' 
              : 'New supply protocols are being uploaded. Check next cycle.'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            handleProductClick={handleProductClick} // Pass down the handler
            isAuthenticated={isAuthenticated}     // Pass down auth state
          />
        ))}
      </div>
    );
  };


  // Main render logic
  if (user?.status === 'pending') {
    return <PendingUserAlert />;
  }

  return (
    <div className="bg-white py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 uppercase mb-4">
            THE OFFICIAL EXPORT CATALOGUE
          </h1>
          <div className="w-32 h-1 bg-yellow-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Sivanthi offers certified, high-grade banana varieties. Review specifications and initiate procurement.
          </p>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            productTypes={productTypes}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-8">
            <AppAlert type="error">
              <strong>ERROR:</strong> {error}
            </AppAlert>
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid />
      </div>
    </div>
  );
};

export default Products;
