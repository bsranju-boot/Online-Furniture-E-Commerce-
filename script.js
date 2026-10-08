var products = [
  { id: 1, name: "Imperial Velvet Sofa", price: 1250, category: "Sofa", image: "images/sofa1.jpg", description: "Hand-tufted deep emerald velvet sofa with brushed brass legs." },
  { id: 2, name: "Regal Leather Sectional", price: 1850, category: "Sofa", image: "images/sofa2.jpg", description: "Italian full-grain modular leather sofa with gold stitch details." },
  { id: 3, name: "Majestic Oak King Bed", price: 2100, category: "Bed", image: "images/bed1.jpg", description: "Handcrafted smoked oak king bed frame with gold headboard." },
  { id: 4, name: "Nocturne Platform Bed", price: 1650, category: "Bed", image: "images/bed2.jpg", description: "Minimalist wooden platform bed with ambient under-frame lighting." },
  { id: 5, name: "Gilded Accent Lounge Chair", price: 680, category: "Chair", image: "images/chair1.jpg", description: "Curved velvet armchair framed in satin brushed gold steel." },
  { id: 6, name: "Artisan Leather Dining Chair", price: 390, category: "Chair", image: "images/chair2.jpg", description: "Solid walnut dining chair wrapped in durable saddle leather." },
  { id: 7, name: "Grand Marble Dining Table", price: 2450, category: "Table", image: "images/table1.jpg", description: "Polished Nero Marquina marble table with geometric gold pedestals." },
  { id: 8, name: "Executive Walnut Work Desk", price: 1150, category: "Table", image: "images/table2.jpg", description: "Modern walnut study desk with champagne gold hardware." }
];

var selectedCategory = "All";

// Find product by its ID
function findProduct(id) {
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === id) return products[i];
  }
  return null;
}

// Get cart array from localStorage
function getCart() {
  var data = localStorage.getItem("aura_cart");
  return data ? JSON.parse(data) : [];
}

// Save cart and update badge
function saveCart(cart) {
  localStorage.setItem("aura_cart", JSON.stringify(cart));
  var badge = document.getElementById("nav-cart-count");
  if (badge) {
    var count = 0;
    for (var i = 0; i < cart.length; i++) count += cart[i].quantity;
    badge.textContent = count;
  }
}

// Display product list in container
function showProducts(list, containerId) {
  var box = document.getElementById(containerId);
  if (!box) return;
  if (list.length === 0) {
    box.innerHTML = '<p class="empty-msg">No luxury items match your criteria.</p>';
    return;
  }
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    html += '<div class="product-card">' +
      '<div class="product-img-wrapper"><img src="' + p.image + '" alt="' + p.name + '"></div>' +
      '<div class="product-info">' +
        '<span class="product-category">' + p.category + '</span>' +
        '<h3 class="product-title">' + p.name + '</h3>' +
        '<p class="product-price">$' + p.price + '</p>' +
        '<div class="product-actions">' +
          '<a href="details.html?id=' + p.id + '" class="btn-small">Details</a>' +
          '<button class="btn-cart" onclick="addToCart(' + p.id + ', this)">Add to Cart</button>' +
        '</div>' +
      '</div></div>';
  }
  box.innerHTML = html;
}

// Filter products by category and search
function filterProducts() {
  var search = document.getElementById("search-input");
  var query = search ? search.value.toLowerCase().trim() : "";
  var filtered = [];
  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    var matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    var matchesText = p.name.toLowerCase().indexOf(query) !== -1;
    if (matchesCat && matchesText) filtered.push(p);
  }
  showProducts(filtered, "product-list");
}

// Set active category and filter
function setCategory(name) {
  selectedCategory = name;
  var btns = document.querySelectorAll(".filter-btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle("active", btns[i].textContent.trim() === name);
  }
  filterProducts();
}

// Render product details page
function renderProductDetails() {
  var box = document.getElementById("details-container");
  if (!box) return;
  var id = parseInt(new URLSearchParams(window.location.search).get("id"));
  var p = findProduct(id);
  if (!p) {
    box.innerHTML = '<p class="empty-msg">Product not found. <a href="products.html">Return to catalog</a></p>';
    return;
  }
  box.innerHTML = '<img src="' + p.image + '" alt="' + p.name + '">' +
    '<div class="details-content">' +
      '<span class="details-badge">' + p.category + ' Collection</span>' +
      '<h2>' + p.name + '</h2>' +
      '<p class="details-price">$' + p.price + '</p>' +
      '<p class="details-desc">' + p.description + '</p>' +
      '<button class="btn" onclick="addToCart(' + p.id + ', this)">Add to Cart</button>' +
      '<a href="products.html" class="btn-link">&larr; Return to All Collections</a>' +
    '</div>';
}

