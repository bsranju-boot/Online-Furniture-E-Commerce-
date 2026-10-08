var SUPABASE_URL = "https://qtjuujbvcjiansiuyhth.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_6Nbb1RcUY_yVe99QEM9jjA_iwHFnU07";
var ADMIN_EMAIL = "admin@aura.com";
var db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Local furniture products catalog
var products = [
  { id: 1, name: "Imperial Velvet Sofa", price: 125000, category: "Sofa", image: "images/sofa1.jpg", description: "Tufted velvet sofa with brass legs." },
  { id: 2, name: "Regal Leather Sectional", price: 185000, category: "Sofa", image: "images/sofa2.jpg", description: "Italian modular leather luxury sofa." },
  { id: 3, name: "Majestic Oak King Bed", price: 210000, category: "Bed", image: "images/bed1.jpg", description: "Smoked oak king bed frame." },
  { id: 4, name: "Nocturne Platform Bed", price: 165000, category: "Bed", image: "images/bed2.jpg", description: "Minimalist wooden bed with lighting." },
  { id: 5, name: "Gilded Accent Lounge Chair", price: 68000, category: "Chair", image: "images/chair1.jpg", description: "Curved velvet armchair in gold." },
  { id: 6, name: "Artisan Leather Dining Chair", price: 39000, category: "Chair", image: "images/chair2.jpg", description: "Solid walnut saddle leather chair." },
  { id: 7, name: "Grand Marble Dining Table", price: 2450, category: "Table", image: "images/table1.jpg", description: "Polished marble table with pedestals." },
  { id: 8, name: "Executive Walnut Work Desk", price: 1150, category: "Table", image: "images/table2.jpg", description: "Walnut study desk with hardware." }
];

// Clean input to escape HTML tags
function clean(str) {
  if (!str) return "";
  return String(str).split("<").join("&lt;").split(">").join("&gt;");
}

// Convert numeric rating to stars string
function stars(num) {
  var s = "", n = parseInt(num) || 0;
  for (var i = 1; i <= 5; i++) s += (i <= n) ? "★" : "☆";
  return s;
}

// Get saved user session data
function getCurrentUser() {
  var s = localStorage.getItem("aura_session");
  if (!s) return null;
  try { return JSON.parse(s); } catch (e) { return null; }
}

