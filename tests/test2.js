// WHITE-BOX TEST 1: Cart total
function calculateTotal(cart) {
  let total = 0;
  cart.forEach(item => {
    total += Number(item.price);
  });
  return total;
}

console.assert(calculateTotal([{price:10},{price:20}]) === 30, "Cart test failed");
console.assert(calculateTotal([]) === 0, "Empty cart test failed");


// WHITE-BOX TEST 2: Category filter
function filterProducts(products, category) {
  if (category) {
    return products.filter(p => p.category === category);
  }
  return products;
}

const products = [
  { name: "Hammer", category: "tool" },
  { name: "Laptop", category: "laptop" }
];

console.assert(filterProducts(products, "tool").length === 1, "Filter failed");
console.assert(filterProducts(products, "").length === 2, "No filter failed");

console.log("White-box tests ran");
