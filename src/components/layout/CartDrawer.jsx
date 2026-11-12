import { useCallback, useEffect, useRef, useState } from 'react';
import { useCarrito } from '../../features/cart/useCarrito.js';
import { STATIC_PRODUCTS } from '../../data/staticProducts.js';
import { formatPrice } from '../../utils/formatPrice.js';

function getUpsellProduct(item) {
  const product = item.product ?? item;
  const image = product.imageUrl
    ?? product.image
    ?? (Array.isArray(product.images)
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
      : '');

  return {
    id: product.externalId ?? product.id ?? product.referenceCode,
    referenceCode: product.referenceCode,
    colorCode: product.colorCode,
    nombre: product.title ?? product.nombre ?? product.name ?? 'Producto',
    imagen: image ?? '',
    imagenes: image ? [image] : [],
    precio: Number(product.discountPrice > 0 ? product.discountPrice : product.price ?? 0),
    talla: product.size ?? null,
  };
}

export default function CartDrawer() {
  const {
    items,
    cantidadTotal,
    total,
    cambiarCantidad,
    quitar,
    agregar,
    isCartOpen,
    closeCart,
    vaciar,
  } = useCarrito();
  const [paymentComplete, setPaymentComplete] = useState(false);
  const paymentConfirmationButton = useRef(null);
  const referenceCode = items.find((item) => item.referenceCode)?.referenceCode ?? '';
  const gender = items.find((item) => item.genero)?.genero;
  const recommendations = STATIC_PRODUCTS
    .filter((product) => product.referenceCode !== referenceCode && (!gender || product.genero === gender))
    .slice(0, 3)
    .map((product) => getUpsellProduct({
      ...product.detalle.product,
      ...product.detalle.products[0],
    }));

  const confirmPayment = () => {
    window.mdq = window.mdq || [];
    window.mdq.push(['track', 'Purchase', {
      revenue: total,
      quantity: cantidadTotal,
      currency: 'CRC',
    }]);
    setPaymentComplete(true);
  };

  const finishPayment = useCallback(() => {
    vaciar();
    setPaymentComplete(false);
    closeCart();
  }, [closeCart, vaciar]);

  useEffect(() => {
    if (!isCartOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        if (paymentComplete) finishPayment();
        else closeCart();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [closeCart, finishPayment, isCartOpen, paymentComplete]);

  useEffect(() => {
    if (paymentComplete) paymentConfirmationButton.current?.focus();
  }, [paymentComplete]);

  if (!isCartOpen) return null;

  return (
    <div
      className="cart-drawer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeCart();
      }}
    >
      <aside
        className="cart-drawer__panel"
        role="dialog"
        aria-modal={paymentComplete ? undefined : 'true'}
        aria-hidden={paymentComplete}
        aria-labelledby="cart-drawer-title"
      >
        <header className="cart-drawer__header">
          <h2 id="cart-drawer-title">Carrito <span>{cantidadTotal}</span></h2>
          <button type="button" className="cart-drawer__close" aria-label="Cerrar carrito" onClick={closeCart}>×</button>
        </header>
        <p className="cart-drawer__login">¿Tiene una cuenta? <a href="https://www.cachoscr.com/s/login">Inicie sesión</a> para pagar más rápido.</p>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <p>Tu carrito está vacío.</p>
              <a href="/products" onClick={closeCart}>Explorar productos</a>
            </div>
          ) : (
            <>
              <ul className="cart-drawer__items">
                {items.map((item) => (
                  <li className="cart-drawer__item" key={item.llave}>
                    {item.imagen
                      ? <img src={item.imagen} alt="" />
                      : <span className="cart-drawer__image-placeholder" aria-hidden="true" />}
                    <div className="cart-drawer__item-info">
                      <strong>{item.nombre}</strong>
                      {item.talla && <span>Talla: {item.talla}</span>}
                      <div className="cart-drawer__quantity">
                        <button type="button" aria-label={`Disminuir cantidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.llave, -1)}>−</button>
                        <output aria-label="Cantidad">{item.cantidad}</output>
                        <button type="button" aria-label={`Aumentar cantidad de ${item.nombre}`} onClick={() => cambiarCantidad(item.llave, 1)}>＋</button>
                      </div>
                    </div>
                    <div className="cart-drawer__item-end">
                      <strong>{formatPrice(item.precio)}</strong>
                      <button type="button" aria-label={`Quitar ${item.nombre} del carrito`} onClick={() => quitar(item.llave)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 3v7m4-7v7" /></svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {referenceCode && (
                <section className="cart-drawer__upsells" aria-label="Productos para sumar al pedido">
                  <h3>Sumale a tu pedido</h3>
                  {recommendations.map((product, index) => (
                    <article className="cart-drawer__upsell" key={`${product.id}-${index}`}>
                      {product.imagen
                        ? <img src={product.imagen} alt="" loading="lazy" />
                        : <span className="cart-drawer__image-placeholder" />}
                      <div><strong>{product.nombre}</strong><b>{formatPrice(product.precio)}</b></div>
                      <button type="button" onClick={() => agregar(product, product.talla)}>Agregar</button>
                    </article>
                  ))}
                </section>
              )}
            </>
          )}
        </div>

        {items.length > 0 && (
          <footer className="cart-drawer__summary">
            <p><span>Total estimado</span><strong>{formatPrice(total)}</strong></p>
            <small>Aranceles e impuestos aplicables incluidos.</small>
            <button type="button" onClick={confirmPayment}>Pagar</button>
          </footer>
        )}
      </aside>
      {paymentComplete && (
        <div className="payment-confirmation" role="presentation">
          <section
            className="payment-confirmation__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-confirmation-title"
            aria-describedby="payment-confirmation-message"
            onKeyDown={(event) => {
              if (event.key === 'Tab') {
                event.preventDefault();
                paymentConfirmationButton.current?.focus();
              }
            }}
          >
            <div className="payment-confirmation__icon" aria-hidden="true">✓</div>
            <h2 id="payment-confirmation-title">Pago completado</h2>
            <p id="payment-confirmation-message">Gracias por tu compra. Tu pedido se procesó correctamente.</p>
            <button ref={paymentConfirmationButton} type="button" onClick={finishPayment}>Continuar</button>
          </section>
        </div>
      )}
    </div>
  );
}