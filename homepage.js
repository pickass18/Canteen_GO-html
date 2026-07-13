// CanteenGO Core Javascript Logic

// Global State
let isLoggedIn = false;
let loggedInUser = null;

// Food Modal Calculations state
let currentFood = {
    name: '',
    basePrice: 0,
    qty: 1,
    addons: {
        cheese: { active: false, price: 30 },
        spicy: { active: false, price: 10 },
        sauce: { active: false, price: 15 }
    },
    payment: 'cash'
};

// Drink Modal Calculations state
let currentDrink = {
    name: '',
    basePrice: 0,
    qty: 1,
    sizeCost: 0,
    sweetness: '50',
    payment: 'cash'
};

// Feedback Rating state
let currentRating = 5;

document.addEventListener("DOMContentLoaded", () => {
    initAuthModal();
    initFeedbackStars();
});

// ==========================================
// TOAST SYSTEM
// ==========================================
function showToast(message, type = 'success') {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
    
    // Add icon based on type
    const icon = type === 'success' ? '✅' : '🔔';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4000);
}

// ==========================================
// AUTHENTICATION MODAL LOGIC
// ==========================================
function initAuthModal() {
    const openBtn = document.getElementById("openLogin");
    const mottoBtn = document.getElementById("mottoSignIn");
    const overlay = document.getElementById("loginOverlay");
    const closeBtn = document.getElementById("closeLogin");
    const toggleLink = document.getElementById("toggleAuthMode");
    
    if (!overlay) return;

    let isSignUpMode = false;

    // Toggle Modal open
    if (openBtn) {
        openBtn.addEventListener("click", () => {
            if (isLoggedIn) {
                // Logout sequence
                isLoggedIn = false;
                loggedInUser = null;
                openBtn.textContent = "Sign In";
                openBtn.className = "btn btn-outline";
                if (mottoBtn) {
                    mottoBtn.textContent = "Sign In";
                }
                showToast("Successfully logged out.", "info");
            } else {
                overlay.classList.add("active");
            }
        });
    }

    // Toggle Modal open or redirect for Motto button
    if (mottoBtn) {
        mottoBtn.addEventListener("click", () => {
            if (isLoggedIn) {
                window.location.href = "food.html";
            } else {
                overlay.classList.add("active");
            }
        });
    }

    // Close Modal
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            overlay.classList.remove("active");
        });
    }

    // Toggle between login and signup modes
    if (toggleLink) {
        toggleLink.addEventListener("click", (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            
            const modalTitle = document.getElementById("modalTitle");
            const emailGroup = document.getElementById("emailGroup");
            const submitBtn = document.getElementById("authSubmitBtn");
            const toggleText = document.getElementById("authToggleText");
            
            if (isSignUpMode) {
                modalTitle.textContent = "Create Account";
                emailGroup.style.display = "block";
                document.getElementById("authEmail").required = true;
                submitBtn.textContent = "Sign Up";
                toggleText.textContent = "Already have an account?";
                toggleLink.textContent = "Sign In";
            } else {
                modalTitle.textContent = "Login to CanteenGO";
                emailGroup.style.display = "none";
                document.getElementById("authEmail").required = false;
                submitBtn.textContent = "Sign In";
                toggleText.textContent = "Don't have an account?";
                toggleLink.textContent = "Sign Up";
            }
        });
    }
}

function handleAuthSubmit() {
    const usernameInput = document.getElementById("authUsername");
    const overlay = document.getElementById("loginOverlay");
    const openBtn = document.getElementById("openLogin");
    const mottoBtn = document.getElementById("mottoSignIn");
    
    isLoggedIn = true;
    loggedInUser = usernameInput.value;
    
    overlay.classList.remove("active");
    
    // Update Header - hide the login button to remove the logout option
    if (openBtn) {
        openBtn.style.display = "none";
    }

    // Update Motto Button
    if (mottoBtn) {
        mottoBtn.textContent = "Explore Menu";
    }
    
    // Reset Form
    document.getElementById("authForm").reset();
}

