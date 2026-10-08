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
function findProduct(id) {
  for (var i = 0; i < products.length; i++) if (products[i].id === parseInt(id)) return products[i];
  return null;
}

// Show product cards in container
function showProducts(list, boxId) {
  var box = document.getElementById(boxId); if (!box) return;
  if (!list.length) { box.innerHTML = '<p class="empty-msg">No luxury items match your criteria.</p>'; return; }
  var h = "";
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    h += '<div class="product-card"><div class="product-img-wrapper"><img src="' + p.image + '" alt="' + p.name + '"></div><div class="product-info"><span class="product-category">' + p.category + '</span><h3 class="product-title">' + p.name + '</h3><p class="product-price">Rs ' + p.price + '</p><div class="product-actions"><a href="details.html?id=' + p.id + '" class="btn-small">Details</a><button class="btn-cart" onclick="addToCart(' + p.id + ')">Add to Cart</button></div></div></div>';
  }
  box.innerHTML = h;
}

// Filter by category and search
function filterProducts() {
  var inp = document.getElementById("search-input"), q = inp ? inp.value.toLowerCase().trim() : "", res = [];
  for (var i = 0; i < products.length; i++) if ((selectedCategory === "All" || products[i].category === selectedCategory) && products[i].name.toLowerCase().indexOf(q) !== -1) res.push(products[i]);
  showProducts(res, "product-list");
}

function setCategory(cat) {
  selectedCategory = cat;
  var b = document.querySelectorAll(".filter-btn");
  for (var i = 0; i < b.length; i++) b[i].classList.toggle("active", b[i].textContent.trim() === cat);
  filterProducts();
}

// Add item to shopping cart
function addToCart(id) {
  var p = findProduct(id); if (!p) return;
  var cart = getCart(), it = null;
  for (var i = 0; i < cart.length; i++) if (cart[i].id === p.id) { it = cart[i]; break; }
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
    h += '<div class="cart-item-row"><img src="' + it.image + '" alt="' + it.name + '" class="cart-item-img"><div class="cart-item-info"><h4>' + it.name + '</h4><p class="cart-item-price">Rs ' + it.price + ' each</p></div><div class="qty-control"><button class="qty-btn" onclick="changeQty(' + it.id + ',-1)">-</button><span>' + it.quantity + '</span><button class="qty-btn" onclick="changeQty(' + it.id + ',1)">+</button></div><p><strong class="gold-text">Rs ' + sub + '</strong></p><button class="btn-remove" onclick="changeQty(' + it.id + ',-100)">Remove</button></div>';
  }
  box.innerHTML = h; if (sum) sum.textContent = "Rs " + total.toFixed(2);
}

// Validate checkout and record order to Supabase
async function checkout(event) {
  event.preventDefault();
  var err = document.getElementById("form-error");
  var user = getCurrentUser();
  if (!user) { window.location.href = "login.html?next=checkout.html"; return; }

  var name = document.getElementById("cust-name").value.trim();
  var phone = document.getElementById("cust-phone").value.trim();
  var addr = document.getElementById("cust-address").value.trim();
  var payMethod = document.getElementById("cust-payment") ? document.getElementById("cust-payment").value : "COD";

  if (!name || !phone || !addr) { err.textContent = "Please complete all fields to proceed with your order."; return; }
  if (phone.length !== 10 || isNaN(phone)) { err.textContent = "Please enter a valid 10-digit phone number."; return; }

  // Validate specific payment details
  if (payMethod === "UPI") {
    var upiVal = document.getElementById("upi-id") ? document.getElementById("upi-id").value.trim() : "";
    if (!upiVal || upiVal.indexOf("@") === -1) {
      err.textContent = "Please enter a valid UPI ID (e.g. name@upi).";
      return;
    }
  } else if (payMethod === "Card") {
    var cardNum = document.getElementById("card-num") ? document.getElementById("card-num").value.trim() : "";
    var cardCvv = document.getElementById("card-cvv") ? document.getElementById("card-cvv").value.trim() : "";
    if (cardNum.length < 12 || !cardCvv) {
      err.textContent = "Please enter complete Card Number and CVV.";
      return;
    }
  }

  var cart = getCart();
  if (!cart.length) { err.textContent = "Your cart is empty. Please select furniture pieces before checking out."; return; }

  var btn = document.getElementById("checkout-submit-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Processing Order..."; }

  var res = await saveOrder(name, phone, addr, cart, payMethod);
  if (!res.success) {
    if (btn) { btn.disabled = false; btn.textContent = "Complete Purchase"; }
    err.textContent = res.error;
    return;
  }

  localStorage.removeItem("aura_cart"); saveCart([]);
  document.getElementById("checkout-form-box").style.display = "none";
  document.getElementById("confirmation-box").style.display = "block";
  document.getElementById("confirmed-order-id").textContent = res.orderId;
  document.getElementById("confirmed-name").textContent = name;
  document.getElementById("confirmed-phone").textContent = phone;
  document.getElementById("confirmed-address").textContent = addr;
  var payConfirm = document.getElementById("confirmed-payment");
  if (payConfirm) {
    var labels = { UPI: "UPI Payment", COD: "Cash on Delivery (COD)", Card: "Credit / Debit Card", NetBanking: "Net Banking" };
    payConfirm.textContent = labels[payMethod] || payMethod;
  }
}

window.addEventListener("DOMContentLoaded", function () {
  saveCart(getCart());
  showProducts(products.slice(0, 4), "featured-products");
  if (document.getElementById("product-list")) showProducts(products, "product-list");

  var d = document.getElementById("details-container");
  if (d) {
    var pid = parseInt(new URLSearchParams(window.location.search).get("id"));
    var p = findProduct(pid);
    if (p) {
      d.innerHTML = '<img src="' + p.image + '" alt="' + p.name + '"><div class="details-content"><span class="details-badge">' + p.category + ' Collection</span><h2>' + p.name + '</h2><p class="details-price">$' + p.price + '</p><p class="details-desc">' + p.description + '</p><button class="btn" onclick="addToCart(' + p.id + ')">Add to Cart</button><a href="products.html" class="btn-link">&larr; Return to All Collections</a></div>';
    } else {
      d.innerHTML = '<p class="empty-msg">Product not found. <a href="products.html">Return to catalog</a></p>';
    }
  }

  showCart();
});
