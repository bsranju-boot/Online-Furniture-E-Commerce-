// Load or initialize localStorage collection
function load(key, fallback) {
  var d = localStorage.getItem(key);
  if (!d) { localStorage.setItem(key, JSON.stringify(fallback)); return fallback; }
  try { return JSON.parse(d); } catch (e) { return fallback; }
}

// Save data directly into localStorage
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initial 8 luxury furniture products
var defaultProducts = [
  { id: 1, name: "Imperial Velvet Sofa", price: 1250, category: "Sofa", image: "images/sofa1.jpg", description: "Tufted velvet sofa with brass legs." },
  { id: 2, name: "Regal Leather Sectional", price: 1850, category: "Sofa", image: "images/sofa2.jpg", description: "Italian modular leather luxury sofa." },
  { id: 3, name: "Majestic Oak King Bed", price: 2100, category: "Bed", image: "images/bed1.jpg", description: "Smoked oak king bed frame." },
  { id: 4, name: "Nocturne Platform Bed", price: 1650, category: "Bed", image: "images/bed2.jpg", description: "Minimalist wooden bed with lighting." },
  { id: 5, name: "Gilded Accent Lounge Chair", price: 680, category: "Chair", image: "images/chair1.jpg", description: "Curved velvet armchair in gold." },
  { id: 6, name: "Artisan Leather Dining Chair", price: 390, category: "Chair", image: "images/chair2.jpg", description: "Solid walnut saddle leather chair." },
  { id: 7, name: "Grand Marble Dining Table", price: 2450, category: "Table", image: "images/table1.jpg", description: "Polished marble table with pedestals." },
  { id: 8, name: "Executive Walnut Work Desk", price: 1150, category: "Table", image: "images/table2.jpg", description: "Walnut study desk with hardware." }
];

// Seed default users for authentication
var defaultUsers = [
  { email: "admin@aura.com", password: "admin123", name: "Admin", role: "admin" },
  { email: "ranju@aura.com", password: "ranju123", name: "Ranju", role: "customer" }
];

// Seed default reviews for products
var defaultReviews = [
  { id: 1, productId: 1, user: "Ranju", rating: 5, comment: "Exquisite tufted craftsmanship and velvety comfort.", date: "2026-03-15" },
  { id: 2, productId: 1, user: "Eleanor", rating: 4, comment: "Stunning focal centerpiece for our main parlour.", date: "2026-03-20" },
  { id: 3, productId: 3, user: "Marcus", rating: 5, comment: "Solid oak construction with impeccable timeless joinery.", date: "2026-04-02" }
];

// Master products array loaded from database
var products = load("aura_products", defaultProducts);

// Clean user input to prevent HTML injection
function clean(str) {
  if (!str) return "";
  return String(str).split("<").join("&lt;").split(">").join("&gt;");
}

// Convert numeric rating to star symbols
function stars(num) {
  var s = "", n = parseInt(num) || 0;
  for (var i = 1; i <= 5; i++) s += (i <= n) ? "★" : "☆";
  return s;
}

// Register a new customer user account
function signup(name, email, password) {
  var users = load("aura_users", defaultUsers);
  email = email.toLowerCase().trim();
  for (var i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email) {
      return { success: false, error: "Email is already registered." };
    }
  }
  var newUser = { email: email, password: password, name: name.trim(), role: "customer" };
  users.push(newUser);
  save("aura_users", users);
  save("aura_current_user", newUser);
  return { success: true, user: newUser };
}

// Log in user with credentials verification
function login(email, password) {
  var users = load("aura_users", defaultUsers);
  email = email.toLowerCase().trim();
  for (var i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === email && users[i].password === password) {
      save("aura_current_user", users[i]);
      return { success: true, user: users[i] };
    }
  }
  return { success: false, error: "Invalid email or password." };
}

// Terminate current user session and refresh
function logout() {
  localStorage.removeItem("aura_current_user");
  window.location.reload();
}

// Return currently logged in active user
function getCurrentUser() {
  var u = localStorage.getItem("aura_current_user");
  if (!u) return null;
  try { return JSON.parse(u); } catch (e) { return null; }
}

// Update authentication link in the navbar
function showAuthLink() {
  var el = document.getElementById("nav-auth");
  if (!el) return;
  var user = getCurrentUser();
  if (user) {
    el.innerHTML = 'Logout (' + clean(user.name) + ')';
    el.href = "#";
    el.onclick = function (e) {
      e.preventDefault();
      logout();
    };
  } else {
    el.textContent = "Login";
    el.href = "login.html";
    el.onclick = null;
  }
}

// Fetch all reviews matching a product ID
function getReviews(productId) {
  var all = load("aura_reviews", defaultReviews);
  var res = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].productId === parseInt(productId)) res.push(all[i]);
  }
  return res;
}

