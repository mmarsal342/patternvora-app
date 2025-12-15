import { AspectRatio } from '../../types';

export const safeMod = (n: number, m: number) => ((n % m) + m) % m;

export const adjustColor = (hex: string, amount: number): string => {
    let color = hex.substring(1);
    if (color.length === 3) color = color.split('').map(c => c + c).join('');
    
    const num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    let b = ((num >> 8) & 0x00FF) + amount;
    let g = (num & 0x0000FF) + amount;

    if (r > 255) r = 255; else if (r < 0) r = 0;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    if (g > 255) g = 255; else if (g < 0) g = 0;

    return "#" + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
};

export const getDimensions = (ratio: AspectRatio, baseSize: number = 2000) => {
  switch (ratio) {
    case '16:9': return { width: baseSize, height: Math.round(baseSize * 9 / 16) };
    case '9:16': return { width: Math.round(baseSize * 9 / 16), height: baseSize };
    case '4:5': return { width: Math.round(baseSize * 4 / 5), height: baseSize };
    case '3:4': return { width: Math.round(baseSize * 3 / 4), height: baseSize };
    case '1:1': default: return { width: baseSize, height: baseSize };
  }
};