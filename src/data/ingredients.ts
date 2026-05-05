export interface Ingredient {
  name: string;
  p: number;
  f: number;
  c: number;
  cal: number;
  pricing?: Record<number, number>;
  unit?: 'G' | 'PC';
  tier?: string;
  subCategory?: string;
  max?: number;
  min?: number;
  step?: number;
  weightPerPc?: number;
}

export const INGREDIENTS: Record<string, Ingredient[]> = {
  protein: [
    // CHICKEN
    { name: 'Chicken Breast', p: 25, f: 3, c: 0, cal: 130, subCategory: 'CHICKEN', pricing: { 100: 0.97, 150: 1.45, 200: 1.94, 250: 2.42, 300: 2.91 } },
    { name: 'Shredded Chicken', p: 24, f: 4, c: 0, cal: 135, subCategory: 'CHICKEN', pricing: { 100: 1.10, 150: 1.65, 200: 2.20, 250: 2.75, 300: 3.30 } },
    { name: 'Chicken Cubes', p: 25, f: 3, c: 0, cal: 130, subCategory: 'CHICKEN', pricing: { 100: 1.05, 150: 1.58, 200: 2.10, 250: 2.63, 300: 3.15 } },
    { name: 'Chicken Thigh', p: 21, f: 9, c: 0, cal: 170, subCategory: 'CHICKEN', pricing: { 100: 0.97, 150: 1.45, 200: 1.94, 250: 2.42, 300: 2.91 } },
    { name: 'Chicken Stir Fry', p: 23, f: 5, c: 0, cal: 145, subCategory: 'CHICKEN', pricing: { 100: 1.15, 150: 1.73, 200: 2.30, 250: 2.88, 300: 3.45 } },
    
    // BEEF
    { name: 'Ground Beef', p: 22, f: 12, c: 0, cal: 190, subCategory: 'BEEF', pricing: { 100: 1.325, 150: 1.9875, 200: 2.65, 250: 3.3125, 300: 3.975 } },
    { name: 'Beef Fillet', p: 24, f: 8, c: 0, cal: 180, subCategory: 'BEEF', pricing: { 100: 1.325, 150: 1.9875, 200: 2.65, 250: 3.3125, 300: 3.975 } },
    { name: 'Stir Fry Beef', p: 24, f: 8, c: 0, cal: 180, subCategory: 'BEEF', pricing: { 100: 1.325, 150: 1.9875, 200: 2.65, 250: 3.3125, 300: 3.975 } },
    { name: 'Beef Cubes', p: 22, f: 10, c: 0, cal: 185, subCategory: 'BEEF', pricing: { 100: 1.325, 150: 1.9875, 200: 2.65, 250: 3.3125, 300: 3.975 } },
    
    // FISH
    { name: 'Tuna Saku', p: 26, f: 1, c: 0, cal: 116, subCategory: 'FISH', pricing: { 100: 2.15, 150: 3.23, 200: 4.30, 250: 5.38, 300: 6.45 } },
    { name: 'Canned Tuna', p: 24, f: 1, c: 0, cal: 110, subCategory: 'FISH', pricing: { 100: 2.69, 150: 4.04, 200: 5.38 } },
    { name: 'Smoked Salmon', p: 20, f: 13, c: 0, cal: 200, subCategory: 'FISH', pricing: { 100: 3.50, 150: 5.25, 200: 7.00 } },
    { name: 'White Fish', p: 18, f: 2, c: 0, cal: 95, subCategory: 'FISH', pricing: { 100: 1.50, 150: 2.25, 200: 3.00, 250: 3.75, 300: 4.50 } },
    { name: 'Shrimp (Peeled)', p: 24, f: 0.3, c: 0, cal: 99, subCategory: 'FISH', pricing: { 100: 1.85, 150: 2.78, 200: 3.70, 250: 4.63, 300: 5.55 } },
    
    // VEGETARIAN
    { name: 'Fried Tofu', p: 15, f: 8, c: 10, cal: 180, subCategory: 'VEGETARIAN', pricing: { 100: 1.00, 150: 1.50, 200: 2.00, 250: 2.50, 300: 3.00 } },
    { name: 'Tempeh', p: 19, f: 11, c: 9, cal: 195, subCategory: 'VEGETARIAN', pricing: { 100: 1.20, 150: 1.80, 200: 2.40, 250: 3.00, 300: 3.60 } },
    { name: 'Egg Whites', p: 11, f: 0, c: 1, cal: 52, subCategory: 'VEGETARIAN', pricing: { 100: 0.80, 150: 1.20, 200: 1.60, 250: 2.00, 300: 2.40 } },
    
    { name: 'Skip', p: 0, f: 0, c: 0, cal: 0, subCategory: 'NONE', pricing: {} },
  ],
  carb: [
    { name: 'Basmati Rice', p: 3, f: 0, c: 28, cal: 130, subCategory: 'RICE & GRAINS', pricing: { 100: 0.45, 150: 0.68, 200: 0.90, 250: 1.13, 300: 1.35 } },
    { name: 'Sweet Potato', p: 2, f: 0, c: 20, cal: 90, subCategory: 'POTATOES', pricing: { 100: 0.40, 150: 0.60, 200: 0.80, 250: 1.00, 300: 1.20 } },
    { name: 'Baked Potato', p: 2, f: 0.2, c: 21, cal: 93, subCategory: 'POTATOES', pricing: { 100: 0.40, 150: 0.60, 200: 0.80, 250: 1.00, 300: 1.20 } },
    { name: 'Airfryed Potato', p: 2, f: 3, c: 25, cal: 140, subCategory: 'POTATOES', pricing: { 100: 0.45, 150: 0.68, 200: 0.90, 250: 1.13, 300: 1.35 } },
    { name: 'Boiled Potato', p: 2, f: 0.1, c: 17, cal: 87, subCategory: 'POTATOES', pricing: { 100: 0.35, 150: 0.53, 200: 0.70, 250: 0.88, 300: 1.05 } },
    { name: 'Mashed Potato', p: 2, f: 4, c: 15, cal: 110, subCategory: 'POTATOES', pricing: { 100: 0.45, 150: 0.68, 200: 0.90, 250: 1.13, 300: 1.35 } },
    { name: 'Sweet Corn', p: 3, f: 1, c: 19, cal: 86, subCategory: 'OTHERS', pricing: { 100: 0.86, 150: 1.29, 200: 1.72, 250: 2.15, 300: 2.58 } },
    { name: 'Baked Beans', p: 5, f: 1, c: 15, cal: 95, subCategory: 'OTHERS', pricing: { 100: 1.17, 150: 1.76, 200: 2.34 } },
    { name: 'Normal Wrap', p: 6, f: 4, c: 35, cal: 210, subCategory: 'BREAD & WRAPS', pricing: { 1: 0.60, 2: 1.20, 3: 1.80 }, unit: 'PC', weightPerPc: 45, max: 3 },
    { name: 'Jumbo Wrap', p: 8, f: 6, c: 45, cal: 280, subCategory: 'BREAD & WRAPS', pricing: { 1: 0.825, 2: 1.65, 3: 2.475 }, unit: 'PC', weightPerPc: 70, max: 3 },
    { name: 'English Muffin', p: 6, f: 1, c: 45, cal: 220, subCategory: 'BREAD & WRAPS', pricing: { 1: 0.60, 2: 1.20, 3: 1.80 }, unit: 'PC', max: 3, weightPerPc: 65 },
    { name: 'Cauliflower Rice', p: 2, f: 0, c: 4, cal: 25, subCategory: 'OTHERS', pricing: { 100: 0.80, 150: 1.20, 200: 1.60, 250: 2.00, 300: 2.40 } },
    { name: 'Fusilli Pasta', p: 6, f: 1, c: 25, cal: 140, subCategory: 'PASTA', pricing: { 50: 0.22, 75: 0.33, 100: 0.43, 125: 0.54 }, min: 50, max: 125, step: 25 },
    { name: 'Penne Pasta', p: 6, f: 1, c: 25, cal: 140, subCategory: 'PASTA', pricing: { 50: 0.22, 75: 0.33, 100: 0.43, 125: 0.54 }, min: 50, max: 125, step: 25 },
    { name: 'Spaghetti', p: 6, f: 1, c: 25, cal: 140, subCategory: 'PASTA', pricing: { 50: 0.22, 75: 0.33, 100: 0.43, 125: 0.54 }, min: 50, max: 125, step: 25 },
    { name: 'Wholewheat Pasta', p: 7, f: 1.5, c: 23, cal: 135, subCategory: 'PASTA', pricing: { 50: 0.25, 75: 0.38, 100: 0.50, 125: 0.63 }, min: 50, max: 125, step: 25 },
    { name: 'Ciabatta', p: 9, f: 1.5, c: 55, cal: 270, subCategory: 'BREAD & WRAPS', pricing: { 0.5: 0.45, 1: 0.90, 1.5: 1.35, 2: 1.80 }, unit: 'PC', weightPerPc: 140, step: 0.5, max: 2 },
    { name: 'Sourdough Bread', p: 8, f: 1, c: 50, cal: 245, subCategory: 'BREAD & WRAPS', pricing: { 50: 0.35, 100: 0.70, 150: 1.05, 200: 1.40 }, min: 50, max: 200, step: 50 },
    { name: 'Sourdough Croutons', p: 8, f: 12, c: 50, cal: 340, subCategory: 'BREAD & WRAPS', pricing: { 20: 0.50, 40: 1.00 }, min: 20, max: 40, step: 20 },
    { name: 'Skip', p: 0, f: 0, c: 0, cal: 0, subCategory: 'NONE', pricing: {} },
  ],
  veggies: [
    { name: 'Broccoli', p: 3, f: 0, c: 7, cal: 34, tier: 'standard' },
    { name: 'Spinach', p: 3, f: 0, c: 4, cal: 23, tier: 'standard' },
    { name: 'Asparagus', p: 2, f: 0, c: 4, cal: 20, tier: 'premium' },
    { name: 'Mushrooms', p: 3, f: 0, c: 3, cal: 22, tier: 'standard' },
    { name: 'Zucchini', p: 1, f: 0, c: 3, cal: 17, tier: 'standard' },
    { name: 'Mixed Greens Salad', p: 2, f: 0, c: 3, cal: 15, tier: 'standard' },
    { name: 'Cherry Tomatoes', p: 1, f: 0, c: 4, cal: 18, tier: 'standard' },
    { name: 'Cucumber Ribbons', p: 0.6, f: 0, c: 2, cal: 12, tier: 'standard' },
    { name: 'Skip', p: 0, f: 0, c: 0, cal: 0, tier: 'none' },
  ],
  sauce: [
    { name: 'Greek Yoghurt Lemon', p: 2, f: 3, c: 2, cal: 45, tier: 'standard' },
    { name: 'Greek Yoghurt Spicy', p: 2, f: 4, c: 4, cal: 60, tier: 'standard' },
    { name: 'Greek Yoghurt Garlic', p: 2, f: 3, c: 2, cal: 45, tier: 'standard' },
    { name: 'Greek Yoghurt Herb', p: 2, f: 3, c: 2, cal: 45, tier: 'standard' },
    { name: 'Greek Yoghurt Truffle', p: 2, f: 8, c: 3, cal: 90, tier: 'premium' },
    { name: 'Tomato Sauce', p: 1, f: 0, c: 5, cal: 25, tier: 'tomato' },
    { name: 'Olive Oil + Herbs', p: 0, f: 14, c: 0, cal: 120, tier: 'flat' },
    { name: 'Nasi Goreng Spice', p: 1, f: 2, c: 8, cal: 55, tier: 'flat' },
    { name: 'Balsamic Vinaigrette', p: 0, f: 8, c: 5, cal: 90, tier: 'premium' },
    { name: 'Caesar Dressing', p: 1, f: 12, c: 2, cal: 120, tier: 'premium' },
    { name: 'No Sauce', p: 0, f: 0, c: 0, cal: 0, tier: 'none' },
  ]
};
