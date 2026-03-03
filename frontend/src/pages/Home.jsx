import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSlider from '../components/home/HeroSlider';
import FeaturedCategories from '../components/home/FeaturedCategories';
import ProductCarousel from '../components/home/ProductCarousel';
import SkincareRoutine from '../components/home/SkincareRoutine';
import TestimonialsSlider from '../components/home/TestimonialsSlider';
import NewsletterSection from '../components/home/NewsletterSection';
import { productService, categoryService } from '../services/api';

const Home = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (location.pathname === '/') window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    mountedRef.current = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          productService.list({ per_page: 8, sort: 'rating' }),
          categoryService.list(),
        ]);

        if (!mountedRef.current) return;

        const rawProducts = productsRes?.data ?? productsRes;
        const productsArray = Array.isArray(rawProducts) ? rawProducts : [];
        const mappedProducts = productsArray.map((p) => ({
          ...p,
          image: p.images?.find((img) => img.is_main)?.image_url || p.images?.[0]?.image_url,
          imageHover: p.images?.[1]?.image_url,
          category: p.category?.name,
          rating: p.rating != null ? Number(p.rating) : 4.5,
          reviews: p.reviews_count ?? 0,
        }));

        const rawCategories = Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data ?? [];
        const rootCategories = rawCategories.filter((c) => !c.parent_id);
        const mappedCategories = rootCategories.map((cat) => ({
          ...cat,
          count: cat.products_count ?? 0,
        }));

        setProducts(mappedProducts);
        setCategories(mappedCategories);
      } catch (err) {
        if (mountedRef.current) {
          console.error('Error fetching home data:', err);
          setProducts([]);
          setCategories([]);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="page-enter">
      <HeroSlider />

      <FeaturedCategories categories={categories} loading={loading} />

      <ProductCarousel
        products={products}
        loading={loading}
        title="Les Essentiels Éveline"
        subtitle="Nos best-sellers plébiscités par nos clientes"
      />

      <SkincareRoutine />

      <TestimonialsSlider />

      <NewsletterSection />
    </div>
  );
};

export default Home;
