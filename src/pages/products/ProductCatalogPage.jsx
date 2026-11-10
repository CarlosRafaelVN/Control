import { useEffect, useMemo, useState } from 'react';
import SiteFooter from '../../components/layout/SiteFooter.jsx';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import WhatsAppLink from '../../components/layout/WhatsAppLink.jsx';
import CatalogBreadcrumb from './components/CatalogBreadcrumb.jsx';
import CatalogFilters from './components/CatalogFilters.jsx';
import CategoryExplorer, { catalogCategories } from './components/CategoryExplorer.jsx';
import CatalogPromotions from './components/CatalogPromotions.jsx';
import ProductCard from './components/ProductCard.jsx';
import { STATIC_PRODUCTS } from '../../data/staticProducts.js';
import '../../features/catalog/catalog.css';


export default function ProductCatalogPage() {
  const catalogParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(() => catalogParams.get('brand') || '');
  const [category, setCategory] = useState(() => catalogParams.get('category') || '');
  const [offersOnly, setOffersOnly] = useState(() => catalogParams.has('offers'));
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevance');
  const [size, setSize] = useState('');
  const [gender, setGender] = useState(() => catalogParams.get('gender') || (catalogParams.get('category') === 'Niños' ? 'ninos' : ''));
  const [visibleCount, setVisibleCount] = useState(16);
  const products = STATIC_PRODUCTS;

  const filteredProducts = useMemo(() => STATIC_PRODUCTS.filter((product) => {
    const brandMatch = !query || String(product.marca || '').toUpperCase() === query.toUpperCase();
    const sizeMatch = !size || product.tallas.some((item) => String(item) === String(size));
    const normalizeGender = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const productGender = normalizeGender(typeof product.genero === 'object' ? product.genero?.name ?? '' : product.genero);
    const genderMatch = !gender || productGender === normalizeGender(gender);
    const categoryDefinition = catalogCategories.find((item) => item.name === category);
    const categoryFamilies = categoryDefinition?.families ?? (categoryDefinition?.family ? [categoryDefinition.family] : []);
    const family = String(product.crudo?.family || '').toUpperCase();
    const categoryText = `${product.nombre} ${product.descripcion}`.toUpperCase();
    const categoryMatch = !categoryDefinition || categoryFamilies.some((item) => family.includes(item) || categoryText.includes(item));
    const offerMatch = !offersOnly || Boolean(product.precioOriginal);
    const text = `${product.nombre} ${product.marca || ''}`.toLowerCase();
    return brandMatch && sizeMatch && genderMatch && categoryMatch && offerMatch && (!search || text.includes(search.toLowerCase()));
  }).sort((a, b) => {
    if (sort === 'name') return a.nombre.localeCompare(b.nombre);
    if (sort === 'price-low') return (a.precio ?? 0) - (b.precio ?? 0);
    if (sort === 'price-high') return (b.precio ?? 0) - (a.precio ?? 0);
    return 0;
  }), [query, search, sort, size, gender, category, offersOnly]);

  useEffect(() => {
    setVisibleCount(16);
  }, [query, search, sort, size, gender, category, offersOnly]);

  const chooseBrand = (brand) => {
    setQuery(brand);
    const url = brand ? `/products?brand=${encodeURIComponent(brand)}` : '/products';
    window.history.replaceState({}, '', url);
  };

  const resetFilters = () => {
    setQuery('');
    setSize('');
    setGender('');
    setCategory('');
    setOffersOnly(false);
    setSort('relevance');
    window.history.replaceState({}, '', '/products');
  };

  return (
    <div className="min-h-screen bg-white text-black antialiased">
      <SiteHeader />
      <main>
        <CatalogPromotions />
        <CategoryExplorer />
        <section className="products-page">
          <CatalogBreadcrumb brand={query} />
          <CatalogFilters
            brand={query}
            setBrand={chooseBrand}
            sort={sort}
            setSort={setSort}
            size={size}
            setSize={setSize}
            gender={gender}
            setGender={setGender}
            products={products}
            resetFilters={resetFilters}
          />
          <div className="products-results" aria-live="polite">
            {filteredProducts.length === 0 && <div className="products-state">No encontramos productos con estos filtros.</div>}
            <div className="products-grid">
              {filteredProducts.slice(0, visibleCount).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
            {filteredProducts.length > 0 && (
              <div className="catalog-pagination">
                <p className="catalog-pagination__count" aria-live="polite">
                  Mostrando {Math.min(visibleCount, filteredProducts.length)} de {filteredProducts.length}
                </p>
                <div className="catalog-pagination__progress" role="progressbar" aria-label="Productos mostrados" aria-valuemin="0" aria-valuemax={filteredProducts.length} aria-valuenow={Math.min(visibleCount, filteredProducts.length)}>
                  <span style={{ width: `${Math.min(100, (Math.min(visibleCount, filteredProducts.length) / filteredProducts.length) * 100)}%` }} />
                </div>
                {visibleCount < filteredProducts.length && (
                  <button type="button" className="catalog-pagination__more" onClick={() => setVisibleCount((current) => current + 16)}>
                    Mostrar más <span aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsAppLink />
    </div>
  );
}
