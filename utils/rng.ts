// A simple seeded random number generator (Linear Congruential Generator)
// This ensures that the SVG download matches the Canvas preview exactly
export class RNG {
  private m = 0x80000000;
  private a = 1103515245;
  private c = 12345;
  private state: number;

  constructor(seed: number) {
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }

  // Returns a float between 0 and 1
  nextFloat(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }

  // Returns an integer between min and max
  nextRange(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }

  // Returns a random item from an array
  nextItem<T>(array: T[]): T {
    return array[Math.floor(this.nextFloat() * array.length)];
  }
}