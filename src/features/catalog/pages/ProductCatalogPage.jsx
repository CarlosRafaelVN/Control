import { formatearPrecio } from '../normalizeProduct.js';
import { STATIC_PRODUCTS } from '../../../data/staticProducts.js';
import '../catalog.css';

export default function ProductCatalogPage() {
  if (STATIC_PRODUCTS.length === 0) return <p className="estado">No se encontraron productos.</p>;

  return (
    <main className="catalogo">
      <h1>Calzado ({STATIC_PRODUCTS.length})</h1>
      <div className="grilla">
        {STATIC_PRODUCTS.map((product) => {
          return (
            <article className="tarjeta" key={product.id}>
              {product.imagenes[0] && (
                <img src={product.imagenes[0]} alt={product.nombre} loading="lazy" />
              )}
              <h2>{product.nombre}</h2>
              {product.precio !== null && <p className="precio">{formatearPrecio(product.precio)}</p>}
              <p className="descripcion">{product.descripcion || 'Sin descripción'}</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}