// Add item to shopping cart
function addToCart(id, btn) {
  var p = findProduct(id);
  if (!p) return;
  var cart = getCart();
  var item = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) { item = cart[i]; break; }
  }
  if (item) item.quantity += 1;
  else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, quantity: 1 });
  saveCart(cart);
  if (btn) {
    var original = btn.textContent;
    btn.textContent = "Added ✓";
    setTimeout(function () { btn.textContent = original; }, 1000);
  }
}

// Render items in cart page
function renderCartPage() {
  var box = document.getElementById("cart-container");
  var totalEl = document.getElementById("cart-total-price");
  var checkoutBtn = document.getElementById("checkout-btn");
  if (!box) return;
  var cart = getCart();
  if (cart.length === 0) {
    box.innerHTML = '<p class="empty-msg">Your shopping bag is currently empty. <a href="products.html">Explore our collections</a></p>';
    if (totalEl) totalEl.textContent = "$0";
    if (checkoutBtn) checkoutBtn.classList.add("disabled");
    return;
  }
  if (checkoutBtn) checkoutBtn.classList.remove("disabled");
  var html = "";
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var subtotal = item.price * item.quantity;
    total += subtotal;
    html += '<div class="cart-item-row">' +
      '<img src="' + item.image + '" alt="' + item.name + '" class="cart-item-img">' +
      '<div class="cart-item-info"><h4>' + item.name + '</h4><p class="cart-item-price">$' + item.price + ' each</p></div>' +
      '<div class="qty-control">' +
        '<button class="qty-btn" onclick="updateCart(' + item.id + ', -1)">-</button>' +
        '<span>' + item.quantity + '</span>' +
        '<button class="qty-btn" onclick="updateCart(' + item.id + ', 1)">+</button>' +
      '</div>' +
      '<p><strong class="gold-text">$' + subtotal + '</strong></p>' +
      '<button class="btn-remove" onclick="updateCart(' + item.id + ', -999)">Remove</button>' +
    '</div>';
  }
  box.innerHTML = html;
  if (totalEl) totalEl.textContent = "$" + total;
}

// Update quantity or remove cart item
function updateCart(id, change) {
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].quantity += change;
      if (cart[i].quantity <= 0) cart.splice(i, 1);
      break;
    }
  }
  saveCart(cart);
  renderCartPage();
}

// Validate checkout form and submit order
function handleCheckout(event) {
  event.preventDefault();
  var name = document.getElementById("cust-name").value.trim();
  var phone = document.getElementById("cust-phone").value.trim();
  var address = document.getElementById("cust-address").value.trim();
  var err = document.getElementById("form-error");
  if (!name || !phone || !address) {
    err.textContent = "Please complete all fields to proceed with your order.";
    return;
  }
  if (phone.length !== 10 || isNaN(phone)) {
    err.textContent = "Please enter a valid 10-digit phone number.";
    return;
  }
  err.textContent = "";
  var cart = getCart();
  if (cart.length === 0) {
    err.textContent = "Your cart is empty. Please select furniture pieces before checking out.";
    return;
  }
  var orderId = "AURA-" + Math.floor(10000 + Math.random() * 90000);
  localStorage.removeItem("aura_cart");
  saveCart([]);
  document.getElementById("checkout-form-box").style.display = "none";
  document.getElementById("confirmation-box").style.display = "block";
  document.getElementById("confirmed-order-id").textContent = orderId;
  document.getElementById("confirmed-name").textContent = name;
  document.getElementById("confirmed-phone").textContent = phone;
  document.getElementById("confirmed-address").textContent = address;
}

// Initialize application data on page load
window.addEventListener("DOMContentLoaded", function () {
  saveCart(getCart());
  showProducts(products.slice(0, 4), "featured-products");
  if (document.getElementById("product-list")) showProducts(products, "product-list");
  renderProductDetails();
  renderCartPage();
});