// Add a new review to database
function addReview(productId, rating, comment) {
  var user = getCurrentUser();
  if (!user) return { success: false, error: "Must be logged in to leave a review." };
  var all = load("aura_reviews", defaultReviews);
  var newRev = {
    id: Date.now(),
    productId: parseInt(productId),
    user: user.name,
    rating: parseInt(rating),
    comment: clean(comment),
    date: new Date().toISOString().split("T")[0]
  };
  all.unshift(newRev);
  save("aura_reviews", all);
  return { success: true, review: newRev };
}

// Remove review allowed for administrators only
function removeReview(reviewId) {
  var user = getCurrentUser();
  if (!user || user.role !== "admin") return { success: false, error: "Admin access required." };
  var all = load("aura_reviews", defaultReviews);
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === parseInt(reviewId)) {
      all.splice(i, 1);
      save("aura_reviews", all);
      return { success: true };
    }
  }
  return { success: false, error: "Review not found." };
}

// Save complete customer order to database
function saveOrder(name, phone, address, cart) {
  var user = getCurrentUser();
  if (!user) return { success: false, error: "Must be logged in to place an order." };
  var orders = load("aura_orders", []);
  var total = 0;
  for (var i = 0; i < cart.length; i++) total += cart[i].price * cart[i].quantity;
  var newOrder = {
    id: "AURA-" + Math.floor(10000 + Math.random() * 90000),
    userEmail: user.email,
    name: clean(name),
    phone: clean(phone),
    address: clean(address),
    items: cart,
    total: total,
    date: new Date().toISOString().split("T")[0]
  };
  orders.push(newOrder);
  save("aura_orders", orders);
  return { success: true, order: newOrder };
}

// Render product reviews and form inside box
function showReviews(productId) {
  var box = document.getElementById("reviews-box");
  if (!box) return;
  var list = getReviews(productId);
  var user = getCurrentUser();
  var h = '<div class="reviews-wrapper">';
  h += '<h3 class="reviews-title">Client Impressions</h3>';

  if (list.length > 0) {
    var sum = 0;
    for (var i = 0; i < list.length; i++) sum += list[i].rating;
    var avg = (sum / list.length).toFixed(1);
    h += '<div class="reviews-summary"><span class="stars-gold">' + stars(Math.round(avg)) + '</span><strong>' + avg + ' / 5.0</strong> <span class="review-count">(' + list.length + ' reviews)</span></div>';
  } else {
    h += '<div class="reviews-summary"><span class="stars-gold">' + stars(5) + '</span><span class="review-count">No impressions yet. Be the first to review!</span></div>';
  }

  if (user) {
    h += '<form class="review-form" onsubmit="submitReview(event, ' + productId + ')">';
    h += '<h4>Leave a Review</h4>';
    h += '<div class="form-group"><label>Rating</label><select id="review-rating" class="review-select"><option value="5">★★★★★ - 5 Stars (Exceptional)</option><option value="4">★★★★☆ - 4 Stars (Very Good)</option><option value="3">★★★☆☆ - 3 Stars (Good)</option><option value="2">★★☆☆☆ - 2 Stars (Fair)</option><option value="1">★☆☆☆☆ - 1 Star (Poor)</option></select></div>';
    h += '<div class="form-group"><label>Your Feedback</label><textarea id="review-comment" class="review-textarea" rows="3" placeholder="Share your experience with this design..." required></textarea></div>';
    h += '<button type="submit" class="btn btn-cart">Post Review</button>';
    h += '</form>';
  } else {
    h += '<p class="review-auth-msg"><a href="login.html?next=details.html?id=' + productId + '" class="btn-link">Login to write a review</a></p>';
  }

  h += '<div class="reviews-list">';
  if (list.length === 0) {
    h += '<p class="empty-msg">No client reviews posted yet.</p>';
  } else {
    for (var j = 0; j < list.length; j++) {
      var r = list[j];
      h += '<div class="review-item">';
      h += '<div class="review-header">';
      h += '<strong>' + clean(r.user) + '</strong>';
      h += '<span class="stars-gold">' + stars(r.rating) + '</span>';
      h += '</div>';
      h += '<p class="review-comment">' + clean(r.comment) + '</p>';
      h += '<div class="review-footer">';
      h += '<small>' + clean(r.date) + '</small>';
      if (user && user.role === "admin") {
        h += '<button class="btn-delete-review" onclick="removeReview(' + r.id + '); showReviews(' + productId + ');">Delete</button>';
      }
      h += '</div>';
      h += '</div>';
    }
  }
  h += '</div></div>';
  box.innerHTML = h;
}

// Handle submission of review form
function submitReview(event, productId) {
  event.preventDefault();
  var rating = document.getElementById("review-rating").value;
  var comment = document.getElementById("review-comment").value.trim();
  if (!comment) return;
  var res = addReview(productId, rating, comment);
  if (res.success) {
    showReviews(productId);
  } else {
    alert(res.error);
  }
}