// ==========================================
// MENU SEARCH & FILTER LOGIC
// ==========================================
function filterMenu(category) {
    // Update category buttons active state
    const container = document.querySelector(".categories");
    const buttons = container.querySelectorAll(".category-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    // Find matching button
    event.currentTarget.classList.add("active");
    
    // Filter cards
    const cards = document.querySelectorAll(".menu-card");
    cards.forEach(card => {
        const itemCategory = card.getAttribute("data-category");
        if (category === 'all' || itemCategory === category) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

function searchMenuItems() {
    const input = document.getElementById("menuSearch");
    const filter = input.value.toLowerCase();
    const cards = document.querySelectorAll(".menu-card");
    
    cards.forEach(card => {
        const name = card.getAttribute("data-name").toLowerCase();
        if (name.includes(filter)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

// ==========================================
// FOOD ORDERING MODAL LOGIC
// ==========================================
function openOrderModal(name, price, icon) {
    const modal = document.getElementById("orderModal");
    if (!modal) return;

    currentFood.name = name;
    currentFood.basePrice = price;
    currentFood.qty = 1;
    currentFood.addons.cheese.active = false;
    currentFood.addons.spicy.active = false;
    currentFood.addons.sauce.active = false;
    currentFood.payment = 'cash';

    // UI Updates
    document.getElementById("orderItemName").textContent = name;
    document.getElementById("orderItemBasePrice").textContent = `Rs. ${price}`;
    document.getElementById("orderItemIcon").textContent = icon;
    document.getElementById("orderQty").textContent = "1";
    document.getElementById("orderRemarks").value = "";

    // Reset Custom options Active States
    document.getElementById("addon-cheese").classList.remove("active");
    document.getElementById("addon-spicy").classList.remove("active");
    document.getElementById("addon-sauce").classList.remove("active");
    
    document.getElementById("pay-cash").classList.add("active");
    document.getElementById("pay-esewa").classList.remove("active");
    document.getElementById("pay-card").classList.remove("active");

    calculateFoodTotal();
    modal.classList.add("active");
}

function closeOrderModal() {
    document.getElementById("orderModal").classList.remove("active");
}

function updateQty(diff) {
    currentFood.qty = Math.max(1, currentFood.qty + diff);
    document.getElementById("orderQty").textContent = currentFood.qty;
    calculateFoodTotal();
}

function toggleAddon(addonKey, price) {
    currentFood.addons[addonKey].active = !currentFood.addons[addonKey].active;
    const element = document.getElementById(`addon-${addonKey}`);
    if (currentFood.addons[addonKey].active) {
        element.classList.add("active");
    } else {
        element.classList.remove("active");
    }
    calculateFoodTotal();
}

function setPayment(method) {
    currentFood.payment = method;
    document.getElementById("pay-cash").classList.remove("active");
    document.getElementById("pay-esewa").classList.remove("active");
    document.getElementById("pay-card").classList.remove("active");
    
    document.getElementById(`pay-${method}`).classList.add("active");
}

function calculateFoodTotal() {
    let price = currentFood.basePrice;
    
    // Addons cost
    Object.keys(currentFood.addons).forEach(key => {
        if (currentFood.addons[key].active) {
            price += currentFood.addons[key].price;
        }
    });

    const total = price * currentFood.qty;
    document.getElementById("orderTotalPrice").textContent = `Rs. ${total}`;
}

function submitOrder() {
    closeOrderModal();
    const orderId = Math.floor(1000 + Math.random() * 9000);
    showToast(`Order #${orderId} for ${currentFood.name} queued successfully! Pay via ${currentFood.payment.toUpperCase()} on pickup.`);
}

// ==========================================
// DRINK ORDERING MODAL LOGIC
// ==========================================
function openDrinkOrderModal(name, price, icon) {
    const modal = document.getElementById("drinkOrderModal");
    if (!modal) return;

    currentDrink.name = name;
    currentDrink.basePrice = price;
    currentDrink.qty = 1;
    currentDrink.sizeCost = 0;
    currentDrink.sweetness = '50';
    currentDrink.payment = 'cash';

    // UI Updates
    document.getElementById("drinkOrderItemName").textContent = name;
    document.getElementById("drinkOrderItemBasePrice").textContent = `Rs. ${price}`;
    document.getElementById("drinkOrderItemIcon").textContent = icon;
    document.getElementById("drinkOrderQty").textContent = "1";
    document.getElementById("drinkOrderRemarks").value = "";

    // Reset Custom active options
    document.getElementById("size-regular").classList.add("active");
    document.getElementById("size-large").classList.remove("active");
    
    document.getElementById("sweet-0").classList.remove("active");
    document.getElementById("sweet-50").classList.add("active");
    document.getElementById("sweet-100").classList.remove("active");

    document.getElementById("drink-pay-cash").classList.add("active");
    document.getElementById("drink-pay-esewa").classList.remove("active");
    document.getElementById("drink-pay-card").classList.remove("active");

    calculateDrinkTotal();
    modal.classList.add("active");
}

function closeDrinkOrderModal() {
    document.getElementById("drinkOrderModal").classList.remove("active");
}

function updateDrinkQty(diff) {
    currentDrink.qty = Math.max(1, currentDrink.qty + diff);
    document.getElementById("drinkOrderQty").textContent = currentDrink.qty;
    calculateDrinkTotal();
}

function setDrinkSize(size, cost) {
    currentDrink.sizeCost = cost;
    document.getElementById("size-regular").classList.remove("active");
    document.getElementById("size-large").classList.remove("active");
    
    document.getElementById(`size-${size}`).classList.add("active");
    calculateDrinkTotal();
}

function setDrinkSweetness(level) {
    currentDrink.sweetness = level;
    document.getElementById("sweet-0").classList.remove("active");
    document.getElementById("sweet-50").classList.remove("active");
    document.getElementById("sweet-100").classList.remove("active");
    
    document.getElementById(`sweet-${level}`).classList.add("active");
}

function setDrinkPayment(method) {
    currentDrink.payment = method;
    document.getElementById("drink-pay-cash").classList.remove("active");
    document.getElementById("drink-pay-esewa").classList.remove("active");
    document.getElementById("drink-pay-card").classList.remove("active");
    
    document.getElementById(`drink-pay-${method}`).classList.add("active");
}

function calculateDrinkTotal() {
    const unitPrice = currentDrink.basePrice + currentDrink.sizeCost;
    const total = unitPrice * currentDrink.qty;
    document.getElementById("drinkOrderTotalPrice").textContent = `Rs. ${total}`;
}

function submitDrinkOrder() {
    closeDrinkOrderModal();
    const orderId = Math.floor(1000 + Math.random() * 9000);
    showToast(`Drink Order #${orderId} placed successfully! Customize: ${currentDrink.sweetness}% sugar. Total: ${document.getElementById("drinkOrderTotalPrice").textContent}`);
}