// Check if current user is admin
function isAdmin() {
  var u = getCurrentUser();
  return u && u.email && u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// Register user with Supabase Auth
async function signup(name, email, password) {
  try {
    if (!db) return "Database not initialized.";
    var res = await db.auth.signUp({
      email: email.trim(),
      password: password,
      options: { data: { name: name.trim() } }
    });
    if (res.error) return res.error.message;
    if (res.data && res.data.user) {
      var u = { id: res.data.user.id, email: res.data.user.email, name: name.trim() };
      localStorage.setItem("aura_session", JSON.stringify(u));
    }
    return "";
  } catch (err) {
    return err.message;
  }
}

// Login user with Supabase Auth
async function login(email, password) {
  try {
    if (!db) return "Database not initialized.";
    var res = await db.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    if (res.error) return "Invalid email or password.";
    if (res.data && res.data.user) {
      var meta = res.data.user.user_metadata || {};
      var uName = meta.name || email.split("@")[0];
      var u = { id: res.data.user.id, email: res.data.user.email, name: uName };
      localStorage.setItem("aura_session", JSON.stringify(u));
    }
    return "";
  } catch (err) {
    return "Invalid email or password.";
  }
}

// Log out active user session
async function logout() {
  try {
    if (db) await db.auth.signOut();
  } catch (e) {}
  localStorage.removeItem("aura_session");
  window.location.href = "index.html";
}

// Update authentication and role navigation links
function showAuthLink() {
  var navLinks = document.querySelector(".nav-links");
  var user = getCurrentUser();

  var oldOrders = document.getElementById("nav-orders");
  if (oldOrders) oldOrders.parentElement.removeChild(oldOrders);
  var oldProfile = document.getElementById("nav-profile");
  if (oldProfile) oldProfile.parentElement.removeChild(oldProfile);
  var oldAdmin = document.getElementById("nav-admin");
  if (oldAdmin) oldAdmin.parentElement.removeChild(oldAdmin);

  var authLink = document.getElementById("nav-auth");
  if (!authLink) return;

  if (user) {
    authLink.textContent = "Logout (" + user.name + ")";
    authLink.href = "#";
    authLink.onclick = function (e) {
      e.preventDefault();
      logout();
    };

    if (navLinks) {
      var authLi = authLink.parentElement;

      var liOrders = document.createElement("li");
      liOrders.id = "nav-orders";
      liOrders.innerHTML = '<a href="my-orders.html">My Orders</a>';
      navLinks.insertBefore(liOrders, authLi);

      var liProfile = document.createElement("li");
      liProfile.id = "nav-profile";
      liProfile.innerHTML = '<a href="profile.html">Profile</a>';
      navLinks.insertBefore(liProfile, authLi);

      if (isAdmin()) {
        var liAdmin = document.createElement("li");
        liAdmin.id = "nav-admin";
        liAdmin.innerHTML = '<a href="admin.html">Admin</a>';
        navLinks.insertBefore(liAdmin, authLi);
      }
    }
  } else {
    authLink.textContent = "Login";
    authLink.href = "login.html";
    authLink.onclick = null;
  }
}

// Load logged-in user profile from database
async function getProfile() {
  var user = getCurrentUser();
  if (!user || !db) return { name: "", phone: "", address: "" };
  try {
    var res = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (res.error) throw res.error;
    if (res.data) {
      return {
        name: res.data.name || "",
        phone: res.data.phone || "",
        address: res.data.address || ""
      };
    }
    return { name: user.name || "", phone: "", address: "" };
  } catch (err) {
    return { name: user.name || "", phone: "", address: "" };
  }
}

// Upsert user profile into database
async function saveProfile(name, phone, address) {
  var user = getCurrentUser();
  if (!user) return { success: false, error: "Must be logged in to update profile." };
  name = (name || "").trim();
  phone = (phone || "").trim();
  address = (address || "").trim();

  if (!name) return { success: false, error: "Name cannot be empty." };
  if (phone.length !== 10 || isNaN(phone)) return { success: false, error: "Phone number must be exactly 10 digits." };
  if (!address) return { success: false, error: "Address cannot be empty." };

  try {
    if (!db) return { success: false, error: "Database not connected." };
    var payload = {
      id: user.id,
      name: clean(name),
      phone: clean(phone),
      address: clean(address),
      updated_at: new Date().toISOString()
    };
    var res = await db.from("profiles").upsert([payload]);
    if (res.error) throw res.error;

    user.name = name;
    localStorage.setItem("aura_session", JSON.stringify(user));
    showAuthLink();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Fetch product reviews from Supabase
async function getReviews(productId) {
  try {
    if (!db) return [];
    var res = await db.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false });
    if (res.error) throw res.error;
    return res.data || [];
  } catch (err) {
    return [];
  }
}

// Insert new review into Supabase
async function addReview(productId, rating, comment) {
  var user = getCurrentUser();
  if (!user) return { success: false, error: "Must be logged in to leave a review." };
  try {
    if (!db) return { success: false, error: "Database not connected." };
    var res = await db.from("reviews").insert([{
      product_id: parseInt(productId),
      user_id: user.id,
      user_name: user.name,
      rating: parseInt(rating),
      comment: clean(comment)
    }]);
    if (res.error) throw res.error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Delete review from Supabase (admin only)
async function removeReview(id) {
  if (!isAdmin()) return { success: false, error: "Admin access required." };
  try {
    if (!db) return { success: false, error: "Database not connected." };
    var res = await db.from("reviews").delete().eq("id", id);
    if (res.error) throw res.error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Save complete customer order in Supabase
async function saveOrder(name, phone, address, cart, paymentMethod) {
  var user = getCurrentUser();
  if (!user) return { success: false, error: "Must be logged in to place an order." };
  var total = 0;
  for (var i = 0; i < cart.length; i++) total += cart[i].price * cart[i].quantity;
  var orderCode = "AURA-" + Math.floor(10000 + Math.random() * 90000);

  var d = new Date();
  d.setDate(d.getDate() + 5);
  var deliveryDate = d.toISOString().split("T")[0];

  var method = paymentMethod || "COD";
  var status = "Placed";
  var payStatus = (method === "COD") ? "Pending" : "Paid";

  try {
    if (!db) return { success: false, error: "Database not connected." };
    var payload = {
      id: orderCode,
      order_code: orderCode,
      user_id: user.id,
      name: clean(name),
      phone: clean(phone),
      address: clean(address),
      status: status,
      delivery_date: deliveryDate,
      payment_method: method,
      payment_status: payStatus,
      items: cart,
      total: total
    };
    var res = await db.from("orders").insert([payload]);
    if (res.error) {
      delete payload.order_code;
      delete payload.delivery_date;
      res = await db.from("orders").insert([payload]);
      if (res.error) throw res.error;
    }
    return { success: true, orderId: orderCode, orderCode: orderCode, deliveryDate: deliveryDate, items: cart, total: total };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Fetch orders placed by logged-in user
async function getMyOrders() {
  var user = getCurrentUser();
  if (!user || !db) return [];
  try {
    var res = await db.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (res.error) throw res.error;
    return res.data || [];
  } catch (err) {
    return [];
  }
}

// Cancel placed order by customer
async function cancelOrder(id) {
  var user = getCurrentUser();
  if (!user || !db) return { success: false, error: "Not logged in." };
  try {
    var res = await db.from("orders").update({ status: "Cancelled" }).eq("id", id).eq("status", "Placed");
    if (res.error) throw res.error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Fetch all orders in database for admin
async function getAllOrders() {
  if (!isAdmin() || !db) return [];
  try {
    var res = await db.from("orders").select("*").order("created_at", { ascending: false });
    if (res.error) throw res.error;
    return res.data || [];
  } catch (err) {
    return [];
  }
}

// Update order status and delivery date by admin
async function updateOrder(id, status, deliveryDate) {
  if (!isAdmin() || !db) return { success: false, error: "Admin access required." };
  try {
    var payload = { status: status };
    if (deliveryDate) payload.delivery_date = deliveryDate;
    var res = await db.from("orders").update(payload).eq("id", id);
    if (res.error) throw res.error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Display reviews and form inside details page
async function showReviews(productId) {
  var box = document.getElementById("reviews-box");
  if (!box) return;
  var list = await getReviews(productId);
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
      var d = r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "";
      h += '<div class="review-item">';
      h += '<div class="review-header">';
      h += '<strong>' + clean(r.user_name) + '</strong>';
      h += '<span class="stars-gold">' + stars(r.rating) + '</span>';
      h += '</div>';
      h += '<p class="review-comment">' + clean(r.comment) + '</p>';
      h += '<div class="review-footer">';
      h += '<small>' + clean(d) + '</small>';
      if (isAdmin()) {
        h += '<button class="btn-delete-review" onclick="deleteReview(' + r.id + ', ' + productId + ')">Delete</button>';
      }
      h += '</div>';
      h += '</div>';
    }
  }
  h += '</div></div>';
  box.innerHTML = h;
}

// Handle submission of user review
async function submitReview(event, productId) {
  event.preventDefault();
  var rating = document.getElementById("review-rating").value;
  var comment = document.getElementById("review-comment").value.trim();
  if (!comment) return;
  var res = await addReview(productId, rating, comment);
  if (res.success) {
    showReviews(productId);
  } else {
    alert(res.error);
  }
}

// Handle deletion of review by admin
async function deleteReview(reviewId, productId) {
  if (!confirm("Are you sure you want to delete this review?")) return;
  var res = await removeReview(reviewId);
  if (res.success) {
    showReviews(productId);
  } else {
    alert(res.error);
  }
}

// Initialize session state on page load
window.addEventListener("DOMContentLoaded", async function () {
  if (db && db.auth) {
    try {
      var sess = await db.auth.getSession();
      if (!sess.data || !sess.data.session) {
        localStorage.removeItem("aura_session");
      }
    } catch (e) {}
  }
  showAuthLink();
  var detailsBox = document.getElementById("details-container");
  if (detailsBox) {
    var pid = parseInt(new URLSearchParams(window.location.search).get("id"));
    if (pid) showReviews(pid);
  }
});
