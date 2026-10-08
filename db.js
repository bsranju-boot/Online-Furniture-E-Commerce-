// Initialize Supabase Client
var SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
var SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

var db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Register user with email and password
async function signUpUser(email, password) {
  try {
    var res = await db.auth.signUp({ email: email, password: password });
    if (res.error) throw res.error;
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// Log in user with email and password
async function signInUser(email, password) {
  try {
    var res = await db.auth.signInWithPassword({ email: email, password: password });
    if (res.error) throw res.error;
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// Log out active user session
async function signOutUser() {
  try {
    var res = await db.auth.signOut();
    if (res.error) throw res.error;
    window.location.href = "index.html";
  } catch (err) {
    alert("Logout error: " + err.message);
  }
}

// Retrieve currently authenticated session user
async function getCurrentUser() {
  try {
    if (!db) return null;
    var res = await db.auth.getUser();
    if (res.error || !res.data) return null;
    return res.data.user;
  } catch (err) {
    return null;
  }
}

// Fetch all products from database
async function getProductsFromDB() {
  try {
    var res = await db.from("products").select("*").order("id", { ascending: true });
    if (res.error) throw res.error;
    return res.data || [];
  } catch (err) {
    console.error("Fetch products error:", err.message);
    return [];
  }
}

// Fetch single product by id
async function getProductByIdFromDB(id) {
  try {
    var res = await db.from("products").select("*").eq("id", id).single();
    if (res.error) throw res.error;
    return res.data;
  } catch (err) {
    console.error("Fetch product error:", err.message);
    return null;
  }
}

// Save complete customer order with items
async function saveOrderToDB(orderData, cartItems) {
  try {
    var orderRes = await db.from("orders").insert([orderData]).select().single();
    if (orderRes.error) throw orderRes.error;

    var itemsToInsert = [];
    for (var i = 0; i < cartItems.length; i++) {
      itemsToInsert.push({
        order_id: orderData.id,
        product_id: cartItems[i].id,
        product_name: cartItems[i].name,
        price: cartItems[i].price,
        quantity: cartItems[i].quantity,
        user_id: orderData.user_id
      });
    }

    var itemsRes = await db.from("order_items").insert(itemsToInsert);
    if (itemsRes.error) throw itemsRes.error;

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Fetch order history for user
async function getUserOrdersFromDB(userId) {
  try {
    var res = await db.from("orders").select("*, order_items(*)").eq("user_id", userId).order("created_at", { ascending: false });
    if (res.error) throw res.error;
    return res.data || [];
  } catch (err) {
    console.error("Fetch orders error:", err.message);
    return [];
  }
}

// Fetch reviews for single product
async function getReviewsForProduct(productId) {
  try {
    var res = await db.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false });
    if (res.error) throw res.error;
    return res.data || [];
  } catch (err) {
    console.error("Fetch reviews error:", err.message);
    return [];
  }
}

// Post a review for product
async function insertReview(reviewData) {
  try {
    var res = await db.from("reviews").insert([reviewData]);
    if (res.error) throw res.error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Delete review by review id
async function deleteReview(reviewId) {
  try {
    var res = await db.from("reviews").delete().eq("id", reviewId);
    if (res.error) throw res.error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
