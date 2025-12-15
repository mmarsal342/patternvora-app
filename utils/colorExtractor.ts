
// Extracts dominant colors from an image using a simplified K-Means clustering algorithm
export const extractPaletteFromImage = async (imageSrc: string): Promise<{ colors: string[], bg: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("No context");

      // Resize for performance (speed over absolute precision)
      const w = 100;
      const h = 100 * (img.height / img.width);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h).data;
      const points: number[][] = [];

      for (let i = 0; i < imageData.length; i += 4) {
        // Skip fully transparent pixels
        if (imageData[i + 3] < 128) continue;
        points.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
      }

      if (points.length === 0) {
        return resolve({ colors: ['#000000'], bg: '#ffffff' });
      }

      // K-Means Configuration
      const k = 6; // Extract 6 colors (1 for BG, 5 for palette)
      let centroids = [];
      
      // Initialize centroids randomly from points
      for (let i = 0; i < k; i++) {
        centroids.push(points[Math.floor(Math.random() * points.length)]);
      }

      // Iterate (5 times is usually enough for convergence on small dataset)
      for (let iter = 0; iter < 5; iter++) {
        const assignments: number[][] = new Array(k).fill(0).map(() => []);
        
        // Assign points to nearest centroid
        for (const p of points) {
          let minDist = Infinity;
          let idx = 0;
          for (let i = 0; i < k; i++) {
            const d = Math.sqrt(
              Math.pow(p[0]-centroids[i][0], 2) + 
              Math.pow(p[1]-centroids[i][1], 2) + 
              Math.pow(p[2]-centroids[i][2], 2)
            );
            if (d < minDist) {
              minDist = d;
              idx = i;
            }
          }
          assignments[idx].push(p as any);
        }

        // Recalculate centroids
        for (let i = 0; i < k; i++) {
          if (assignments[i].length === 0) continue;
          const sum = assignments[i].reduce((acc: any, curr: any) => [acc[0]+curr[0], acc[1]+curr[1], acc[2]+curr[2]], [0,0,0]);
          centroids[i] = [
            Math.floor(sum[0]/assignments[i].length),
            Math.floor(sum[1]/assignments[i].length),
            Math.floor(sum[2]/assignments[i].length)
          ];
        }
      }

      // Convert to Hex
      const hexColors = centroids.map(c => 
        "#" + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1)
      );

      // Simple heuristic: Determine background (usually the brightest or darkest, or most frequent)
      // Here we just pick the first one as BG and the rest as Palette for simplicity
      // A better heuristic might be sorting by luminance
      
      const bg = hexColors[0];
      const colors = hexColors.slice(1);

      resolve({ colors, bg });
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
};
