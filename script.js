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
  if (window.event && window.event.target && window.event.target.tagName === "BUTTON") {
    var btn = window.event.target; btn.textContent = "Added ✓"; setTimeout(function () { btn.textContent = "Add to Cart"; }, 1000);
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
async function checkout(event) {
  event.preventDefault();
  var err = document.getElementById("form-error");
  if (typeof getCurrentUser === "function") {
    var user = await getCurrentUser();
    if (!user) { window.location.href = "login.html?redirect=checkout.html"; return; }
  }
  var name = document.getElementById("cust-name").value.trim(), phone = document.getElementById("cust-phone").value.trim(), addr = document.getElementById("cust-address").value.trim();
  if (!name || !phone || !addr) { err.textContent = "Please complete all fields to proceed with your order."; return; }
  if (phone.length !== 10 || isNaN(phone)) { err.textContent = "Please enter a valid 10-digit phone number."; return; }
  var cart = getCart(); if (!cart.length) { err.textContent = "Your cart is empty. Please select furniture pieces before checking out."; return; }
  
  var total = 0;
  for (var i = 0; i < cart.length; i++) total += cart[i].price * cart[i].quantity;
  var orderId = "AURA-" + Math.floor(10000 + Math.random() * 90000);

  if (typeof saveOrderToDB === "function" && user) {
    var btn = document.getElementById("checkout-submit-btn");
    if (btn) btn.textContent = "Processing Order...";
    var orderData = { id: orderId, user_id: user.id, customer_name: name, phone: phone, address: addr, total: total };
    var res = await saveOrderToDB(orderData, cart);
    if (!res.success && res.error) {
      if (btn) btn.textContent = "Complete Purchase";
      err.textContent = "Order error: " + res.error;
      return;
    }
  }

  localStorage.removeItem("aura_cart"); saveCart([]);
  document.getElementById("checkout-form-box").style.display = "none"; document.getElementById("confirmation-box").style.display = "block";
  document.getElementById("confirmed-order-id").textContent = orderId;
  document.getElementById("confirmed-name").textContent = name; document.getElementById("confirmed-phone").textContent = phone; document.getElementById("confirmed-address").textContent = addr;
}

// Update authentication state in navbar
async function updateNavAuth() {
  var item = document.getElementById("nav-auth-item"); if (!item || typeof getCurrentUser !== "function") return;
  var user = await getCurrentUser();
  if (user && user.email) {
    var shortEmail = user.email.split("@")[0];
    item.innerHTML = '<a href="my-orders.html" title="' + user.email + '">' + shortEmail + '</a> <button onclick="signOutUser()" class="btn-link" style="margin-left: 8px; font-size: 11px;">Logout</button>';
  } else {
    item.innerHTML = '<a href="login.html">Login</a>';
  }
}

// Load and show product reviews
async function showReviews(productId) {
  var listEl = document.getElementById("reviews-list"), sumEl = document.getElementById("reviews-summary"), formGate = document.getElementById("review-auth-gate");
  if (!listEl || typeof getReviewsForProduct !== "function") return;
  var user = typeof getCurrentUser === "function" ? await getCurrentUser() : null;
  if (formGate) {
    if (user) {
      formGate.innerHTML = '<form id="review-form" onsubmit="postReview(event, ' + productId + ')"><div class="form-group"><label>Rating (1-5 Stars)</label><select id="review-rating" style="background:#1a1a1a;color:var(--text-main);padding:10px;border-radius:12px;border:1px solid var(--gold-border);width:100%;"><option value="5">★★★★★ - Exceptional (5)</option><option value="4">★★★★☆ - Very Good (4)</option><option value="3">★★★☆☆ - Average (3)</option><option value="2">★★☆☆☆ - Below Expectation (2)</option><option value="1">★☆☆☆☆ - Poor (1)</option></select></div><div class="form-group"><label>Your Feedback</label><textarea id="review-comment" rows="3" placeholder="Share your experience with this design..." required></textarea></div><button type="submit" class="btn btn-full">Submit Impression</button></form>';
    } else {
      formGate.innerHTML = '<p class="empty-msg" style="padding: 10px;">Please <a href="login.html?redirect=details.html?id=' + productId + '" class="btn-link">log in</a> to share your review.</p>';
    }
  }
  var reviews = await getReviewsForProduct(productId);
  if (!reviews || !reviews.length) {
    if (sumEl) sumEl.innerHTML = '<span style="color:var(--text-muted);font-size:14px;">No reviews yet. Be the first to review!</span>';
    listEl.innerHTML = '<p class="empty-msg">No client reviews posted yet.</p>';
    return;
  }
  var totalRating = 0;
  for (var i = 0; i < reviews.length; i++) totalRating += reviews[i].rating;
  var avg = (totalRating / reviews.length).toFixed(1);
  if (sumEl) sumEl.innerHTML = '<span class="gold-text" style="font-size:20px;font-weight:bold;">★ ' + avg + ' / 5.0</span> <span style="color:var(--text-muted);font-size:13px;margin-left:8px;">(' + reviews.length + ' reviews)</span>';
  var h = "";
  for (var i = 0; i < reviews.length; i++) {
    var r = reviews[i];
    var stars = "★★★★★".substring(0, r.rating) + "☆☆☆☆☆".substring(0, 5 - r.rating);
    var dateStr = new Date(r.created_at).toLocaleDateString();
    h += '<div class="review-card" style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:var(--radius-main);padding:18px;margin-bottom:15px;"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><strong style="font-size:14px;">' + r.user_email.split("@")[0] + '</strong><span style="color:var(--gold-light);letter-spacing:2px;">' + stars + '</span></div><p style="font-size:14px;color:var(--text-main);margin-bottom:8px;">' + r.comment + '</p><div style="display:flex;justify-content:space-between;align-items:center;"><small style="color:var(--text-muted);font-size:11px;">' + dateStr + '</small>';
    if (user && user.id === r.user_id) {
      h += '<button onclick="removeReview(' + r.id + ',' + productId + ')" class="btn-link" style="font-size:11px;color:#e74c3c;">Delete</button>';
    }
    h += '</div></div>';
  }
  listEl.innerHTML = h;
}

// Post a new review
async function postReview(event, productId) {
  event.preventDefault();
  var rating = parseInt(document.getElementById("review-rating").value);
  var comment = document.getElementById("review-comment").value.trim();
  var user = await getCurrentUser();
  if (!user || !comment) return;
  var res = await insertReview({ product_id: productId, user_id: user.id, user_email: user.email, rating: rating, comment: comment });
  if (res.success) { showReviews(productId); } else { alert("Failed to post review: " + res.error); }
}

// Remove an existing review
async function removeReview(reviewId, productId) {
  if (!confirm("Are you sure you want to remove your review?")) return;
  var res = await deleteReview(reviewId);
  if (res.success) { showReviews(productId); } else { alert("Failed to delete review: " + res.error); }
}

window.addEventListener("DOMContentLoaded", async function () {
  saveCart(getCart());
  updateNavAuth();

  if (typeof getProductsFromDB === "function") {
    var dbProds = await getProductsFromDB();
    if (dbProds && dbProds.length) products = dbProds;
  }

  showProducts(products.slice(0, 4), "featured-products");
  if (document.getElementById("product-list")) showProducts(products, "product-list");

  var d = document.getElementById("details-container");
  if (d) {
    var pid = parseInt(new URLSearchParams(window.location.search).get("id"));
    var p = findProduct(pid);
    if (p) {
      d.innerHTML = '<img src="' + p.image + '" alt="' + p.name + '"><div class="details-content"><span class="details-badge">' + p.category + ' Collection</span><h2>' + p.name + '</h2><p class="details-price">$' + p.price + '</p><p class="details-desc">' + p.description + '</p><button class="btn" onclick="addToCart(' + p.id + ')">Add to Cart</button><a href="products.html" class="btn-link">&larr; Return to All Collections</a></div>';
      showReviews(p.id);
    } else {
      d.innerHTML = '<p class="empty-msg">Product not found. <a href="products.html">Return to catalog</a></p>';
    }
  }

  showCart();
});
