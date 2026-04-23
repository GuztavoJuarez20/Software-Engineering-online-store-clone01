// CART TEST
function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + Number(item.price), 0);
}

function testCalculateTotal() {
  const cart = [{ price: 10 }, { price: 20 }, { price: 5 }];
  const result = calculateTotal(cart);

  console.assert(result === 35, "Test Failed: Total should be 35");
}

testCalculateTotal();


// PASSWORD TEST
function isValidPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function testPasswordValidation() {
  console.assert(isValidPassword("Abc12345") === true, "Valid password failed");
  console.assert(isValidPassword("abc123") === false, "Short password passed");
}

testPasswordValidation();

console.log("All tests ran!");
