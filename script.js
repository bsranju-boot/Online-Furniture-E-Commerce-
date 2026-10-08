
var products = [
  {
    id: 1,
    name: "Imperial Velvet Sofa",
    price: 1250,
    category: "Sofa",
    image: "images/sofa1.jpg",
    description: "Deep emerald velvet three-seater sofa adorned with hand-tufted cushions and brushed brass legs for unmatched luxury."
  },
  {
    id: 2,
    name: "Regal Leather Sectional",
    price: 1850,
    category: "Sofa",
    image: "images/sofa2.jpg",
    description: "Spacious L-shaped modular sectional upholstered in Italian full-grain leather with precision gold stitch detailing."
  },
  {
    id: 3,
    name: "Majestic Oak King Bed",
    price: 2100,
    category: "Bed",
    image: "images/bed1.jpg",
    description: "Architectural king-sized bed frame handcrafted from dark European smoked oak featuring an upholstered gold fabric headboard."
  },
  {
    id: 4,
    name: "Nocturne Platform Bed",
    price: 1650,
    category: "Bed",
    image: "images/bed2.jpg",
    description: "Low-profile minimalist platform bed with cantilevered floating nightstands and soft under-frame ambient warm glow accents."
  },
  {
    id: 5,
    name: "Gilded Accent Lounge Chair",
    price: 680,
    category: "Chair",
    image: "images/chair1.jpg",
    description: "Curved velvet armchair framed in satin brushed gold steel, designed for maximum ergonomic relaxation and visual prestige."
  },
  {
    id: 6,
    name: "Artisan Leather Dining Chair",
    price: 390,
    category: "Chair",
    image: "images/chair2.jpg",
    description: "Sculpted solid walnut dining chair wrapped in saddle leather with subtle champagne gold ferrule feet."
  },
  {
    id: 7,
    name: "Grand Marble Dining Table",
    price: 2450,
    category: "Table",
    image: "images/table1.jpg",
    description: "Eight-seater dining table showcasing a polished Nero Marquina marble slab supported by geometric gold pedestals."
  },
  {
    id: 8,
    name: "Executive Walnut Work Desk",
    price: 1150,
    category: "Table",
    image: "images/table2.jpg",
    description: "Sophisticated study desk with American walnut veneer, hidden cable docks, and champagne gold handles."
  }
];

var selectedCategory = "All";

function getCart() {
  var cartData = localStorage.getItem("aura_cart");
  if (cartData) {
    return JSON.parse(cartData);
  }
  return [];
}

// Function: Saves the current cart array into localStorage and updates the badge
function saveCart(cart) {
  localStorage.setItem("aura_cart", JSON.stringify(cart));
  updateCartBadge();
}

// Function: Calculates total items in the cart and displays the number on the navbar badge
function updateCartBadge() {
  var badge = document.getElementById("nav-cart-count");
  if (!badge) return;

  var cart = getCart();
  var totalCount = 0;
  for (var i = 0; i < cart.length; i++) {
    totalCount += cart[i].quantity;
  }
  badge.textContent = totalCount;
}

// Function: Generates the HTML card markup for a single product item
function createProductCardHTML(product) {
  return '<div class="product-card">' +
    '<div class="product-img-wrapper">' +
      '<img src="' + product.image + '" alt="' + product.name + '">' +
    '</div>' +
    '<div class="product-info">' +
      '<span class="product-category">' + product.category + '</span>' +
      '<h3 class="product-title">' + product.name + '</h3>' +
      '<p class="product-price">$' + product.price + '</p>' +
      '<div class="product-actions">' +
        '<a href="details.html?id=' + product.id + '" class="btn-small">Details</a>' +
        '<button class="btn-cart" onclick="addToCart(' + product.id + ')">Add to Cart</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// Function: Shows the top 4 featured furniture pieces on index.html
function renderFeaturedProducts() {
  var container = document.getElementById("featured-products");
  if (!container) return;

  var html = "";
  for (var i = 0; i < 4; i++) {
    html += createProductCardHTML(products[i]);
  }
  container.innerHTML = html;
}

// Function: Renders any given list of furniture items into the products.html grid
function renderProductList(itemsToRender) {
  var container = document.getElementById("product-list");
  if (!container) return;

  if (itemsToRender.length === 0) {
    container.innerHTML = '<p class="empty-msg">No luxury items match your criteria.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < itemsToRender.length; i++) {
    html += createProductCardHTML(itemsToRender[i]);
  }
  container.innerHTML = html;
}

// Function: Filters the product list based on the search input and selected category button
function filterProducts() {
  var searchInput = document.getElementById("search-input");
  var query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  var filtered = [];
  for (var i = 0; i < products.length; i++) {
    var item = products[i];
    var matchesCategory = (selectedCategory === "All" || item.category === selectedCategory);
    var matchesSearch = item.name.toLowerCase().indexOf(query) !== -1;

    if (matchesCategory && matchesSearch) {
      filtered.push(item);
    }
  }

  renderProductList(filtered);
}

// Function: Sets the active category button and triggers filtering
function setCategory(categoryName) {
  selectedCategory = categoryName;

  var buttons = document.querySelectorAll(".filter-btn");
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent.trim() === categoryName) {
      buttons[i].classList.add("active");
    } else {
      buttons[i].classList.remove("active");
    }
  }

  filterProducts();
}

