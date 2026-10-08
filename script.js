var products = [
  { id: 1, name: "Imperial Velvet Sofa", price: 1250, category: "Sofa", image: "images/sofa1.jpg", description: "Tufted velvet sofa with brass legs." },
  { id: 2, name: "Regal Leather Sectional", price: 1850, category: "Sofa", image: "images/sofa2.jpg", description: "Italian modular leather luxury sofa." },
  { id: 3, name: "Majestic Oak King Bed", price: 2100, category: "Bed", image: "images/bed1.jpg", description: "Smoked oak king bed frame." },
  { id: 4, name: "Nocturne Platform Bed", price: 1650, category: "Bed", image: "images/bed2.jpg", description: "Minimalist wooden bed with lighting." },
  { id: 5, name: "Gilded Accent Lounge Chair", price: 680, category: "Chair", image: "images/chair1.jpg", description: "Curved velvet armchair in gold." },
  { id: 6, name: "Artisan Leather Dining Chair", price: 390, category: "Chair", image: "images/chair2.jpg", description: "Solid walnut saddle leather chair." },
  { id: 7, name: "Grand Marble Dining Table", price: 2450, category: "Table", image: "images/table1.jpg", description: "Polished marble table with pedestals." },
  { id: 8, name: "Executive Walnut Work Desk", price: 1150, category: "Table", image: "images/table2.jpg", description: "Walnut study desk with hardware." }
];
var selectedCategory = "All";
// Read cart items from storage
function getCart() { var d = localStorage.getItem("aura_cart"); return d ? JSON.parse(d) : []; }
// Save cart and update count
function saveCart(cart) {
  localStorage.setItem("aura_cart", JSON.stringify(cart));
  var b = document.getElementById("nav-cart-count");
  if (b) { var n = 0; for (var i = 0; i < cart.length; i++) n += cart[i].quantity; b.textContent = n; }
}
// Find single product by ID
function findProduct(id) { for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i]; return null; }
// Show product cards in container
function showProducts(list, boxId) {
  var box = document.getElementById(boxId); if (!box) return;
  if (!list.length) { box.innerHTML = '<p class="empty-msg">No luxury items match your criteria.</p>'; return; }
  var h = "";
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    h += '<div class="product-card"><div class="product-img-wrapper"><img src="' + p.image + '" alt="' + p.name + '"></div><div class="product-info"><span class="product-category">' + p.category + '</span><h3 class="product-title">' + p.name + '</h3><p class="product-price">$' + p.price + '</p><div class="product-actions"><a href="details.html?id=' + p.id + '" class="btn-small">Details</a><button class="btn-cart" onclick="addToCart(' + p.id + ')">Add to Cart</button></div></div></div>';
  }
  box.innerHTML = h;
}
// Filter by category and search
function filterProducts() {
  var inp = document.getElementById("search-input"), q = inp ? inp.value.toLowerCase().trim() : "", res = [];
  for (var i = 0; i < products.length; i++) if ((selectedCategory === "All" || products[i].category === selectedCategory) && products[i].name.toLowerCase().indexOf(q) !== -1) res.push(products[i]);
  showProducts(res, "product-list");
}
function setCategory(cat) { selectedCategory = cat; var b = document.querySelectorAll(".filter-btn"); for (var i = 0; i < b.length; i++) b[i].classList.toggle("active", b[i].textContent.trim() === cat); filterProducts(); }
// Add item to shopping cart
function addToCart(id) {
  var p = findProduct(id); if (!p) return;
  var cart = getCart(), it = null;
  for (var i = 0; i < cart.length; i++) if (cart[i].id === id) { it = cart[i]; break; }
  if (it) it.quantity += 1; else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, quantity: 1 });
  saveCart(cart);
  if (event && event.target && event.target.tagName === "BUTTON") {
    var btn = event.target; btn.textContent = "Added ✓"; setTimeout(function () { btn.textContent = "Add to Cart"; }, 1000);
  }
}
// Change quantity or remove item
function changeQty(id, change) {
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) if (cart[i].id === id) { cart[i].quantity += change; if (cart[i].quantity <= 0) cart.splice(i, 1); break; }
  saveCart(cart); showCart();
}
// Display shopping cart items list
function showCart() {
  var box = document.getElementById("cart-container"), sum = document.getElementById("cart-total-price"), btn = document.getElementById("checkout-btn"); if (!box) return;
  var cart = getCart();
  if (!cart.length) { box.innerHTML = '<p class="empty-msg">Your shopping bag is currently empty. <a href="products.html">Explore our collections</a></p>'; if (sum) sum.textContent = "$0"; if (btn) btn.classList.add("disabled"); return; }
  if (btn) btn.classList.remove("disabled");
  var h = "", total = 0;
  for (var i = 0; i < cart.length; i++) {
    var it = cart[i], sub = it.price * it.quantity; total += sub;
    h += '<div class="cart-item-row"><img src="' + it.image + '" alt="' + it.name + '" class="cart-item-img"><div class="cart-item-info"><h4>' + it.name + '</h4><p class="cart-item-price">$' + it.price + ' each</p></div><div class="qty-control"><button class="qty-btn" onclick="changeQty(' + it.id + ',-1)">-</button><span>' + it.quantity + '</span><button class="qty-btn" onclick="changeQty(' + it.id + ',1)">+</button></div><p><strong class="gold-text">$' + sub + '</strong></p><button class="btn-remove" onclick="changeQty(' + it.id + ',-100)">Remove</button></div>';
  }
  box.innerHTML = h; if (sum) sum.textContent = "$" + total;
}
// Validate form and place order
function checkout(event) {
  event.preventDefault();
  var name = document.getElementById("cust-name").value.trim(), phone = document.getElementById("cust-phone").value.trim(), addr = document.getElementById("cust-address").value.trim(), err = document.getElementById("form-error");
  if (!name || !phone || !addr) { err.textContent = "Please complete all fields to proceed with your order."; return; }
  if (phone.length !== 10 || isNaN(phone)) { err.textContent = "Please enter a valid 10-digit phone number."; return; }
  var cart = getCart(); if (!cart.length) { err.textContent = "Your cart is empty. Please select furniture pieces before checking out."; return; }
  localStorage.removeItem("aura_cart"); saveCart([]);
  document.getElementById("checkout-form-box").style.display = "none"; document.getElementById("confirmation-box").style.display = "block";
  document.getElementById("confirmed-order-id").textContent = "AURA-" + Math.floor(10000 + Math.random() * 90000);
  document.getElementById("confirmed-name").textContent = name; document.getElementById("confirmed-phone").textContent = phone; document.getElementById("confirmed-address").textContent = addr;
}
window.addEventListener("DOMContentLoaded", function () {
  saveCart(getCart()); showProducts(products.slice(0, 4), "featured-products");
  if (document.getElementById("product-list")) showProducts(products, "product-list");
  var d = document.getElementById("details-container");
  if (d) {
    var p = findProduct(parseInt(new URLSearchParams(window.location.search).get("id")));
    if (p) d.innerHTML = '<img src="' + p.image + '" alt="' + p.name + '"><div class="details-content"><span class="details-badge">' + p.category + ' Collection</span><h2>' + p.name + '</h2><p class="details-price">$' + p.price + '</p><p class="details-desc">' + p.description + '</p><button class="btn" onclick="addToCart(' + p.id + ')">Add to Cart</button><a href="products.html" class="btn-link">&larr; Return to All Collections</a></div>';
    else d.innerHTML = '<p class="empty-msg">Product not found. <a href="products.html">Return to catalog</a></p>';
  }
  showCart();
});
