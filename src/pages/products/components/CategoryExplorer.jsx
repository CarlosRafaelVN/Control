import { useState } from 'react';

export const catalogCategories = [
  {
    name: 'Tenis',
    family: 'TENIS',
    image: 'https://cms.blumewebsites.com/cachosasociacion/products/10NBM1906REHD-HARBOR GREY/10NBM1906R_EHD-HARBOR GREY_1.webp?v=a937751c282b4da391d1d19bb0452cb9',
  },
  {
    name: 'Zapatos y botas',
    families: ['BOTAS', 'ZAPATOS'],
    image: 'https://cms.blumewebsites.com/cachosasociacion/products/20TM10001214-BROWN/20TM10001_214-BROWN_1.jpg?v=73e53aacd33c4fea8cd6e4939bcc0965',
  },
  {
    name: 'Sandalias',
    families: ['SANDALIA', 'SANDALIAS'],
    image: 'https://cms.blumewebsites.com/cachos/products/30BI51793BLACK/30BI51793_BLACK_1.jpg?v=133193301656768161',
  },
  {
    name: 'Mochilas y bolsos',
    families: ['MOCHILA', 'MALETIN', 'BOLSO'],
    image: 'https://cms.blumewebsites.com/cachosasociacion/products/75QSEQYBA03202GRT0-FOREST/75QSEQYBA03202_GRT0-FOREST_1.jpg?v=619d1dad5e364de8878923e6a96ed6d5',
  },
  {
    name: 'Gorras',
    families: ['GORRA', 'HEADWEAR'],
    image: 'https://cms.blumewebsites.com/cachosasociacion/products/70QSEQYHA03506KVJ0-BLACK/70QSEQYHA03506_KVJ0-BLACK_1.jpg?v=619d1dad5e364de8878923e6a96ed6d5',
  },
  {
    name: 'Medias',
    families: ['MEDIA', 'MEDIAS'],
    image: 'https://cms.blumewebsites.com/cachosasociacion/products/71STMW0523VARIOS/71STMW0523_VARIOS_1.webp?v=134133330838306833',
  },
  {
    name: 'Vasos y botellas',
    families: ['VASO', 'BOTELLA', 'TAZA', 'PORTALATA'],
    image: 'https://cms.blumewebsites.com/cachosasociacion/products/81NWSXW16GREEN/81NWSXW16_GREEN_1.png?v=75f79290c6324900bde4ce52fc8e99d3',
  },
  {
    name: 'Billeteras',
    families: ['BILLETERA'],
    image: 'https://cms.blumewebsites.com/cachosasociacion/products/73QSAQYAA03358CTF0-JAVA/73QSAQYAA03358_CTF0-JAVA_1.jpg?v=76dd6f42b15c487d8d80fd546cdd47a9',
  },
  {
    name: 'Ropa',
    families: ['ROPA', 'ABRIGOS'],
    image: 'https://cms.blumewebsites.com/cachosasociacion/products/57ELMELYJK00269FBK-FLINT BLACK/57ELMELYJK00269_FBK-FLINT BLACK_1.jpg?v=9d39f3195bb64e2f9e9859bc02eb345c',
  },
];

function CategoryImage({ src, name }) {
  const [failed, setFailed] = useState(false);
  const [processedSrc, setProcessedSrc] = useState('');

  if (!src || failed) {
    return (
      <svg className="catalog-category__fallback" viewBox="0 0 24 24" role="img" aria-label={`Imagen de ${name} no disponible`}>
        <path d="M4 19V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm4.5-8.5 2.7 2.7 3.8-4.7 4 5.5H5l3.5-3.5Z" />
      </svg>
    );
  }

  const removeImageBackground = (event) => {
    const image = event.currentTarget;
    if (processedSrc || image.naturalWidth === 0) return;

    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 480 / image.naturalWidth);
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      console.error(`No se pudo preparar la imagen de la categoría ${name}.`);
      return;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    const width = canvas.width;
    const height = canvas.height;
    const cornerIndices = [0, width - 1, (height - 1) * width, height * width - 1];
    const backgroundColors = cornerIndices
      .map((index) => {
        const offset = index * 4;
        return data[offset + 3] > 10
          ? [data[offset], data[offset + 1], data[offset + 2]]
          : null;
      })
      .filter(Boolean);

    if (!backgroundColors.length) return;

    const visited = new Uint8Array(width * height);
    const queue = new Uint32Array(width * height);
    let head = 0;
    let tail = 0;
    let removedPixels = 0;
    cornerIndices.forEach((index) => {
      if (data[index * 4 + 3] > 10 && !visited[index]) {
        visited[index] = 1;
        queue[tail] = index;
        tail += 1;
      }
    });

    while (head < tail) {
      const index = queue[head];
      head += 1;
      const offset = index * 4;
      const matchesBackground = backgroundColors.some(([red, green, blue]) => {
        const redDiff = data[offset] - red;
        const greenDiff = data[offset + 1] - green;
        const blueDiff = data[offset + 2] - blue;
        return redDiff * redDiff + greenDiff * greenDiff + blueDiff * blueDiff <= 48 * 48;
      });

      if (!matchesBackground) continue;
      data[offset + 3] = 0;
      removedPixels += 1;

      const neighbors = [
        index % width > 0 ? index - 1 : -1,
        index % width < width - 1 ? index + 1 : -1,
        index >= width ? index - width : -1,
        index < width * (height - 1) ? index + width : -1,
      ];
      neighbors.forEach((neighbor) => {
        if (neighbor >= 0 && !visited[neighbor]) {
          visited[neighbor] = 1;
          queue[tail] = neighbor;
          tail += 1;
        }
      });
    }

    if (removedPixels) {
      context.putImageData(imageData, 0, 0);
      setProcessedSrc(canvas.toDataURL('image/png'));
    }
  };

  return (
    <img
      src={processedSrc || src}
      alt=""
      loading="lazy"
      crossOrigin="anonymous"
      onLoad={removeImageBackground}
      onError={() => setFailed(true)}
    />
  );
}

export default function CategoryExplorer() {
  return (
    <section className="catalog-categories" aria-labelledby="categories-title">
      <div className="catalog-categories__header">
        <h2 id="categories-title">Explora por <span>categoría</span></h2>
        <a href="/products">Ver todo <b aria-hidden="true">→</b></a>
      </div>
      <div className="catalog-categories__list">
        {catalogCategories.map((category) => (
          <a className="catalog-category" href={`/products?category=${encodeURIComponent(category.name)}`} key={category.name}>
            <span className="catalog-category__image">
              <CategoryImage src={category.image} name={category.name} />
            </span>
            <strong>{category.name}</strong>
          </a>
        ))}
        <a className="catalog-category catalog-category--offers" href="/products?offers=1">
          <span><b>%</b></span>
          <strong>Ofertas</strong>
        </a>
      </div>
    </section>
  );
}