// Function: Reads the id from the page URL and displays the full product specifications
function renderProductDetails() {
  var container = document.getElementById("details-container");
  if (!container) return;

  var urlParams = new URLSearchParams(window.location.search);
  var productId = parseInt(urlParams.get("id"));

  var foundProduct = null;
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      foundProduct = products[i];
      break;
    }
  }

  if (!foundProduct) {
    container.innerHTML = '<p class="empty-msg">Product not found. <a href="products.html">Return to catalog</a></p>';
    return;
  }

  container.innerHTML =
    '<img src="' + foundProduct.image + '" alt="' + foundProduct.name + '">' +
    '<div class="details-content">' +
      '<span class="details-badge">' + foundProduct.category + ' Collection</span>' +
      '<h2>' + foundProduct.name + '</h2>' +
      '<p class="details-price">$' + foundProduct.price + '</p>' +
      '<p class="details-desc">' + foundProduct.description + '</p>' +
      '<button class="btn btn-pill" onclick="addToCart(' + foundProduct.id + ')">Add to Cart</button>' +
      '<a href="products.html" class="btn-link">&larr; Return to All Collections</a>' +
    '</div>';
}

// Function: Adds an item to the shopping cart or increments quantity if already present
function addToCart(productId) {
  var product = null;
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      product = products[i];
      break;
    }
  }
  if (!product) return;

  var cart = getCart();
  var existingItem = null;

  for (var j = 0; j < cart.length; j++) {
    if (cart[j].id === productId) {
      existingItem = cart[j];
      break;
    }
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart(cart);
  alert('"' + product.name + '" added to your luxury bag!');
}

// Function: Displays all items currently in the user cart along with calculated totals
function renderCartPage() {
  var container = document.getElementById("cart-container");
  var totalPriceEl = document.getElementById("cart-total-price");
  var checkoutBtn = document.getElementById("checkout-btn");
  if (!container) return;

  var cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Your shopping bag is currently empty. <a href="products.html">Explore our collections</a></p>';
    if (totalPriceEl) totalPriceEl.textContent = "$0";
    if (checkoutBtn) {
      checkoutBtn.style.pointerEvents = "none";
      checkoutBtn.style.opacity = "0.4";
    }
    return;
  }

  if (checkoutBtn) {
    checkoutBtn.style.pointerEvents = "auto";
    checkoutBtn.style.opacity = "1";
  }

  var html = "";
  var totalAmount = 0;

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var subtotal = item.price * item.quantity;
    totalAmount += subtotal;

    html += '<div class="cart-item-row">' +
      '<img src="' + item.image + '" alt="' + item.name + '" class="cart-item-img">' +
      '<div class="cart-item-info">' +
        '<h4>' + item.name + '</h4>' +
        '<p class="cart-item-price">$' + item.price + ' each</p>' +
      '</div>' +
      '<div class="qty-control">' +
        '<button class="qty-btn" onclick="changeQuantity(' + item.id + ', -1)">-</button>' +
        '<span>' + item.quantity + '</span>' +
        '<button class="qty-btn" onclick="changeQuantity(' + item.id + ', 1)">+</button>' +
      '</div>' +
      '<p><strong class="gold-text">$' + subtotal + '</strong></p>' +
      '<button class="btn-remove" onclick="removeCartItem(' + item.id + ')">Remove</button>' +
    '</div>';
  }

  container.innerHTML = html;
  if (totalPriceEl) totalPriceEl.textContent = "$" + totalAmount;
}

// Function: Changes item count by +1 or -1 and removes item if quantity reaches 0
function changeQuantity(productId, delta) {
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      cart[i].quantity += delta;
      if (cart[i].quantity <= 0) {
        cart.splice(i, 1);
      }
      break;
    }
  }
  saveCart(cart);
  renderCartPage();
}

// Function: Removes an item completely from the cart
function removeCartItem(productId) {
  var cart = getCart();
  var updatedCart = [];
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id !== productId) {
      updatedCart.push(cart[i]);
    }
  }
  saveCart(updatedCart);
  renderCartPage();
}

// Function: Validates the checkout form fields and displays confirmed order details
function handleCheckout(event) {
  event.preventDefault();

  var nameInput = document.getElementById("cust-name");
  var phoneInput = document.getElementById("cust-phone");
  var addressInput = document.getElementById("cust-address");
  var errorEl = document.getElementById("form-error");

  var name = nameInput.value.trim();
  var phone = phoneInput.value.trim();
  var address = addressInput.value.trim();

  // Validate that no inputs are empty
  if (name === "" || phone === "" || address === "") {
    errorEl.textContent = "Please complete all fields to proceed with your order.";
    return;
  }

  // Validate that phone number has exactly 10 numerical digits
  if (phone.length !== 10 || isNaN(phone)) {
    errorEl.textContent = "Please enter a valid 10-digit phone number.";
    return;
  }

  errorEl.textContent = "";

  // Check that the cart is not empty
  var cart = getCart();
  if (cart.length === 0) {
    errorEl.textContent = "Your cart is empty. Please select furniture pieces before checking out.";
    return;
  }

  // Generate random Order ID (e.g., AURA-84920)
  var randomId = "AURA-" + Math.floor(10000 + Math.random() * 90000);

  // Clear cart from localStorage and reset badge
  localStorage.removeItem("aura_cart");
  updateCartBadge();

  // Hide order form and reveal confirmation summary
  document.getElementById("checkout-form-box").style.display = "none";
  document.getElementById("confirmation-box").style.display = "block";

  document.getElementById("confirmed-order-id").textContent = randomId;
  document.getElementById("confirmed-name").textContent = name;
  document.getElementById("confirmed-phone").textContent = phone;
  document.getElementById("confirmed-address").textContent = address;
}

// Runs when web page finishes loading
window.addEventListener("DOMContentLoaded", function () {
  updateCartBadge();
  renderFeaturedProducts();
  if (document.getElementById("product-list")) {
    renderProductList(products);
  }
  renderProductDetails();
  renderCartPage();
});
