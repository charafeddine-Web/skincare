import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HeroVideo from '../components/home/HeroVideo';
import TrustStrip from '../components/home/TrustStrip';
import FeaturedCategories from '../components/home/FeaturedCategories';
import ProductCarousel from '../components/home/ProductCarousel';
import EditorialBlock from '../components/home/EditorialBlock';
import VideoSection from '../components/home/VideoSection';
import VisualSection from '../components/home/VisualSection';
import SkincareRoutine from '../components/home/SkincareRoutine';
import TestimonialsSlider from '../components/home/TestimonialsSlider';
import NewsletterSection from '../components/home/NewsletterSection';
import { HOME_IMAGES } from '../components/home/homeMedia';
import { getCachedHomeData, fetchHomeData } from '../services/homeDataCache';

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

    // Affichage immédiat si cache frais (évite 5–6 s d'attente)
    const cached = getCachedHomeData();
    if (cached?.products?.length !== undefined && cached?.categories?.length !== undefined) {
      setProducts(cached.products);
      setCategories(cached.categories);
      setLoading(false);
    }

    // Toujours refetch : une requête (Promise.all) pour tout mettre à jour + remplir le cache
    fetchHomeData()
      .then(({ products: p, categories: c }) => {
        if (!mountedRef.current) return;
        setProducts(p);
        setCategories(c);
        setLoading(false);
      })
      .catch((err) => {
        if (mountedRef.current) {
          console.error('Error fetching home data:', err);
          setProducts([]);
          setCategories([]);
          setLoading(false);
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="page-enter">
      <HeroVideo />

      <div className="home-flow home-flow--trust">
        <TrustStrip />
      </div>

      <div className="home-flow home-flow--categories">
        <FeaturedCategories categories={categories} loading={loading} />
      </div>

      <div className="home-flow home-flow--carousel">
        <ProductCarousel
          products={products}
          loading={loading}
          title="Les Essentiels"
          subtitle="Nos best-sellers plébiscités par nos clientes"
        />
      </div>

      <div className="home-flow home-flow--editorial1">
        <EditorialBlock
          image={HOME_IMAGES.womanFlowers}
          imageSide="left"
          tag="Notre univers"
          title="La beauté naturelle à l'honneur"
          excerpt="Fleurs, feuilles et formules douces. Chaque soin est pensé pour révéler l'éclat de votre peau sans la brusquer."
          ctaLabel="Découvrir la gamme"
          ctaHref="/shop"
        />
      </div>

      <div className="home-flow home-flow--video">
        <VideoSection />
      </div>

      <div className="home-flow home-flow--editorial2">
        <EditorialBlock
          image={HOME_IMAGES.heroRadiance}
          imageSide="right"
          tag="Rituel"
          title="Un moment rien qu'à vous"
          excerpt="L'application d'un soin est un instant de pause. Texture fondante, parfum délicat, résultats visibles."
          ctaLabel="Voir les soins visage"
          ctaHref="/shop"
          accent="var(--action)"
        />
      </div>

      <div className="home-flow home-flow--visual">
        <VisualSection />
      </div>

      <div className="home-flow home-flow--routine">
        <SkincareRoutine />
      </div>

      <div className="home-flow home-flow--testimonials">
        <TestimonialsSlider />
      </div>

      <div className="home-flow home-flow--newsletter">
        <NewsletterSection />
      </div>
    </div>
  );
};

export default Home;
