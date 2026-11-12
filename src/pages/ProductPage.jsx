import { useEffect, useMemo, useRef, useState } from 'react';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import SiteFooter from '../components/layout/SiteFooter.jsx';
import WhatsAppLink from '../components/layout/WhatsAppLink.jsx';
import { useCarrito } from '../features/cart/useCarrito.js';
import { STATIC_PRODUCT_DETAILS } from '../data/staticProducts.js';
import { formatPrice } from '../utils/formatPrice.js';

const SIZE_SYSTEMS = ['US', 'EU', 'CM'];
const RECENT_PRODUCTS_KEY = 'cachos-recent-products';

function readRecentProducts() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(RECENT_PRODUCTS_KEY) ?? '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function plainText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function imageUrl(product) {
  if (typeof product?.imageUrl === 'string') return product.imageUrl;
  if (typeof product?.image === 'string') return product.image;
  const firstImage = Array.isArray(product?.images) ? product.images[0] : null;
  return typeof firstImage === 'string' ? firstImage : firstImage?.url ?? '';
}

function ProductGallery({ productName, images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!images.length) {
    return <div className="product-gallery__empty">No hay imágenes para este producto.</div>;
  }

  const selectImage = (index) => {
    setActiveIndex((index + images.length) % images.length);
  };

  return (
    <div className="product-gallery">
      <div className="product-gallery__thumbnails" aria-label="Imágenes del producto">
        {images.map((image, index) => (
          <button
            className={`product-gallery__thumbnail${index === activeIndex ? ' is-active' : ''}`}
            key={image.url}
            type="button"
            aria-label={`Ver imagen ${index + 1} de ${images.length}`}
            aria-pressed={index === activeIndex}
            onClick={() => selectImage(index)}
          >
            <img src={image.url} alt={`${productName}, vista ${index + 1}`} />
          </button>
        ))}
      </div>

      <div className="product-gallery__stage">
        <button
          className="product-gallery__zoom"
          type="button"
          aria-label="Ampliar imagen del producto"
          onClick={() => setZoomed(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5M10.8 7.5v6.6M7.5 10.8h6.6" /></svg>
        </button>
        <button
          className="product-gallery__arrow product-gallery__arrow--previous"
          type="button"
          aria-label="Imagen anterior"
          onClick={() => selectImage(activeIndex - 1)}
        >
          ‹
        </button>
        <img
          className="product-gallery__main-image"
          src={images[activeIndex].url}
          alt={productName}
        />
        <button
          className="product-gallery__arrow product-gallery__arrow--next"
          type="button"
          aria-label="Imagen siguiente"
          onClick={() => selectImage(activeIndex + 1)}
        >
          ›
        </button>
      </div>

      {zoomed && (
        <div className="product-gallery__lightbox" role="dialog" aria-modal="true" aria-label={`Imagen ampliada: ${productName}`}>
          <button type="button" aria-label="Cerrar imagen ampliada" onClick={() => setZoomed(false)}>×</button>
          <img src={images[activeIndex].url} alt={productName} />
        </div>
      )}
    </div>
  );
}

function TrustMarks() {
  return (
    <div className="product-trust">
      <p><span aria-hidden="true">♧</span> Envío a todo el país en 2 a 5 días hábiles <span aria-hidden="true">♙</span> Pago seguro</p>
      <p><span aria-hidden="true">◇</span> Cambios fáciles con el producto en su empaque</p>
      <div className="product-trust__marks" aria-label="Métodos de pago">
        <b>VISA</b><b className="product-trust__mastercard">●●</b><b>AMEX</b><b className="product-trust__emma">emma</b><b className="product-trust__zunify">Z</b><b>▥</b><b className="product-trust__credix">credix</b>
      </div>
    </div>
  );
}

function VansBrandStory({ product, image }) {
  if (!String(product?.brand ?? '').toLowerCase().includes('vans')) return null;

  const highlights = [
    ['01', 'ADN skate', 'Creados en California para skaters y adoptados por la música, el arte y la calle.'],
    ['02', 'Agarre de goma', 'Suelas inspiradas en su clásica waffle, pensadas para dar agarre y control.'],
    ['03', 'Hechos para el uso diario', 'Materiales resistentes que aguantan el ritmo de todos los días.'],
    ['04', 'Off The Wall', 'Una marca ligada a la creatividad y a la expresión personal desde su origen.'],
  ];

  return (
    <section className="vans-story" aria-labelledby="vans-story-title">
      <header className="vans-story__heading">
        <span>Desde 1966 · California</span>
        <h2 id="vans-story-title">Lo que tienen todos los <strong>Vans</strong></h2>
        <p>Off The Wall: nacidos en el skate.</p>
      </header>
      <div className="vans-story__content">
        <div className="vans-story__highlights">
          {highlights.slice(0, 2).map(([number, title, description]) => (
            <article className="vans-story__card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <div className="vans-story__product">
          {image && <img src={image} alt={product.title ?? 'Calzado Vans'} loading="lazy" />}
          <strong>{product.model || product.title || 'Vans'}</strong>
        </div>
        <div className="vans-story__highlights">
          {highlights.slice(2).map(([number, title, description]) => (
            <article className="vans-story__card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedProducts({ items, loading, error }) {
  return (
    <section className="related-products" aria-labelledby="related-products-title">
      <h2 id="related-products-title">Productos relacionados</h2>
      {loading && <p className="product-muted" role="status">Cargando productos relacionados…</p>}
      {error && <p className="product-inline-error" role="alert">{error}</p>}
      {!loading && !error && !items.length && (
        <p className="product-muted">No hay productos relacionados disponibles por ahora.</p>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="related-products__grid">
          {items.map((item, index) => {
            const product = item.product ?? item;
            const reference = product.referenceCode;
            const color = product.colorCode;
            const href = reference && color
              ? `/product?${new URLSearchParams({ referenceCode: reference, colorCode: color })}`
              : '';
            const title = product.title ?? product.name ?? 'Producto recomendado';
            const image = imageUrl(product);
            const price = product.discountPrice > 0 ? product.discountPrice : product.price;
            const content = (
              <>
                <div className="related-products__image">
                  {image && <img src={image} alt={title} loading="lazy" />}
                </div>
                <h3>{title}</h3>
                {price != null && <strong>{formatPrice(price)}</strong>}
              </>
            );

            return (
              <article className="related-products__card" key={`${reference ?? title}-${color ?? index}`}>
                {href ? <a href={href}>{content}</a> : <div>{content}</div>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RecentProducts({ items, onAdd }) {
  const trackRef = useRef(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollControls = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollPrevious(track.scrollLeft > 0);
    setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollControls();
  }, [items.length]);

  const scroll = (direction) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <section className="recent-products" aria-labelledby="recent-products-title">
      <div className="recent-products__heading">
        <h2 id="recent-products-title">Vistos recientemente</h2>
        {items.length > 1 && (
          <div className="recent-products__controls">
            <button type="button" aria-label="Productos anteriores" disabled={!canScrollPrevious} onClick={() => scroll(-1)}>‹</button>
            <button type="button" aria-label="Productos siguientes" disabled={!canScrollNext} onClick={() => scroll(1)}>›</button>
          </div>
        )}
      </div>
      <div className="recent-products__track" ref={trackRef} onScroll={updateScrollControls}>
        {items.map((product) => {
          const discount = Number(product.price) > 0 && Number(product.discountPrice) > 0
            && Number(product.discountPrice) < Number(product.price);
          const discountPercent = discount
            ? Math.round((1 - Number(product.discountPrice) / Number(product.price)) * 100)
            : 0;
          const href = `/product?${new URLSearchParams({
            referenceCode: product.referenceCode,
            colorCode: product.colorCode,
          })}`;

          return (
            <article className="recent-product" key={`${product.referenceCode}-${product.colorCode}`}>
              <a className="recent-product__link" href={href}>
                <div className="recent-product__image">
                  {discount && <span className="recent-product__discount">-{discountPercent}%</span>}
                  {product.image && <img src={product.image} alt={product.title} loading="lazy" />}
                </div>
                <h3>{product.title}</h3>
                <div className="recent-product__prices">
                  <strong>{formatPrice(discount ? product.discountPrice : product.price)}</strong>
                  {discount && <del>{formatPrice(product.price)}</del>}
                </div>
              </a>
              <button
                className="recent-product__add"
                type="button"
                aria-label={`Agregar ${product.title} al carrito`}
                onClick={() => onAdd(product)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /><path d="M12 12v5m-2.5-2.5h5" /></svg>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProductHelp({ productName }) {
  const message = encodeURIComponent(`Hola, tengo una consulta sobre ${productName}.`);

  return (
    <section className="product-help" aria-label="Ayuda sobre el producto">
      <a className="product-help__card" href={`https://wa.me/50660651818?text=${message}`} target="_blank" rel="noreferrer">
        <span>
          <strong>¿Dudas con este producto?</strong>
          <span>Escribinos por WhatsApp 6065-1818</span>
        </span>
        <span className="product-help__arrow" aria-hidden="true">→</span>
      </a>
      <a className="product-help__card" href={/* https://www.cachoscr.com/s/store-locations */ undefined} target="_blank" rel="noreferrer">
        <span>
          <strong>Probalo en tienda</strong>
          <span>Mirá nuestros puntos de venta</span>
        </span>
        <span className="product-help__arrow" aria-hidden="true">→</span>
      </a>
    </section>
  );
}

function RecommendationList({ items, loading, error, onAdd }) {
  if (loading) return <p className="product-muted">Cargando recomendaciones…</p>;
  if (error) return <p className="product-inline-error">{error}</p>;
  if (!items.length) return <p className="product-muted">No hay recomendaciones disponibles por ahora.</p>;

  return (
    <div className="product-recommendations">
      {items.map((item, index) => {
        const product = item.product ?? item;
        const image = imageUrl(product);
        return (
          <article className="product-recommendation" key={`${product.referenceCode}-${product.colorCode}-${index}`}>
            <img src={image} alt={product.title ?? 'Producto recomendado'} loading="lazy" />
            <div>
              <h4>{product.title}</h4>
              <strong>{formatPrice(product.discountPrice > 0 ? product.discountPrice : product.price)}</strong>
            </div>
            <button type="button" onClick={() => onAdd(product)}>Agregar</button>
          </article>
        );
      })}
    </div>
  );
}

export default function ProductPage() {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const referenceCode = query.get('referenceCode') ?? '';
  const initialColorCode = query.get('colorCode') ?? '';
  const missingProductCode = !referenceCode || !initialColorCode;
  const initialProduct = STATIC_PRODUCT_DETAILS.find(
    (item) => item.referenceCode === referenceCode && item.colorCode === initialColorCode,
  );
  const [colorCode, setColorCode] = useState(initialColorCode);
  const [detail, setDetail] = useState(initialProduct?.detalle ?? null);
  const [selectedSize, setSelectedSize] = useState(() => {
    const firstAvailable = initialProduct?.detalle.products.find((item) => item.stock > 0);
    return firstAvailable ? String(firstAvailable.externalId) : '';
  });
  const [sizeSystem, setSizeSystem] = useState('US');
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [recentProducts] = useState(readRecentProducts);
  const { agregar } = useCarrito();
  const loading = false;
  const error = !missingProductCode && !detail
    ? 'No encontramos este producto en el catálogo estático.'
    : '';

  const products = useMemo(
    () => (detail?.products ?? []).map((item) => ({
      ...detail.product,
      ...item,
    })),
    [detail],
  );
  const product = products[0];
  const selectedProduct = products.find((item) => String(item.externalId) === selectedSize) ?? product;
  const productName = product?.title ?? 'Detalle del producto';
  const images = useMemo(
    () => {
      const selectedColorProduct = STATIC_PRODUCT_DETAILS.find(
        (item) => item.referenceCode === referenceCode && item.colorCode === colorCode,
      );
      return (selectedColorProduct?.imagenes ?? []).map((url, position) => ({ url, position }));
    },
    [colorCode, referenceCode],
  );
  const colors = STATIC_PRODUCT_DETAILS
    .filter((item) => item.referenceCode === referenceCode)
    .map((item) => ({
      colorCode: item.colorCode,
      color: item.detalle.product.color ?? item.colorCode,
      imageUrl: item.imagenes[0],
      outOfStock: item.detalle.products.every((variant) => variant.stock <= 0),
    }));
  const sizes = products.filter((item) => item.size);
  if (referenceCode === '10VSOLDSKOOL' && !sizes.some((item) => item.size === '10.50')) {
    sizes.push({
      externalId: 'unavailable-size-10.50',
      size: '10.50',
      style: '44 EUR',
      customValueA: '28.5 cm',
      stock: 0,
      availabilityStatus: 'out_of_stock',
    });
  }
  const displayedPrice = selectedProduct?.discountPrice > 0
    ? selectedProduct.discountPrice
    : selectedProduct?.price;
  const description = plainText(product?.htmlDescription);
  const recommendations = STATIC_PRODUCT_DETAILS
    .filter((item) => item.genero === product?.gender && item.id !== `${referenceCode}-${colorCode}`)
    .slice(0, 4)
    .map((item) => ({
      ...item.detalle.product,
      ...item.detalle.products[0],
    }));
  const recommendationsLoading = false;
  const recommendationsError = '';

  const recentItems = useMemo(() => {
    if (!product || !selectedProduct || !images.length) return recentProducts;
    const currentProduct = {
      referenceCode,
      colorCode,
      title: productName,
      image: images[0].url,
      imageUrl: images[0].url,
      price: selectedProduct.price,
      discountPrice: selectedProduct.discountPrice,
      externalId: selectedProduct.externalId,
      size: selectedProduct.size,
    };
    return [
      currentProduct,
      ...recentProducts.filter(
        (item) => item.referenceCode !== referenceCode || item.colorCode !== colorCode,
      ),
    ].slice(0, 12);
  }, [colorCode, images, product, productName, recentProducts, referenceCode, selectedProduct]);

  useEffect(() => {
    if (!product || !selectedProduct || !images.length) return;
    try {
      window.localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(recentItems));
    } catch {
      // The current product remains visible even when browser storage is unavailable.
    }
  }, [images, product, recentItems, selectedProduct]);

  const changeColor = (nextColorCode) => {
    const nextProduct = STATIC_PRODUCT_DETAILS.find(
      (item) => item.referenceCode === referenceCode && item.colorCode === nextColorCode,
    );
    if (!nextProduct) return;

    setDetail(nextProduct.detalle);
    const firstAvailable = nextProduct.detalle.products.find((item) => item.stock > 0);
    setSelectedSize(firstAvailable ? String(firstAvailable.externalId) : '');
    setQuantity(1);
    setColorCode(nextColorCode);
    const nextQuery = new URLSearchParams(window.location.search);
    nextQuery.set('colorCode', nextColorCode);
    window.history.replaceState(null, '', `${window.location.pathname}?${nextQuery.toString()}`);
  };

  const addToCart = (item = selectedProduct) => {
    if (!item) return;
    const cartProduct = {
      id: item.externalId ?? item.referenceCode,
      nombre: item.title,
      imagenes: [imageUrl(item) || images[0]?.url].filter(Boolean),
      precio: item.discountPrice > 0 ? item.discountPrice : item.price,
    };
    const count = item === selectedProduct ? quantity : 1;
    for (let index = 0; index < count; index += 1) {
      agregar(cartProduct, item.size ?? null);
    }
    setFeedback(`${item.title} se agregó${count > 1 ? ` (${count})` : ''} al carrito.`);
  };

  const formatSize = (item) => {
    if (sizeSystem === 'EU') {
      const europeanSize = String(item.style ?? '').replace(/\s*EUR$/i, '').trim();
      return europeanSize ? `${europeanSize} EUR` : '—';
    }
    if (sizeSystem === 'CM') {
      const centimeterSize = String(item.customValueA ?? '').replace(/\s*cm$/i, '').trim();
      return centimeterSize ? `${centimeterSize} cm` : '—';
    }
    return item.size;
  };

  return (
    <div id="top" className="product-page">
      <SiteHeader />
      <main className="product-page__layout">
        <section className="product-page__gallery" aria-label="Galería del producto">
          {!loading && !error && <ProductGallery key={`${referenceCode}-${colorCode}`} productName={productName} images={images} />}
        </section>

        <section className="product-page__details" aria-label="Información del producto">
          <nav className="product-breadcrumbs" aria-label="Ruta de navegación">
            <a href="/">Inicio</a><span>›</span><a href="/catalog">Catálogo</a><span>›</span><span>{productName}</span>
          </nav>

          {loading && <p className="product-page__state" role="status">Cargando información del producto…</p>}
          {(missingProductCode || error) && (
            <div className="product-page__error" role="alert">
              <p>{missingProductCode ? 'Falta el código del producto o del color en el enlace.' : error}</p>
              {!missingProductCode && <button type="button" onClick={() => window.location.reload()}>Volver a intentar</button>}
            </div>
          )}

          {!loading && !missingProductCode && !error && product && (
            <>
              <header className="product-summary">
                <h1>{productName}</h1>
                <p>ref: {referenceCode} <span>·</span> color: {colorCode}</p>
                <strong className="product-summary__price">{formatPrice(displayedPrice)}</strong>
              </header>

              <section className="product-colors" aria-label="Colores disponibles">
                <h2>Color: <span>{selectedProduct?.color ?? product.color}</span></h2>
                <div className="product-colors__options">
                  {colors.map((color) => (
                    <button
                      className={`product-colors__option${color.colorCode === colorCode ? ' is-active' : ''}`}
                      key={color.colorCode}
                      type="button"
                      aria-label={`${color.color}${color.outOfStock ? ', agotado' : ''}`}
                      aria-pressed={color.colorCode === colorCode}
                      disabled={color.outOfStock}
                      onClick={() => changeColor(color.colorCode)}
                    >
                      <img src={color.imageUrl} alt="" loading="eager" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="product-sizes" aria-label="Seleccionar talla">
                <div className="product-sizes__heading">
                  <h2>Tallas:</h2>
                  <div className="product-sizes__systems" role="group" aria-label="Sistema de tallas">
                    {SIZE_SYSTEMS.map((system) => (
                      <button
                        key={system}
                        type="button"
                        className={system === sizeSystem ? 'is-active' : ''}
                        aria-pressed={system === sizeSystem}
                        onClick={() => setSizeSystem(system)}
                      >
                        Tallas {system}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="product-sizes__options">
                  {sizes.map((item) => {
                    const outOfStock = item.stock <= 0 || item.availabilityStatus === 'out_of_stock';
                    return (
                      <span
                        className={`product-size-option${outOfStock ? ' is-unavailable' : ''}`}
                        key={item.externalId}
                        title={outOfStock ? 'Agotado' : undefined}
                      >
                        <button
                          className={`${String(item.externalId) === selectedSize ? 'is-active' : ''}${outOfStock ? ' is-unavailable' : ''}`}
                          type="button"
                          disabled={outOfStock}
                          aria-label={`${formatSize(item)}${outOfStock ? ', agotada' : ''}`}
                          aria-pressed={String(item.externalId) === selectedSize}
                          onClick={() => {
                            setSelectedSize(String(item.externalId));
                            setQuantity(1);
                          }}
                        >
                          {formatSize(item)}
                        </button>
                      </span>
                    );
                  })}
                </div>
              </section>

              <section className="product-quantity" aria-label="Cantidad">
                <h2>Cantidad:</h2>
                <div>
                  <button type="button" aria-label="Disminuir cantidad" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                  <output>{quantity}</output>
                  <button type="button" aria-label="Aumentar cantidad" disabled={quantity >= Number(selectedProduct?.stock ?? 1)} onClick={() => setQuantity((value) => value + 1)}>＋</button>
                </div>
              </section>

              <div className="product-actions">
                <button className="product-actions__add" type="button" onClick={() => addToCart()}>
                  <span aria-hidden="true">♧</span> Agregar
                </button>
                <button
                  className={`product-actions__favorite${favorite ? ' is-active' : ''}`}
                  type="button"
                  aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  aria-pressed={favorite}
                  onClick={() => setFavorite((value) => !value)}
                >
                  {favorite ? '♥' : '♡'}
                </button>
                <button className="product-actions__buy" type="button" onClick={() => addToCart()}>
                  Comprar ahora
                </button>
              </div>
              {feedback && <p className="product-feedback" role="status">{feedback}</p>}

              <TrustMarks />
              <section className="product-locations">
                <p className="product-locations__status">
                  <span aria-hidden="true">✓</span>
                  <strong>Disponibilidad en tiendas no incluida en esta ficha estática.</strong>
                </p>
              </section>

              <div className="product-accordions">
                <details>
                  <summary>Descripción <span aria-hidden="true">＋</span></summary>
                  <p>{description || 'No hay una descripción disponible para este producto.'}</p>
                </details>
                <details>
                  <summary>Características <span aria-hidden="true">＋</span></summary>
                  <dl>
                    <div><dt>Marca</dt><dd>{product.brand}</dd></div>
                    <div><dt>Modelo</dt><dd>{product.model}</dd></div>
                    <div><dt>Color</dt><dd>{selectedProduct?.color ?? product.color}</dd></div>
                    <div><dt>Género</dt><dd>{product.gender}</dd></div>
                  </dl>
                </details>
              </div>

              <section className="product-look">
                <h2>Completá tu look</h2>
                <RecommendationList
                  items={recommendations}
                  loading={recommendationsLoading}
                  error={recommendationsError}
                  onAdd={addToCart}
                />
              </section>

              <section className="product-share" aria-label="Compartir producto">
                <strong>Compartir</strong>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer">Facebook</a>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${productName} ${window.location.href}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
              </section>
            </>
          )}
        </section>
      </main>
      {!loading && !error && product && <VansBrandStory product={product} image={images[0]?.url} />}
      {!loading && !error && product && (
        <RelatedProducts items={recommendations} loading={recommendationsLoading} error={recommendationsError} />
      )}
      {!loading && !error && product && <RecentProducts items={recentItems} onAdd={addToCart} />}
      {!loading && !error && product && <ProductHelp productName={productName} />}
      <SiteFooter />
      <WhatsAppLink />
    </div>
  );
}