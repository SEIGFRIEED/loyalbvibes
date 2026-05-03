const STORAGE_KEYS = {
  accounts: "nival-accounts",
  session: "nival-session",
  content: "nival-content",
  products: "nival-products",
  cart: "nival-cart",
};
const PARTNER_ACCOUNT = {
  name: "Yulibert Andujar",
  email: "admin@lvf.com",
  password: "1010",
  role: "partner",
};
const LEGACY_PARTNER_EMAILS = new Set(["yulibertandujar017@gmail.com", "yulibertandujar01@gmail.com"]);
const STORAGE_BACKUP_PREFIX = "nival-backup";
const STORAGE_BACKUP_CHUNK_SIZE = 3000;
const STORAGE_BACKUP_MAX_CHUNKS = 24;
const STORAGE_BACKUP_MAX_AGE = 60 * 60 * 24 * 365 * 10;

const HOME_PRODUCT_LIMIT = 4;
const PRODUCT_IMAGE_MAX_DIMENSION = 1600;
const PRODUCT_IMAGE_JPEG_QUALITY = 0.86;
const CHECKOUT_SHIPPING_FEE = 479.59;
const DEFAULT_PRODUCT_STOCK = 12;
// Tasa de venta del BCRD del 1 de mayo de 2026 para migrar precios legacy en USD a DOP.
const LEGACY_USD_TO_DOP_RATE = 59.9485;
const LEGACY_MOCKUP_PRODUCT_IDS = new Set([
  "product-1",
  "product-2",
  "product-3",
  "product-4",
  "product-5",
  "product-6",
  "product-7",
  "product-8",
  "product-9",
  "product-10",
]);

const productCategories = {
  tshirts: {
    label: "T-shirts",
    singular: "T-shirt",
  },
  hoodies: {
    label: "Hoodies",
    singular: "hoodie",
  },
  pants: {
    label: "Pantalones",
    singular: "pantalon",
  },
  accessories: {
    label: "Accesorios",
    singular: "accesorio",
  },
};

const categoryOrder = Object.keys(productCategories);

const productSizeOptions = {
  tshirts: ["S", "M", "L", "XL"],
  hoodies: ["S", "M", "L", "XL"],
  pants: ["28", "30", "32", "34", "36"],
  accessories: ["Unitalla"],
};

const legacyVisualAliases = {
  "jersey-dark": "hoodie-dark",
  "jersey-light": "hoodie-light",
};

const productVisuals = {
  "tee-dark": {
    category: "tshirts",
    label: "T-shirt negra",
    className: "tee tee-dark",
    defaultLabel: "LOYALTY",
  },
  "tee-light": {
    category: "tshirts",
    label: "T-shirt blanca",
    className: "tee tee-light",
    defaultLabel: "LOYALTY",
  },
  "hoodie-dark": {
    category: "hoodies",
    label: "Hoodie negra",
    className: "hoodie hoodie-dark",
    defaultLabel: "LVF",
  },
  "hoodie-light": {
    category: "hoodies",
    label: "Hoodie clara",
    className: "hoodie hoodie-light",
    defaultLabel: "LVF",
  },
  "pants-indigo": {
    category: "pants",
    label: "Jean indigo",
    className: "pants pants-indigo",
    defaultLabel: "",
  },
  "pants-wash": {
    category: "pants",
    label: "Jean lavado claro",
    className: "pants pants-wash",
    defaultLabel: "",
  },
  "pants-charcoal": {
    category: "pants",
    label: "Jean negro",
    className: "pants pants-charcoal",
    defaultLabel: "",
  },
  "pants-sky": {
    category: "pants",
    label: "Jean celeste",
    className: "pants pants-sky",
    defaultLabel: "",
  },
  "accessory-cap": {
    category: "accessories",
    label: "Gorra negra",
    className: "accessory accessory-cap",
    defaultLabel: "LVF",
  },
  "accessory-bag": {
    category: "accessories",
    label: "Tote crudo",
    className: "accessory accessory-bag",
    defaultLabel: "LOYALTY",
  },
  "accessory-beanie": {
    category: "accessories",
    label: "Beanie gris",
    className: "accessory accessory-beanie",
    defaultLabel: "LVF",
  },
};

const getVisualKeysForCategory = (category) =>
  Object.entries(productVisuals)
    .filter(([, metadata]) => metadata.category === category)
    .map(([key]) => key);

const getDefaultVisualForCategory = (category) => getVisualKeysForCategory(category)[0] || "tee-dark";

const resolveCategory = (category, visual = "") => {
  if (categoryOrder.includes(category)) {
    return category;
  }

  const normalizedVisual = legacyVisualAliases[visual] || visual;
  return productVisuals[normalizedVisual]?.category || "tshirts";
};

const defaultProducts = [];

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navItems = document.querySelectorAll(".nav-item.has-panel");
const newsletterForm = document.querySelector(".newsletter-form");
const formFeedback = document.querySelector(".form-feedback");
const currentYear = document.querySelector("#current-year");
const accountWrapper = document.querySelector(".account-wrapper");
const accountButton = document.querySelector(".account-button");
const accountMenu = document.querySelector("#account-menu");
const accountMenuLabel = document.querySelector("#account-menu-label");
const authLaunchButtons = document.querySelectorAll("[data-auth-open]");
const checkoutLaunchButtons = document.querySelectorAll("[data-open-checkout]");
const bagCountBadges = Array.from(document.querySelectorAll("[data-bag-count]"));
const logoutButton = document.querySelector("[data-account-logout]");
const productModalTriggers = document.querySelectorAll("[data-open-product-modal]");
const partnerToolbar = document.querySelector("#partner-toolbar");
const latestProductCount = document.querySelector("[data-latest-product-count]");
const catalogProductCount = document.querySelector("[data-catalog-product-count]");
const productGrid = document.querySelector("#product-grid");
const productCategoryGrids = Array.from(document.querySelectorAll("[data-category-grid]"));
const catalogSections = document.querySelector("#catalog-sections");
const catalogCategorySections = Array.from(document.querySelectorAll("[data-category-section]"));
const partnerOnlyElements = Array.from(document.querySelectorAll("[data-partner-only]"));
const editableElements = Array.from(document.querySelectorAll("[data-editable-key]"));
const modalBackdrops = Array.from(document.querySelectorAll(".modal-backdrop"));
const catalogNavigationLinks =
  catalogCategorySections.length === 0
    ? []
    : Array.from(document.querySelectorAll('a[href="#lo-nuevo"], a[href="#catalogo-completo"], a[href^="#catalogo-"]')).filter(
        (link) => {
          const href = link.getAttribute("href");
          return (
            href === "#lo-nuevo" ||
            href === "#catalogo-completo" ||
            catalogCategorySections.some((section) => `#${section.id}` === href)
          );
        }
      );
const catalogHashToCategory = catalogCategorySections.reduce(
  (lookup, section) => ({
    ...lookup,
    [`#${section.id}`]: section.dataset.categorySection,
  }),
  { "#lo-nuevo": "all", "#catalogo-completo": "all" }
);

const authModal = document.querySelector("#auth-modal");
const authForm = document.querySelector("#auth-form");
const authRoleLabel = document.querySelector("#auth-role-label");
const authTitle = document.querySelector("#auth-title");
const authCopy = document.querySelector("#auth-copy");
const authFeedback = document.querySelector("#auth-feedback");
const authSubmit = document.querySelector("#auth-submit");
const authToggleMode = document.querySelector("#auth-toggle-mode");
const authSwitchCopy = document.querySelector("#auth-switch-copy");
const authSwitchText = document.querySelector("#auth-switch-text");
const authNameField = document.querySelector("#auth-name-field");
const authConfirmField = document.querySelector("#auth-confirm-field");
const contentSaveBar = document.querySelector("#content-save-bar");
const contentSaveStatus = document.querySelector("#content-save-status");
const contentSaveButton = document.querySelector("#content-save-button");

const productModal = document.querySelector("#product-modal");
const productForm = document.querySelector("#product-form");
const productFeedback = document.querySelector("#product-feedback");
const productSubmit = document.querySelector("#product-submit");
const productResetButton = document.querySelector("#product-reset");
const productFrontImageInput = document.querySelector('#product-form input[name="frontImage"]');
const productBackImageInput = document.querySelector('#product-form input[name="backImage"]');
const productFrontImageDataInput = document.querySelector('#product-form input[name="frontImageData"]');
const productBackImageDataInput = document.querySelector('#product-form input[name="backImageData"]');
const productImagePreviews = {
  front: document.querySelector('[data-product-image-preview="front"]'),
  back: document.querySelector('[data-product-image-preview="back"]'),
};
const productImageEmptyStates = {
  front: document.querySelector('[data-product-image-empty="front"]'),
  back: document.querySelector('[data-product-image-empty="back"]'),
};
const pendingProductImageUpdates = {
  front: null,
  back: null,
};
const productImageTaskTokens = {
  front: null,
  back: null,
};

const quickViewModal = document.querySelector("#quick-view-modal");
const quickViewMedia = document.querySelector("#quick-view-media");
const quickViewCategory = document.querySelector("#quick-view-category");
const quickViewTitle = document.querySelector("#quick-view-title");
const quickViewPrice = document.querySelector("#quick-view-price");
const quickViewCopy = document.querySelector("#quick-view-copy");
const quickViewForm = document.querySelector("#quick-view-form");
const quickViewFeedback = document.querySelector("#quick-view-feedback");
const quickViewCheckoutButton = document.querySelector("#quick-view-checkout");
const quickViewSize = document.querySelector("#quick-view-size");
const quickViewQuantity = document.querySelector("#quick-view-quantity");
const quickViewStock = document.querySelector("#quick-view-stock");
const quickViewSubmitButton = quickViewForm?.querySelector('button[type="submit"]');

const checkoutModal = document.querySelector("#checkout-modal");
const checkoutForm = document.querySelector("#checkout-form");
const checkoutItems = document.querySelector("#checkout-items");
const checkoutEmpty = document.querySelector("#checkout-empty");
const checkoutItemCount = document.querySelector("#checkout-item-count");
const checkoutSubtotal = document.querySelector("#checkout-subtotal");
const checkoutShipping = document.querySelector("#checkout-shipping");
const checkoutTotal = document.querySelector("#checkout-total");
const checkoutFeedback = document.querySelector("#checkout-feedback");
const checkoutSubmit = document.querySelector("#checkout-submit");

const authState = {
  mode: "login",
  role: "cliente",
};
const contentEditorState = {
  pendingKeys: new Set(),
  message: "idle",
};

let activeCatalogCategory = "all";

const createId = (prefix) => {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getBackupCookieBaseName = (key) => `${STORAGE_BACKUP_PREFIX}-${key}`;
const getBackupCookieCountName = (key) => `${getBackupCookieBaseName(key)}-count`;
const getBackupCookieName = (key, chunkIndex) =>
  chunkIndex === 0 ? getBackupCookieBaseName(key) : `${getBackupCookieBaseName(key)}-${chunkIndex}`;
const readCookieValue = (name) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? match[1] : null;
};
const writeCookieValue = (name, value, maxAge = STORAGE_BACKUP_MAX_AGE) => {
  document.cookie =
    `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
};
const clearBackupCookies = (key, previousChunkCount = STORAGE_BACKUP_MAX_CHUNKS) => {
  for (let index = 0; index < previousChunkCount; index += 1) {
    writeCookieValue(getBackupCookieName(key, index), "", 0);
  }

  writeCookieValue(getBackupCookieCountName(key), "", 0);
};
const writeStorageBackup = (key, value) => {
  try {
    const serialized = encodeURIComponent(JSON.stringify(value));
    const requiredChunks = Math.ceil(serialized.length / STORAGE_BACKUP_CHUNK_SIZE) || 1;

    if (requiredChunks > STORAGE_BACKUP_MAX_CHUNKS) {
      return;
    }

    const previousChunkCount = Number.parseInt(readCookieValue(getBackupCookieCountName(key)) || "", 10);

    for (let index = 0; index < requiredChunks; index += 1) {
      const start = index * STORAGE_BACKUP_CHUNK_SIZE;
      const end = start + STORAGE_BACKUP_CHUNK_SIZE;
      const chunkValue = serialized.slice(start, end);
      writeCookieValue(getBackupCookieName(key, index), chunkValue);
    }

    if (Number.isFinite(previousChunkCount) && previousChunkCount > requiredChunks) {
      for (let index = requiredChunks; index < previousChunkCount; index += 1) {
        writeCookieValue(getBackupCookieName(key, index), "", 0);
      }
    }

    writeCookieValue(getBackupCookieCountName(key), String(requiredChunks));
  } catch (error) {
    // Ignoramos el respaldo si el navegador no permite cookies o el valor es muy grande.
  }
};
const readStorageBackup = (key) => {
  try {
    const totalChunks = Number.parseInt(readCookieValue(getBackupCookieCountName(key)) || "", 10);

    if (!Number.isFinite(totalChunks) || totalChunks < 1) {
      return null;
    }

    let serialized = "";

    for (let index = 0; index < totalChunks; index += 1) {
      const chunk = readCookieValue(getBackupCookieName(key, index));

      if (chunk === null) {
        return null;
      }

      serialized += chunk;
    }

    if (!serialized) {
      return null;
    }

    return JSON.parse(decodeURIComponent(serialized));
  } catch (error) {
    return null;
  }
};
const readStorageValue = (key) => {
  try {
    const raw = window.localStorage.getItem(key);

    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (error) {
    // Seguimos con el respaldo por cookie si localStorage falla o no tiene datos validos.
  }

  const backupValue = readStorageBackup(key);

  if (backupValue !== null) {
    try {
      window.localStorage.setItem(key, JSON.stringify(backupValue));
    } catch (error) {
      // Si no podemos hidratar localStorage, igual devolvemos el respaldo.
    }
  }

  return backupValue;
};
const readStorage = (key, fallback) => {
  const value = readStorageValue(key);
  return value === null ? fallback : value;
};
const ensureStorageValue = (key, value) => {
  if (readStorageValue(key) !== null) {
    return;
  }

  writeStorage(key, value);
};

const writeStorage = (key, value) => {
  const serialized = JSON.stringify(value);

  try {
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    // Si localStorage falla, dejamos que el respaldo intente conservar el cambio.
  }

  writeStorageBackup(key, value);
};

const collapseSpaces = (value) => value.replace(/\s+/g, " ").trim();
const formatProductCount = (count) => `${count} ${count === 1 ? "producto" : "productos"}`;
const formatCurrency = (amount) =>
  `RD$ ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const normalizeStockValue = (value, fallback = DEFAULT_PRODUCT_STOCK) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  return parsedValue;
};
const parsePriceValue = (value) => {
  const safeValue = typeof value === "string" ? value : "";
  const numericValue = safeValue.replace(/[^\d.,-]/g, "");

  if (!numericValue) {
    return 0;
  }

  const onlyDots = numericValue.includes(".") && !numericValue.includes(",");
  const onlyCommas = numericValue.includes(",") && !numericValue.includes(".");

  if (!numericValue.includes(".") && !numericValue.includes(",")) {
    return Number.parseFloat(numericValue.replace(/[^\d-]/g, "")) || 0;
  }

  if (onlyDots || onlyCommas) {
    const separator = onlyDots ? "." : ",";
    const parts = numericValue.split(separator);
    const lastGroup = parts[parts.length - 1]?.replace(/[^\d]/g, "") || "";
    const isThousandsFormat = parts.length > 2 || lastGroup.length === 3;

    if (isThousandsFormat) {
      return Number.parseFloat(parts.join("").replace(/[^\d-]/g, "")) || 0;
    }
  }

  const lastDot = numericValue.lastIndexOf(".");
  const lastComma = numericValue.lastIndexOf(",");
  const separatorIndex = Math.max(lastDot, lastComma);
  const integerPart = numericValue.slice(0, separatorIndex).replace(/[^\d-]/g, "");
  const decimalPart = numericValue.slice(separatorIndex + 1).replace(/[^\d]/g, "");
  const normalizedValue = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;

  return Number.parseFloat(normalizedValue) || 0;
};
const hasDopCurrencyMarker = (value) => /RD\$|DOP/i.test(value);
const hasUsdCurrencyMarker = (value) => /\bUSD\b/i.test(value);
const normalizeProductPriceInput = (value) => {
  const safeValue = typeof value === "string" ? collapseSpaces(value) : "";
  const amount = parsePriceValue(safeValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "";
  }

  return formatCurrency(hasUsdCurrencyMarker(safeValue) ? amount * LEGACY_USD_TO_DOP_RATE : amount);
};
const normalizeStoredProductPrice = (value) => {
  const safeValue = typeof value === "string" ? collapseSpaces(value) : "";
  const amount = parsePriceValue(safeValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    return formatCurrency(0);
  }

  const shouldConvertLegacyUsd =
    hasUsdCurrencyMarker(safeValue) || (!hasDopCurrencyMarker(safeValue) && amount < 500);

  return formatCurrency(shouldConvertLegacyUsd ? amount * LEGACY_USD_TO_DOP_RATE : amount);
};
const getSizesForCategory = (category) => productSizeOptions[resolveCategory(category)] || ["Unitalla"];
const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string" && reader.result) {
        resolve(reader.result);
        return;
      }

      reject(new Error("empty_file_result"));
    });

    reader.addEventListener("error", () => {
      reject(new Error("file_read_error"));
    });

    reader.readAsDataURL(file);
  });

const loadImageSource = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("image_load_error")));
    image.src = src;
  });

const optimizeProductImage = async (file) => {
  const rawDataUrl = await readFileAsDataUrl(file);
  const image = await loadImageSource(rawDataUrl);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const longestSide = Math.max(width, height);

  if (!longestSide || longestSide <= PRODUCT_IMAGE_MAX_DIMENSION) {
    return rawDataUrl;
  }

  const scale = PRODUCT_IMAGE_MAX_DIMENSION / longestSide;
  const nextWidth = Math.max(1, Math.round(width * scale));
  const nextHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return rawDataUrl;
  }

  canvas.width = nextWidth;
  canvas.height = nextHeight;
  context.drawImage(image, 0, 0, nextWidth, nextHeight);

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  return canvas.toDataURL(
    outputType,
    outputType === "image/png" ? undefined : PRODUCT_IMAGE_JPEG_QUALITY
  );
};

const setProductImageValue = (side, value = "") => {
  const safeValue = typeof value === "string" ? value : "";
  const hiddenInput = side === "front" ? productFrontImageDataInput : productBackImageDataInput;
  const preview = productImagePreviews[side];
  const emptyState = productImageEmptyStates[side];

  if (hiddenInput) {
    hiddenInput.value = safeValue;
  }

  if (preview) {
    preview.hidden = !safeValue;

    if (safeValue) {
      preview.src = safeValue;
    } else {
      preview.removeAttribute("src");
    }
  }

  if (emptyState) {
    emptyState.hidden = Boolean(safeValue);
  }
};

const resetProductImageState = ({ frontImage = "", backImage = "" } = {}) => {
  productImageTaskTokens.front = null;
  productImageTaskTokens.back = null;
  pendingProductImageUpdates.front = null;
  pendingProductImageUpdates.back = null;

  setProductImageValue("front", frontImage);
  setProductImageValue("back", backImage);

  if (productFrontImageInput) {
    productFrontImageInput.value = "";
  }

  if (productBackImageInput) {
    productBackImageInput.value = "";
  }
};

const processProductImageInput = (side) => {
  const input = side === "front" ? productFrontImageInput : productBackImageInput;

  if (!input) {
    return Promise.resolve("");
  }

  const [file] = input.files || [];

  if (!file) {
    return Promise.resolve("");
  }

  if (!file.type.startsWith("image/")) {
    productImageTaskTokens[side] = null;
    input.value = "";
    productFeedback.textContent = "Sube un archivo de imagen valido para la foto frontal o trasera.";
    return Promise.resolve("");
  }

  const taskToken = Symbol(side);
  const task = optimizeProductImage(file)
    .then((dataUrl) => {
      if (productImageTaskTokens[side] !== taskToken) {
        return "";
      }

      setProductImageValue(side, dataUrl);
      productFeedback.textContent = "";
      return dataUrl;
    })
    .catch(() => {
      if (productImageTaskTokens[side] !== taskToken) {
        return "";
      }

      input.value = "";
      productFeedback.textContent = "No pudimos procesar una de las fotos. Intenta con otra imagen.";
      return "";
    })
    .finally(() => {
      if (productImageTaskTokens[side] === taskToken) {
        productImageTaskTokens[side] = null;
      }

      if (pendingProductImageUpdates[side] === task) {
        pendingProductImageUpdates[side] = null;
      }
    });

  productImageTaskTokens[side] = taskToken;
  pendingProductImageUpdates[side] = task;
  return task;
};

const getEditableValue = (element) => {
  const raw = (element.innerText || element.textContent || "").trim();

  if (element.dataset.multiline === "true") {
    return raw.replace(/\n{3,}/g, "\n\n");
  }

  return collapseSpaces(raw);
};

const roleLabel = (role) => (role === "partner" ? "partner" : "cliente");
const isPartnerSession = () => state.session?.role === "partner";
const normalizePartnerEmail = (email) => {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  return LEGACY_PARTNER_EMAILS.has(normalizedEmail) ? PARTNER_ACCOUNT.email : normalizedEmail;
};
const isAuthorizedPartnerEmail = (email) => normalizePartnerEmail(email) === PARTNER_ACCOUNT.email;
const startSessionForAccount = (account) => {
  state.session = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };

  saveSession();
  updateAccountUi();
  closeModal(authModal);
  resetAuthFlow();
};
const resetAuthFlow = () => {
  authForm?.reset();
  authSubmit.disabled = false;

  if (authFeedback) {
    authFeedback.textContent = "";
  }

  applyAuthUi();
};

const syncBodyModalState = () => {
  const hasOpenModal = modalBackdrops.some((modal) => !modal.hidden);
  document.body.classList.toggle("modal-open", hasOpenModal);
};

const closePanels = (exceptItem = null) => {
  navItems.forEach((item) => {
    const shouldStayOpen = item === exceptItem;
    item.classList.toggle("is-open", shouldStayOpen);

    const trigger = item.querySelector(".nav-trigger");
    if (trigger) {
      trigger.setAttribute("aria-expanded", String(shouldStayOpen));
    }
  });
};

const closeAccountMenu = () => {
  if (!accountMenu || !accountButton) {
    return;
  }

  accountMenu.hidden = true;
  accountButton.setAttribute("aria-expanded", "false");
};

const openAccountMenu = () => {
  if (!accountMenu || !accountButton) {
    return;
  }

  accountMenu.hidden = false;
  accountButton.setAttribute("aria-expanded", "true");
};

const closeModal = (modal) => {
  if (!modal) {
    return;
  }

  modal.hidden = true;
  syncBodyModalState();
};

const openModal = (modal) => {
  if (!modal) {
    return;
  }

  modal.hidden = false;
  syncBodyModalState();

  const focusTarget = modal.querySelector("input:not([type='hidden']), select, textarea, button");
  focusTarget?.focus();
};

const closeAllModals = () => {
  modalBackdrops.forEach((modal) => {
    modal.hidden = true;
  });
  syncBodyModalState();
};

const updateContactLink = (element, value) => {
  if (!element.matches("a")) {
    return;
  }

  if (element.dataset.linkKind === "email") {
    const cleanEmail = value.replace(/\s+/g, "");
    element.setAttribute("href", `mailto:${cleanEmail}`);
  }

  if (element.dataset.linkKind === "phone") {
    const cleanPhone = value.replace(/[^\d+]/g, "");
    element.setAttribute("href", `tel:${cleanPhone}`);
  }
};

const defaultContent = editableElements.reduce((accumulator, element) => {
  accumulator[element.dataset.editableKey] = getEditableValue(element);
  return accumulator;
}, {});
const contentReplacements = {
  "note-1-tag": {
    from: "Dirección",
    to: "DIRECCIÓN",
  },
  "note-1-title": {
    from: "Minimalismo comercial, no recargado.",
    to: "Minimalismo con identidad real.",
  },
  "note-1-copy": {
    from: "El sitio prioriza producto, orden visual y espacios amplios para que la marca\nse sienta más cercana a una tienda real que a una landing genérica.",
    to: "Loyalty Vibes Forever no es solo ropa, es una actitud. Cada pieza está pensada\npara destacar sin ruido, con diseño limpio y presencia fuerte. Aquí lo simple\ntiene peso.",
  },
  "note-2-tag": {
    from: "Nuestro equipo",
    to: "NUESTRO EQUIPO",
  },
  "note-2-title": {
    from: "Una narrativa más humana y más urbana.",
    to: "Lealtad que se vive, no que se dice.",
  },
  "note-2-copy": {
    from: "La foto principal y el tono general apuntan a comunidad, campaña y cultura de\nmarca, siguiendo la referencia que compartiste.",
    to: "Nacemos de la calle, de la cultura y de la vibra real. Loyalty vibes never dies\nrepresenta a los que se mantienen firmes a lo suyo, sin cambiar por moda.",
  },
  "note-3-tag": {
    from: ["Base lista", "BASE LISTA", "Esencia"],
    to: "ESENCIA",
  },
  "note-3-title": {
    from: "Preparado para sumar e-commerce después.",
    to: "Preparado para dejar huella.",
  },
  "note-3-copy": {
    from: "La estructura ya deja espacio para filtros reales, catálogo, carrito, fichas de\nproducto y conexiones futuras con Shopify o cualquier backend.",
    to: "Cada drop está pensado para trascender. Loyalty Vibes Forever no sigue tendencias,\nlas crea. Esto es cultura, energía y lealtad convertida en piezas que duran.",
  },
};
const migrateLegacyContent = (content) => {
  const nextContent = { ...content };
  let changed = false;

  Object.entries(contentReplacements).forEach(([key, replacement]) => {
    const fromValues = Array.isArray(replacement.from) ? replacement.from : [replacement.from];

    if (fromValues.includes(nextContent[key])) {
      nextContent[key] = replacement.to;
      changed = true;
    }
  });

  return {
    content: nextContent,
    changed,
  };
};

const getLegacyProductCreatedAt = (index, total) =>
  new Date(Date.UTC(2025, 0, 1, 0, Math.max(total - index, 0), 0)).toISOString();

const removeLegacyMockupProducts = (products) => {
  if (!Array.isArray(products)) {
    return [];
  }

  return products.filter(
    (product) =>
      product &&
      typeof product === "object" &&
      (typeof product.id !== "string" || !LEGACY_MOCKUP_PRODUCT_IDS.has(product.id))
  );
};

const normalizeProducts = (products) => {
  const sourceProducts = removeLegacyMockupProducts(Array.isArray(products) ? products : defaultProducts);

  if (sourceProducts.length === 0) {
    return [];
  }

  return sourceProducts.map((product, index) => {
    const requestedVisual = legacyVisualAliases[product.visual] || product.visual;
    const safeCategory = resolveCategory(product.category, requestedVisual);
    const safeVisual =
      productVisuals[requestedVisual] && productVisuals[requestedVisual].category === safeCategory
        ? requestedVisual
        : getDefaultVisualForCategory(safeCategory);

    return {
      id: typeof product.id === "string" && product.id ? product.id : `product-${index + 1}`,
      name: typeof product.name === "string" && product.name ? product.name : `PRODUCTO ${index + 1}`,
      price: normalizeStoredProductPrice(product.price),
      label: typeof product.label === "string" ? product.label : "",
      category: safeCategory,
      visual: safeVisual,
      frontImage: typeof product.frontImage === "string" ? product.frontImage : "",
      backImage: typeof product.backImage === "string" ? product.backImage : "",
      stock: normalizeStockValue(product.stock),
      createdAt:
        typeof product.createdAt === "string" && product.createdAt
          ? product.createdAt
          : getLegacyProductCreatedAt(index, sourceProducts.length),
    };
  });
};

const normalizeCart = (items, products = defaultProducts) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item, index) => {
    if (!item || typeof item.productId !== "string") {
      return [];
    }

    const product = products.find((entry) => entry.id === item.productId);

    if (!product) {
      return [];
    }

    const quantity = Number.parseInt(item.quantity, 10);
    const safeQuantity = Number.isFinite(quantity) ? Math.min(Math.max(quantity, 1), 10) : 1;
    const sizes = getSizesForCategory(product.category);
    const safeSize =
      typeof item.size === "string" && sizes.includes(item.size) ? item.size : sizes[0];

    return [
      {
        id: typeof item.id === "string" && item.id ? item.id : `cart-${index + 1}`,
        productId: product.id,
        size: safeSize,
        quantity: safeQuantity,
        addedAt: typeof item.addedAt === "string" ? item.addedAt : new Date().toISOString(),
      },
    ];
  });
};

const normalizeAccounts = (accounts) => {
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const normalizedAccounts = safeAccounts
    .filter((account) => account && typeof account.email === "string" && typeof account.password === "string")
    .map((account) => {
      const normalizedEmail = normalizePartnerEmail(account.email);
      const isAuthorizedPartner = normalizedEmail === PARTNER_ACCOUNT.email;

      return {
        id: typeof account.id === "string" && account.id ? account.id : createId("account"),
        name:
          isAuthorizedPartner
            ? PARTNER_ACCOUNT.name
            : typeof account.name === "string" && account.name
              ? account.name
              : "Cuenta",
        email: normalizedEmail,
        password: isAuthorizedPartner ? PARTNER_ACCOUNT.password : account.password,
        role: isAuthorizedPartner && account.role === "partner" ? "partner" : "cliente",
        createdAt: account.createdAt || new Date().toISOString(),
      };
    });
  const authorizedPartnerAccount = normalizedAccounts.find(
    (account) => account.email === PARTNER_ACCOUNT.email && account.role === "partner"
  );

  if (authorizedPartnerAccount) {
    authorizedPartnerAccount.name = PARTNER_ACCOUNT.name;
    authorizedPartnerAccount.password = PARTNER_ACCOUNT.password;
    return normalizedAccounts;
  }

  return [
    ...normalizedAccounts.filter((account) => account.email !== PARTNER_ACCOUNT.email),
    {
      id: createId("account"),
      name: PARTNER_ACCOUNT.name,
      email: PARTNER_ACCOUNT.email,
      password: PARTNER_ACCOUNT.password,
      role: "partner",
      createdAt: new Date().toISOString(),
    },
  ];
};

const normalizeSession = (session) => {
  if (!session || typeof session !== "object") {
    return null;
  }

  return {
    ...session,
    email: normalizePartnerEmail(session.email),
  };
};

const defaultSession = null;
const storedAccounts = readStorageValue(STORAGE_KEYS.accounts);
const storedSession = readStorageValue(STORAGE_KEYS.session);
const storedContent = readStorageValue(STORAGE_KEYS.content);
const storedProducts = readStorageValue(STORAGE_KEYS.products);
const storedCart = readStorageValue(STORAGE_KEYS.cart);

const state = {
  accounts: normalizeAccounts(storedAccounts ?? []),
  session: normalizeSession(storedSession) ?? defaultSession,
  content: {
    ...defaultContent,
    ...(storedContent ?? {}),
  },
  products: normalizeProducts(storedProducts ?? defaultProducts),
  cart: [],
};

const migratedContentState = migrateLegacyContent(state.content);
state.content = migratedContentState.content;

state.cart = normalizeCart(storedCart ?? [], state.products);
writeStorage(STORAGE_KEYS.accounts, state.accounts);
ensureStorageValue(STORAGE_KEYS.session, state.session);
if (migratedContentState.changed) {
  writeStorage(STORAGE_KEYS.content, state.content);
} else {
  ensureStorageValue(STORAGE_KEYS.content, state.content);
}
writeStorage(STORAGE_KEYS.products, state.products);
ensureStorageValue(STORAGE_KEYS.cart, state.cart);

const findAccountByEmail = (email) =>
  state.accounts.find((account) => account.email === email.trim().toLowerCase());

const saveAccounts = () => {
  writeStorage(STORAGE_KEYS.accounts, state.accounts);
};

const saveSession = () => {
  writeStorage(STORAGE_KEYS.session, state.session);
};

const saveContent = () => {
  writeStorage(STORAGE_KEYS.content, state.content);
};

const saveProducts = () => {
  writeStorage(STORAGE_KEYS.products, state.products);
};

const saveCart = () => {
  writeStorage(STORAGE_KEYS.cart, state.cart);
};

const getProductById = (productId) => state.products.find((product) => product.id === productId);
const getProductStock = (product) => normalizeStockValue(product?.stock, 0);
const isProductSoldOut = (product) => getProductStock(product) <= 0;
const getCartQuantityForProduct = (productId) =>
  state.cart.reduce((total, item) => total + (item.productId === productId ? item.quantity : 0), 0);
const getProductCreatedAtValue = (product) => {
  const timestamp = Date.parse(product?.createdAt || "");

  if (Number.isNaN(timestamp)) {
    return 0;
  }

  return timestamp;
};
const getLatestProducts = (products, limit = HOME_PRODUCT_LIMIT) =>
  [...products]
    .sort((left, right) => getProductCreatedAtValue(right) - getProductCreatedAtValue(left))
    .slice(0, limit);

const getCartEntries = () =>
  state.cart
    .map((item) => {
      const product = getProductById(item.productId);

      if (!product) {
        return null;
      }

      const unitPrice = parsePriceValue(product.price);

      return {
        ...item,
        product,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    })
    .filter(Boolean);

const getCartItemCount = () => state.cart.reduce((total, item) => total + item.quantity, 0);
const getCheckoutStockIssue = (entries) => {
  const requestedByProduct = entries.reduce((lookup, entry) => {
    lookup[entry.product.id] = (lookup[entry.product.id] || 0) + entry.quantity;
    return lookup;
  }, {});

  return Object.entries(requestedByProduct).reduce((issue, [productId, requestedQuantity]) => {
    if (issue) {
      return issue;
    }

    const product = getProductById(productId);

    if (!product) {
      return "Uno de los artículos ya no está disponible en el catálogo.";
    }

    const stock = getProductStock(product);

    if (stock <= 0) {
      return `${product.name} está sold out.`;
    }

    if (requestedQuantity > stock) {
      return `Solo quedan ${stock} unidades de ${product.name}. Ajusta tu bolsa antes de pagar.`;
    }

    return "";
  }, "");
};

const applyContentState = () => {
  editableElements.forEach((element) => {
    const key = element.dataset.editableKey;
    const nextValue = state.content[key] ?? defaultContent[key];

    element.textContent = nextValue;
    element.classList.remove("has-pending-change");
    updateContactLink(element, nextValue);
  });
};

const applyContentSaveBarLayout = () => {
  if (!contentSaveBar || !contentSaveButton) {
    return;
  }

  const isCompactLayout = window.innerWidth <= 480;

  Object.assign(contentSaveBar.style, {
    position: "fixed",
    right: isCompactLayout ? "12px" : "18px",
    left: "auto",
    bottom: isCompactLayout ? "12px" : "18px",
    zIndex: "70",
    display: "grid",
    gridTemplateColumns: isCompactLayout ? "1fr" : "minmax(0, 1fr) auto",
    alignItems: "center",
    gap: "14px",
    width: isCompactLayout ? "min(360px, calc(100vw - 24px))" : "min(460px, calc(100vw - 24px))",
    padding: "14px 16px",
    boxSizing: "border-box",
  });

  contentSaveButton.style.width = isCompactLayout ? "100%" : "auto";
  contentSaveButton.style.whiteSpace = "nowrap";
};

const getEditableResolvedValue = (element) => {
  const key = element.dataset.editableKey;
  return getEditableValue(element) || defaultContent[key];
};

const updateContentSaveUi = () => {
  if (!contentSaveBar || !contentSaveStatus || !contentSaveButton) {
    return;
  }

  const partnerMode = isPartnerSession();
  const pendingCount = contentEditorState.pendingKeys.size;

  contentSaveBar.hidden = !partnerMode;

  if (!partnerMode) {
    contentSaveBar.classList.remove("is-pending");
    contentSaveStatus.textContent = "Edita cualquier texto y luego pulsa Guardar cambios.";
    contentSaveButton.disabled = true;
    return;
  }

  if (pendingCount > 0) {
    contentSaveBar.classList.add("is-pending");
    contentSaveStatus.textContent =
      pendingCount === 1 ? "Tienes 1 cambio pendiente." : `Tienes ${pendingCount} cambios pendientes.`;
    contentSaveButton.disabled = false;
    return;
  }

  contentSaveBar.classList.remove("is-pending");
  contentSaveStatus.textContent =
    contentEditorState.message === "saved"
      ? "Cambios guardados."
      : "Edita cualquier texto y luego pulsa Guardar cambios.";
  contentSaveButton.disabled = true;
};

const syncEditablePendingState = (element) => {
  const key = element.dataset.editableKey;
  const nextValue = getEditableResolvedValue(element);
  const currentValue = state.content[key] ?? defaultContent[key];
  const hasPendingChange = nextValue !== currentValue;

  element.classList.toggle("has-pending-change", hasPendingChange);
  updateContactLink(element, nextValue);

  if (hasPendingChange) {
    contentEditorState.pendingKeys.add(key);
    contentEditorState.message = "pending";
  } else {
    contentEditorState.pendingKeys.delete(key);

    if (contentEditorState.pendingKeys.size === 0 && contentEditorState.message !== "saved") {
      contentEditorState.message = "idle";
    }
  }

  updateContentSaveUi();
};

const discardPendingContentChanges = () => {
  contentEditorState.pendingKeys.clear();
  contentEditorState.message = "idle";
  applyContentState();
  updateContentSaveUi();
};

const savePendingContentChanges = () => {
  if (contentEditorState.pendingKeys.size === 0) {
    return;
  }

  editableElements.forEach((element) => {
    const key = element.dataset.editableKey;
    state.content[key] = getEditableResolvedValue(element);
  });

  saveContent();
  contentEditorState.pendingKeys.clear();
  contentEditorState.message = "saved";
  applyContentState();
  updateContentSaveUi();
};

const setEditableMode = (enabled) => {
  editableElements.forEach((element) => {
    if (enabled) {
      element.setAttribute("contenteditable", "true");
      element.classList.add("is-editable");
      element.setAttribute("spellcheck", "true");
      return;
    }

    element.removeAttribute("contenteditable");
    element.classList.remove("is-editable");
    element.removeAttribute("spellcheck");
  });

  if (!enabled) {
    discardPendingContentChanges();
    return;
  }

  updateContentSaveUi();
};

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.14,
          rootMargin: "0px 0px -8% 0px",
        }
      )
    : null;

const observeRevealTargets = (scope = document) => {
  const targets = scope.querySelectorAll("[data-reveal]");

  targets.forEach((item) => {
    if (item.dataset.revealBound === "true") {
      return;
    }

    item.dataset.revealBound = "true";

    if (!revealObserver) {
      item.classList.add("is-visible");
      return;
    }

    revealObserver.observe(item);
  });
};

const renderProductVisualOptions = (category, selectedVisual = "") => {
  if (!productForm) {
    return;
  }

  const visualSelect = productForm.elements.visual;
  const safeCategory = resolveCategory(category);
  const visualKeys = getVisualKeysForCategory(safeCategory);

  visualSelect.innerHTML = "";

  visualKeys.forEach((visualKey) => {
    const option = document.createElement("option");
    option.value = visualKey;
    option.textContent = productVisuals[visualKey].label;
    visualSelect.appendChild(option);
  });

  visualSelect.value = visualKeys.includes(selectedVisual) ? selectedVisual : visualKeys[0];
};

const setProductFormCategory = (category, selectedVisual = "") => {
  if (!productForm) {
    return;
  }

  const safeCategory = resolveCategory(category);
  productForm.elements.category.value = safeCategory;
  renderProductVisualOptions(safeCategory, selectedVisual);
};

const getProductSummaryCopy = (product) => {
  const categoryLabel = productCategories[product.category]?.label || "Producto";
  const sizeLabel =
    getSizesForCategory(product.category).length === 1 ? "Ajuste unitalla." : "Tallas disponibles.";
  const stock = getProductStock(product);

  if (stock <= 0) {
    return `${categoryLabel}. Este artículo está sold out en este momento.`;
  }

  if (product.label) {
    return `${categoryLabel}. Diseño ${product.label}. ${sizeLabel} Quedan ${stock} disponibles.`;
  }

  return `${categoryLabel}. ${sizeLabel} Quedan ${stock} disponibles.`;
};

const createProductStage = (product, { detail = false } = {}) => {
  const visual = productVisuals[product.visual] || productVisuals["tee-dark"];
  const frame = document.createElement("div");
  frame.className = "product-frame";

  if (detail) {
    frame.classList.add("product-frame-detail");
  }

  const frontImage = typeof product.frontImage === "string" ? product.frontImage : "";
  const backImage = typeof product.backImage === "string" ? product.backImage : "";

  if (frontImage || backImage) {
    const photoStage = document.createElement("div");
    const primaryImage = frontImage || backImage;
    const frontPhoto = document.createElement("img");

    frame.classList.add("product-frame-has-images");
    photoStage.className = "product-photo-stage";

    frontPhoto.className = `product-photo ${frontImage && backImage ? "product-photo-front-flippable" : ""}`.trim();
    frontPhoto.src = primaryImage;
    frontPhoto.alt = `${product.name} vista principal`;
    photoStage.appendChild(frontPhoto);

    if (frontImage && backImage) {
      const backPhoto = document.createElement("img");
      backPhoto.className = "product-photo product-photo-back";
      backPhoto.src = backImage;
      backPhoto.alt = `${product.name} vista trasera`;
      photoStage.appendChild(backPhoto);
    }

    frame.appendChild(photoStage);
    return frame;
  }

  const garment = document.createElement("div");
  garment.className = `garment ${visual.className}`;

  if (product.label) {
    const label = document.createElement("span");
    label.textContent = product.label;
    garment.appendChild(label);
  }

  frame.appendChild(garment);
  return frame;
};

const renderQuickViewSizes = (category, selectedSize = "") => {
  if (!quickViewSize) {
    return;
  }

  const sizes = getSizesForCategory(category);
  quickViewSize.innerHTML = "";

  sizes.forEach((size) => {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    quickViewSize.appendChild(option);
  });

  quickViewSize.value = sizes.includes(selectedSize) ? selectedSize : sizes[0];
  quickViewSize.disabled = sizes.length === 1 && sizes[0] === "Unitalla";
};

const resetQuickViewState = () => {
  quickViewForm?.reset();

  if (quickViewForm) {
    quickViewForm.elements.productId.value = "";
  }

  if (quickViewSize) {
    quickViewSize.innerHTML = "";
    quickViewSize.disabled = false;
  }

  if (quickViewMedia) {
    quickViewMedia.innerHTML = "";
  }

  if (quickViewFeedback) {
    quickViewFeedback.textContent = "";
  }

  if (quickViewStock) {
    quickViewStock.textContent = "";
    quickViewStock.classList.remove("is-sold-out");
  }

  if (quickViewQuantity) {
    quickViewQuantity.disabled = false;
    quickViewQuantity.min = "1";
    quickViewQuantity.max = "10";
    quickViewQuantity.value = "1";
  }

  if (quickViewSubmitButton) {
    quickViewSubmitButton.disabled = false;
  }

  if (quickViewCheckoutButton) {
    quickViewCheckoutButton.disabled = false;
  }
};

const renderBagCount = () => {
  const count = getCartItemCount();

  bagCountBadges.forEach((badge) => {
    badge.hidden = count === 0;
    badge.textContent = count > 99 ? "99+" : String(count);
  });
};

const createCheckoutItem = (entry) => {
  const article = document.createElement("article");
  article.className = "checkout-item";

  const head = document.createElement("div");
  head.className = "checkout-item-head";

  const title = document.createElement("h3");
  title.className = "checkout-item-title";
  title.textContent = entry.product.name;

  const total = document.createElement("strong");
  total.className = "checkout-item-total";
  total.textContent = formatCurrency(entry.lineTotal);

  head.append(title, total);

  const meta = document.createElement("div");
  meta.className = "checkout-item-meta";

  const size = document.createElement("span");
  size.textContent = `Talla ${entry.size}`;

  const quantity = document.createElement("span");
  quantity.textContent = `x${entry.quantity}`;

  const unitPrice = document.createElement("span");
  unitPrice.textContent = entry.product.price;

  meta.append(size, quantity, unitPrice);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "checkout-remove";
  removeButton.dataset.removeCartItem = entry.id;
  removeButton.textContent = "Quitar artículo";

  article.append(head, meta, removeButton);
  return article;
};

const renderCheckout = () => {
  renderBagCount();

  if (
    !checkoutItems ||
    !checkoutEmpty ||
    !checkoutItemCount ||
    !checkoutSubtotal ||
    !checkoutShipping ||
    !checkoutTotal
  ) {
    return;
  }

  const entries = getCartEntries();
  const subtotal = entries.reduce((total, entry) => total + entry.lineTotal, 0);
  const shippingAmount = entries.length > 0 ? CHECKOUT_SHIPPING_FEE : 0;
  const stockIssue = entries.length > 0 ? getCheckoutStockIssue(entries) : "";

  checkoutItems.innerHTML = "";
  checkoutItems.hidden = entries.length === 0;
  checkoutEmpty.hidden = entries.length > 0;

  entries.forEach((entry) => {
    checkoutItems.appendChild(createCheckoutItem(entry));
  });

  const itemCount = getCartItemCount();
  checkoutItemCount.textContent = `${itemCount} ${itemCount === 1 ? "artículo" : "artículos"}`;
  checkoutSubtotal.textContent = formatCurrency(subtotal);
  checkoutShipping.textContent = formatCurrency(shippingAmount);
  checkoutTotal.textContent = formatCurrency(subtotal + shippingAmount);

  if (checkoutFeedback) {
    checkoutFeedback.textContent =
      entries.length === 0 ? "Tu bolsa está vacía. Agrega un artículo para completar el pago." : stockIssue;
  }

  if (checkoutSubmit) {
    checkoutSubmit.disabled = entries.length === 0 || Boolean(stockIssue);
  }
};

const prefillCheckoutForm = () => {
  if (!checkoutForm || !state.session) {
    return;
  }

  if (!checkoutForm.elements.fullName.value) {
    checkoutForm.elements.fullName.value = state.session.name || "";
  }

  if (!checkoutForm.elements.email.value) {
    checkoutForm.elements.email.value = state.session.email || "";
  }
};

const addProductToCart = (productId, { size = "", quantity = 1 } = {}) => {
  const product = getProductById(productId);

  if (!product) {
    return {
      ok: false,
      message: "No encontramos ese producto en el catálogo actual.",
    };
  }

  const stock = getProductStock(product);

  if (stock <= 0) {
    return {
      ok: false,
      message: `${product.name} está sold out.`,
    };
  }

  const availableSizes = getSizesForCategory(product.category);
  const parsedQuantity = Number.parseInt(quantity, 10);
  const safeQuantity = Number.isFinite(parsedQuantity) ? Math.min(Math.max(parsedQuantity, 1), 10) : 1;
  const safeSize = availableSizes.includes(size) ? size : availableSizes[0];
  const existingItem = state.cart.find(
    (item) => item.productId === product.id && item.size === safeSize
  );
  const reservedInCart = getCartQuantityForProduct(product.id);
  const lineRemaining = existingItem ? Math.max(10 - existingItem.quantity, 0) : 10;
  const stockRemaining = Math.max(stock - reservedInCart, 0);
  const allowedAdditional = Math.min(safeQuantity, stockRemaining, lineRemaining);

  if (allowedAdditional <= 0) {
    return {
      ok: false,
      message:
        stockRemaining <= 0
          ? `Ya no queda stock disponible para ${product.name}.`
          : `Ya alcanzaste el máximo permitido para ${product.name} en tu bolsa.`,
    };
  }

  if (existingItem) {
    existingItem.quantity += allowedAdditional;
  } else {
    state.cart.unshift({
      id: createId("cart"),
      productId: product.id,
      size: safeSize,
      quantity: allowedAdditional,
      addedAt: new Date().toISOString(),
    });
  }

  saveCart();
  renderCheckout();

  return {
    ok: true,
    message:
      allowedAdditional < safeQuantity
        ? `Solo agregamos ${allowedAdditional} unidades de ${product.name} por stock disponible.`
        : existingItem
          ? `${product.name} ya estaba en tu bolsa y actualizamos la cantidad.`
          : `${product.name} se agregó a tu bolsa.`,
  };
};

const addQuickViewSelectionToCart = () => {
  if (!quickViewForm) {
    return false;
  }

  const productId = quickViewForm.elements.productId.value;
  const result = addProductToCart(productId, {
    size: quickViewForm.elements.size.value,
    quantity: quickViewForm.elements.quantity.value,
  });

  if (quickViewFeedback) {
    quickViewFeedback.textContent = result.message;
  }

  return result.ok;
};

const openQuickView = (productId) => {
  const product = getProductById(productId);

  if (!product || !quickViewModal || !quickViewForm || !quickViewMedia) {
    return;
  }

  resetQuickViewState();
  quickViewForm.elements.productId.value = product.id;
  renderQuickViewSizes(product.category);

  const stock = getProductStock(product);
  const reservedInCart = getCartQuantityForProduct(product.id);
  const availableToAdd = Math.max(stock - reservedInCart, 0);
  const soldOut = stock <= 0;

  if (quickViewQuantity) {
    quickViewQuantity.max = String(Math.max(1, Math.min(availableToAdd, 10)));
    quickViewQuantity.value = availableToAdd > 0 ? "1" : "0";
    quickViewQuantity.disabled = availableToAdd <= 0;
  }

  if (quickViewCategory) {
    quickViewCategory.textContent = productCategories[product.category]?.label || "Producto";
  }

  if (quickViewTitle) {
    quickViewTitle.textContent = product.name;
  }

  if (quickViewPrice) {
    quickViewPrice.textContent = product.price;
  }

  if (quickViewStock) {
    quickViewStock.textContent = soldOut ? "Sold out" : `${stock} disponibles`;
    quickViewStock.classList.toggle("is-sold-out", soldOut);
  }

  if (quickViewCopy) {
    quickViewCopy.textContent = getProductSummaryCopy(product);
  }

  if (quickViewSubmitButton) {
    quickViewSubmitButton.disabled = availableToAdd <= 0;
  }

  if (quickViewCheckoutButton) {
    quickViewCheckoutButton.disabled = availableToAdd <= 0;
  }

  if (quickViewFeedback) {
    if (soldOut) {
      quickViewFeedback.textContent = "Este producto está sold out.";
    } else if (availableToAdd <= 0) {
      quickViewFeedback.textContent = "Ya tienes en la bolsa todo el stock disponible de este artículo.";
    }
  }

  quickViewMedia.appendChild(createProductStage(product, { detail: true }));
  openModal(quickViewModal);
};

const openCheckout = () => {
  if (!checkoutModal) {
    return;
  }

  renderCheckout();
  prefillCheckoutForm();

  if (checkoutFeedback && state.cart.length === 0) {
    checkoutFeedback.textContent = "Tu bolsa está vacía. Agrega un artículo para completar el pago.";
  }

  openModal(checkoutModal);
};

const createProductCard = (product) => {
  const article = document.createElement("article");
  article.className = "product-card";
  article.setAttribute("data-reveal", "");
  article.dataset.productId = product.id;
  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute(
    "aria-label",
    isProductSoldOut(product) ? `Ver detalles de ${product.name}, sold out` : `Ver detalles de ${product.name}`
  );

  const frame = createProductStage(product);
  const stock = getProductStock(product);

  if (isProductSoldOut(product)) {
    article.classList.add("product-card-sold-out");

    const soldOutBadge = document.createElement("span");
    soldOutBadge.className = "product-frame-status product-frame-status-soldout";
    soldOutBadge.textContent = "Sold out";
    frame.appendChild(soldOutBadge);
  }

  if (isPartnerSession()) {
    const controls = document.createElement("div");
    controls.className = "product-controls";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "product-control-button";
    editButton.dataset.productEdit = product.id;
    editButton.textContent = "Editar";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "product-control-button product-control-button-danger";
    deleteButton.dataset.productDelete = product.id;
    deleteButton.textContent = "Quitar";

    controls.append(editButton, deleteButton);
    frame.appendChild(controls);
  }

  const title = document.createElement("h3");
  title.textContent = product.name;

  const price = document.createElement("p");
  price.textContent = product.price;

  const stockNote = document.createElement("p");
  stockNote.className = "product-stock-note";
  stockNote.textContent = stock <= 0 ? "Sold out" : `${stock} en stock`;

  const copy = document.createElement("div");
  copy.className = "product-card-copy";
  copy.append(title, price, stockNote);

  article.append(frame, copy);
  return article;
};

const renderHomeProducts = () => {
  if (!productGrid) {
    return;
  }

  const latestProducts = getLatestProducts(state.products, HOME_PRODUCT_LIMIT);
  productGrid.innerHTML = "";

  if (latestProducts.length === 0) {
    const emptyState = document.createElement("article");
    emptyState.className = "product-empty";
    emptyState.innerHTML = `
      <h3>Catalogo vacio</h3>
      <p>${
        isPartnerSession()
          ? 'Usa "Añadir prenda" para publicar tu primera prenda.'
          : "No hay prendas publicadas en este momento."
      }</p>
    `;
    productGrid.appendChild(emptyState);
  } else {
    latestProducts.forEach((product) => {
      productGrid.appendChild(createProductCard(product));
    });
  }

  if (latestProductCount) {
    latestProductCount.textContent = `${latestProducts.length} ${latestProducts.length === 1 ? "producto" : "productos"}`;
  }

  observeRevealTargets(productGrid);
};

const updateCategoryCount = (category, count) => {
  const countElement = document.querySelector(`[data-category-count="${category}"]`);

  if (!countElement) {
    return;
  }

  countElement.textContent = formatProductCount(count);
};

const updateVisibleProductCount = (category = activeCatalogCategory) => {
  if (!catalogProductCount) {
    return;
  }

  const count =
    category === "all"
      ? state.products.length
      : state.products.filter((product) => product.category === category).length;

  catalogProductCount.textContent = formatProductCount(count);
};

const updateCatalogNavigationState = (category = activeCatalogCategory) => {
  if (catalogNavigationLinks.length === 0) {
    return;
  }

  catalogNavigationLinks.forEach((link) => {
    const linkCategory = catalogHashToCategory[link.getAttribute("href")] || null;
    const isActive = linkCategory === category;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const setCatalogView = (category = "all", { scroll = false, targetId = "" } = {}) => {
  if (catalogCategorySections.length === 0 || !catalogSections) {
    return;
  }

  activeCatalogCategory = categoryOrder.includes(category) ? category : "all";
  catalogSections.dataset.activeCategory = activeCatalogCategory;

  catalogCategorySections.forEach((section) => {
    const shouldShow =
      activeCatalogCategory === "all" || section.dataset.categorySection === activeCatalogCategory;

    section.hidden = !shouldShow;
  });

  updateCatalogNavigationState(activeCatalogCategory);
  updateVisibleProductCount(activeCatalogCategory);

  if (!scroll) {
    return;
  }

  const resolvedTargetId =
    targetId ||
    (activeCatalogCategory === "all"
      ? "lo-nuevo"
      : catalogCategorySections.find(
          (section) => section.dataset.categorySection === activeCatalogCategory
        )?.id);

  const target = resolvedTargetId ? document.getElementById(resolvedTargetId) : null;

  if (!target) {
    return;
  }

  window.requestAnimationFrame(() => {
    target.scrollIntoView({ block: "start" });
  });
};

const syncCatalogViewFromHash = ({ scroll = false, fallbackToAll = false } = {}) => {
  if (catalogCategorySections.length === 0) {
    return;
  }

  const requestedCategory = catalogHashToCategory[window.location.hash];

  if (!requestedCategory) {
    if (fallbackToAll) {
      setCatalogView("all");
    }

    return;
  }

  setCatalogView(requestedCategory, {
    scroll,
    targetId: window.location.hash === "#lo-nuevo" ? "lo-nuevo" : window.location.hash.slice(1),
  });
};

const renderCategoryProducts = (category) => {
  const grid = productCategoryGrids.find((item) => item.dataset.categoryGrid === category);

  if (!grid) {
    return;
  }

  const products = state.products.filter((product) => product.category === category);
  const categoryMeta = productCategories[category];

  grid.innerHTML = "";

  if (products.length === 0) {
    const emptyState = document.createElement("article");
    emptyState.className = "product-empty";
    emptyState.innerHTML = `
      <h3>${categoryMeta.label} sin productos</h3>
      <p>${
        isPartnerSession()
          ? `Usa "Añadir ${categoryMeta.singular}" para publicar la primera prenda de esta sección.`
          : `No hay ${categoryMeta.label.toLowerCase()} publicadas en este momento.`
      }</p>
    `;
    grid.appendChild(emptyState);
  } else {
    products.forEach((product) => {
      grid.appendChild(createProductCard(product));
    });
  }

  updateCategoryCount(category, products.length);
  observeRevealTargets(grid);
};

const renderProducts = () => {
  if (productGrid) {
    renderHomeProducts();
  }

  if (productCategoryGrids.length > 0) {
    categoryOrder.forEach((category) => {
      renderCategoryProducts(category);
    });

    updateVisibleProductCount();
  }

  renderCheckout();
};

const resetProductForm = (defaultCategory = "tshirts") => {
  if (!productForm) {
    return;
  }

  productForm.reset();
  productForm.elements.productId.value = "";
  setProductFormCategory(defaultCategory);
  if (productForm.elements.stock) {
    productForm.elements.stock.value = String(DEFAULT_PRODUCT_STOCK);
  }
  resetProductImageState();
  productSubmit.textContent = "Guardar prenda";
  productFeedback.textContent = "";
};

const openProductEditor = (productId = "", defaultCategory = "tshirts") => {
  if (!productForm) {
    return;
  }

  resetProductForm(defaultCategory);

  const product = state.products.find((item) => item.id === productId);

  if (product) {
    productForm.elements.productId.value = product.id;
    setProductFormCategory(product.category, product.visual);
    productForm.elements.name.value = product.name;
    productForm.elements.price.value = product.price;
    productForm.elements.stock.value = String(getProductStock(product));
    productForm.elements.label.value = product.label;
    resetProductImageState({
      frontImage: product.frontImage,
      backImage: product.backImage,
    });
    productSubmit.textContent = "Guardar cambios";
  }

  openModal(productModal);
};

const updateAccountUi = () => {
  const hasSession = Boolean(state.session);
  const partnerMode = isPartnerSession();

  document.body.classList.toggle("partner-mode", partnerMode);
  accountButton?.classList.toggle("is-active-session", hasSession);

  if (partnerToolbar) {
    partnerToolbar.hidden = !partnerMode;
  }

  partnerOnlyElements.forEach((element) => {
    element.hidden = !partnerMode;
  });

  setEditableMode(partnerMode);

  const productMenuButton = document.querySelector(".account-menu [data-open-product-modal]");

  if (!hasSession) {
    if (accountMenuLabel) {
      accountMenuLabel.textContent = "Accede a tu cuenta";
    }

    authLaunchButtons.forEach((button) => {
      button.hidden = false;
    });

    if (productMenuButton) {
      productMenuButton.hidden = true;
    }

    if (logoutButton) {
      logoutButton.hidden = true;
    }

    renderProducts();
    return;
  }

  if (accountMenuLabel) {
    accountMenuLabel.textContent = `${state.session.name} · Sesión ${roleLabel(state.session.role)}`;
  }

  authLaunchButtons.forEach((button) => {
    button.hidden = true;
  });

  if (productMenuButton) {
    productMenuButton.hidden = !partnerMode;
  }

  if (logoutButton) {
    logoutButton.hidden = false;
  }

  renderProducts();
};

const applyAuthUi = () => {
  const safeMode = authState.role === "partner" ? "login" : authState.mode;
  const isPartnerAuth = authState.role === "partner";
  const partnerCopy =
    safeMode === "login"
      ? "Entra como partner para editar textos, agregar ropa y actualizar el catálogo."
      : "";
  const clientCopy =
    safeMode === "login"
      ? "Entra como cliente para guardar tu sesion y seguir tus novedades."
      : "Crea tu cuenta de cliente para iniciar sesion cuando quieras.";

  authState.mode = safeMode;
  authRoleLabel.textContent = `Cuenta ${roleLabel(authState.role)}`;
  authTitle.textContent =
    safeMode === "login"
      ? `Iniciar sesión como ${roleLabel(authState.role)}`
      : `Crear cuenta ${roleLabel(authState.role)}`;
  authCopy.textContent = authState.role === "partner" ? partnerCopy : clientCopy;
  authSubmit.textContent = safeMode === "login" ? "Iniciar sesión" : "Crear cuenta";

  authToggleMode.textContent = safeMode === "login" ? "Crear cuenta" : "Volver a iniciar sesión";
  authSwitchText.textContent = safeMode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?";

  authNameField.hidden = safeMode === "login";
  authConfirmField.hidden = safeMode === "login";
  authToggleMode.hidden = isPartnerAuth;
  authSwitchText.hidden = isPartnerAuth;

  if (authSwitchCopy) {
    authSwitchCopy.hidden = isPartnerAuth;
  }

  authForm.elements.name.required = safeMode === "register";
  authForm.elements.confirmPassword.required = safeMode === "register";
  authForm.elements.password.autocomplete = safeMode === "login" ? "current-password" : "new-password";
};

const setAuthMode = (mode) => {
  authState.mode = mode;
  applyAuthUi();
};

const openAuthModal = (role) => {
  authState.role = role === "partner" ? "partner" : "cliente";
  authState.mode = "login";
  resetAuthFlow();
  setAuthMode("login");
  closeAccountMenu();
  openModal(authModal);
};

const attachEditableListeners = () => {
  editableElements.forEach((element) => {
    element.addEventListener("focus", () => {
      element.dataset.previousValue = getEditableResolvedValue(element);
    });

    element.addEventListener("input", () => {
      if (!isPartnerSession()) {
        return;
      }

      syncEditablePendingState(element);
    });

    element.addEventListener("keydown", (event) => {
      if (!isPartnerSession()) {
        return;
      }

      if (event.key === "Enter" && element.dataset.multiline !== "true") {
        event.preventDefault();
        element.blur();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        element.textContent = element.dataset.previousValue || defaultContent[element.dataset.editableKey] || "";
        syncEditablePendingState(element);
        element.blur();
      }
    });

    element.addEventListener("blur", () => {
      if (!isPartnerSession()) {
        return;
      }

      const key = element.dataset.editableKey;
      const value = getEditableResolvedValue(element);

      element.textContent = value;
      syncEditablePendingState(element);
    });

    if (element.matches("a")) {
      element.addEventListener("click", (event) => {
        if (!isPartnerSession()) {
          return;
        }

        event.preventDefault();
        element.focus();
      });
    }
  });
};

contentSaveButton?.addEventListener("click", () => {
  savePendingContentChanges();
});

window.addEventListener("resize", () => {
  applyContentSaveBarLayout();
});

window.addEventListener("beforeunload", (event) => {
  if (contentEditorState.pendingKeys.size === 0) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
});

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navItems.forEach((item) => {
  const trigger = item.querySelector(".nav-trigger");

  if (!trigger) {
    return;
  }

  trigger.addEventListener("click", () => {
    const shouldOpen = !item.classList.contains("is-open");
    closePanels(shouldOpen ? item : null);
  });
});

if (siteNav && menuToggle) {
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
      closePanels();
    });
  });
}

catalogNavigationLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");

    if (!hash || !catalogHashToCategory[hash]) {
      return;
    }

    event.preventDefault();

    if (window.location.hash !== hash) {
      window.location.hash = hash;
      return;
    }

    setCatalogView(catalogHashToCategory[hash], {
      scroll: true,
      targetId: hash === "#lo-nuevo" ? "lo-nuevo" : hash.slice(1),
    });
  });
});

window.addEventListener("hashchange", () => {
  syncCatalogViewFromHash({ scroll: true });
});

accountButton?.addEventListener("click", (event) => {
  event.stopPropagation();

  if (accountMenu?.hidden) {
    openAccountMenu();
    return;
  }

  closeAccountMenu();
});

authLaunchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openAuthModal(button.dataset.authOpen);
  });
});

checkoutLaunchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeAccountMenu();
    openCheckout();
  });
});

productModalTriggers.forEach((button) => {
  button.addEventListener("click", () => {
    if (!isPartnerSession()) {
      openAuthModal("partner");
      return;
    }

    closeAccountMenu();
    openProductEditor("", button.dataset.defaultCategory || "tshirts");
  });
});

logoutButton?.addEventListener("click", () => {
  state.session = null;
  saveSession();
  closeAccountMenu();
  closeAllModals();
  updateAccountUi();
});

authToggleMode?.addEventListener("click", () => {
  if (authState.role === "partner") {
    return;
  }

  authFeedback.textContent = "";
  setAuthMode(authState.mode === "login" ? "register" : "login");
});

authForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = collapseSpaces(authForm.elements.name.value || "");
  const email = (authForm.elements.email.value || "").trim().toLowerCase();
  const password = authForm.elements.password.value || "";
  const confirmPassword = authForm.elements.confirmPassword.value || "";

  if (!email || !password) {
    authFeedback.textContent = "Completa tu correo y contraseña.";
    return;
  }

  if (authState.role === "partner" && authState.mode !== "login") {
    authFeedback.textContent = "La cuenta partner solo puede iniciar sesión.";
    return;
  }

  if (authState.mode === "register") {
    if (!name) {
      authFeedback.textContent = "Escribe un nombre para crear la cuenta.";
      return;
    }

    if (password.length < 4) {
      authFeedback.textContent = "La contraseña debe tener al menos 4 caracteres.";
      return;
    }

    if (password !== confirmPassword) {
      authFeedback.textContent = "La confirmación de contraseña no coincide.";
      return;
    }

    if (findAccountByEmail(email)) {
      authFeedback.textContent = "Ya existe una cuenta con ese correo.";
      return;
    }

    const newAccount = {
      id: createId("account"),
      name,
      email,
      password,
      role: authState.role,
      createdAt: new Date().toISOString(),
    };

    state.accounts.push(newAccount);
    saveAccounts();
    startSessionForAccount(newAccount);
    return;
  }

  const existingAccount = findAccountByEmail(email);

  if (!existingAccount || existingAccount.password !== password) {
    authFeedback.textContent = "Correo o contraseña incorrectos.";
    return;
  }

  if (existingAccount.role !== authState.role) {
    authFeedback.textContent = `Esta cuenta existe como ${roleLabel(existingAccount.role)}.`;
    return;
  }

  if (authState.role === "partner" && !isAuthorizedPartnerEmail(existingAccount.email)) {
    authFeedback.textContent = "Solo la cuenta partner autorizada puede entrar como socio.";
    return;
  }

  startSessionForAccount(existingAccount);
});

quickViewForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  addQuickViewSelectionToCart();
});

quickViewCheckoutButton?.addEventListener("click", () => {
  const added = addQuickViewSelectionToCart();

  if (!added) {
    return;
  }

  closeModal(quickViewModal);
  openCheckout();
});

checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const entries = getCartEntries();

  if (entries.length === 0) {
    checkoutFeedback.textContent = "Agrega al menos un artículo antes de confirmar el pago.";
    return;
  }

  const stockIssue = getCheckoutStockIssue(entries);

  if (stockIssue) {
    renderProducts();
    checkoutFeedback.textContent = stockIssue;
    return;
  }

  const fullName = collapseSpaces(checkoutForm.elements.fullName.value || "");
  const email = (checkoutForm.elements.email.value || "").trim().toLowerCase();
  const phone = collapseSpaces(checkoutForm.elements.phone.value || "");
  const address = collapseSpaces(checkoutForm.elements.address.value || "");
  const city = collapseSpaces(checkoutForm.elements.city.value || "");
  const postalCode = collapseSpaces(checkoutForm.elements.postalCode.value || "");
  const cardName = collapseSpaces(checkoutForm.elements.cardName.value || "");
  const cardNumber = (checkoutForm.elements.cardNumber.value || "").replace(/\D/g, "");
  const expiry = collapseSpaces(checkoutForm.elements.expiry.value || "");
  const cvv = (checkoutForm.elements.cvv.value || "").replace(/\D/g, "");

  if (
    !fullName ||
    !email ||
    !phone ||
    !address ||
    !city ||
    !postalCode ||
    !cardName ||
    cardNumber.length < 12 ||
    !/^\d{2}\/\d{2}$/.test(expiry) ||
    cvv.length < 3
  ) {
    checkoutFeedback.textContent =
      "Completa nombre, dirección y datos de pago válidos para procesar el pedido.";
    return;
  }

  const orderReference = createId("pedido").slice(-8).toUpperCase();
  const soldByProduct = entries.reduce((lookup, entry) => {
    lookup[entry.product.id] = (lookup[entry.product.id] || 0) + entry.quantity;
    return lookup;
  }, {});

  state.products = state.products.map((product) => {
    const soldQuantity = soldByProduct[product.id] || 0;

    if (soldQuantity === 0) {
      return product;
    }

    return {
      ...product,
      stock: Math.max(getProductStock(product) - soldQuantity, 0),
    };
  });

  saveProducts();
  state.cart = [];
  saveCart();
  renderProducts();
  renderCheckout();
  checkoutForm.reset();
  prefillCheckoutForm();
  checkoutFeedback.textContent =
    `Pago registrado. Pedido ${orderReference} listo para ${fullName} en ${city}.`;
});

productForm?.elements.category?.addEventListener("change", () => {
  setProductFormCategory(productForm.elements.category.value);
});

productFrontImageInput?.addEventListener("change", () => {
  void processProductImageInput("front");
});

productBackImageInput?.addEventListener("change", () => {
  void processProductImageInput("back");
});

productResetButton?.addEventListener("click", () => {
  const activeCategory = resolveCategory(productForm.elements.category.value);
  resetProductForm(activeCategory);
  productForm.elements.name.focus();
});

productForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isPartnerSession()) {
    closeModal(productModal);
    return;
  }

  const pendingUpdates = Object.values(pendingProductImageUpdates).filter(Boolean);

  if (pendingUpdates.length > 0) {
    productFeedback.textContent = "Estamos preparando las fotos de la prenda...";
    await Promise.allSettled(pendingUpdates);
  }

  const productId = productForm.elements.productId.value;
  const category = resolveCategory(productForm.elements.category.value);
  const availableVisuals = getVisualKeysForCategory(category);
  const requestedVisual = productForm.elements.visual.value;
  const visual = availableVisuals.includes(requestedVisual) ? requestedVisual : availableVisuals[0];
  const name = collapseSpaces(productForm.elements.name.value || "");
  const price = normalizeProductPriceInput(productForm.elements.price.value || "");
  const stock = normalizeStockValue(productForm.elements.stock.value, DEFAULT_PRODUCT_STOCK);
  const rawLabel = collapseSpaces(productForm.elements.label.value || "");
  const label = rawLabel || productVisuals[visual].defaultLabel;
  const frontImage = productFrontImageDataInput?.value || "";
  const backImage = productBackImageDataInput?.value || "";
  const existingProduct = state.products.find((product) => product.id === productId);

  if (!name || !price) {
    productFeedback.textContent = "Completa el nombre, el precio y la cantidad de stock de la prenda.";
    return;
  }

  const payload = {
    id: productId || createId("product"),
    name,
    price,
    stock,
    label,
    category,
    visual,
    frontImage,
    backImage,
    createdAt: existingProduct?.createdAt || new Date().toISOString(),
  };

  const existingIndex = state.products.findIndex((product) => product.id === payload.id);

  if (existingIndex >= 0) {
    state.products[existingIndex] = payload;
  } else {
    state.products.unshift(payload);
  }

  saveProducts();
  renderProducts();
  openProductEditor(payload.id, payload.category);
  productFeedback.textContent =
    existingIndex >= 0 ? "Prenda actualizada." : "Prenda agregada al catálogo.";
});

modalBackdrops.forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);

      if (modal === productModal) {
        resetProductForm();
      }

      if (modal === authModal) {
        resetAuthFlow();
      }

      if (modal === quickViewModal) {
        resetQuickViewState();
      }

      if (modal === checkoutModal && checkoutFeedback) {
        checkoutFeedback.textContent = "";
      }
    }
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.querySelector(`#${button.dataset.closeModal}`);
    closeModal(modal);

    if (modal === productModal) {
      resetProductForm();
    }

    if (modal === authModal) {
      resetAuthFlow();
    }

    if (modal === quickViewModal) {
      resetQuickViewState();
    }

    if (modal === checkoutModal && checkoutFeedback) {
      checkoutFeedback.textContent = "";
    }
  });
});

document.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-product-edit]");
  const deleteButton = event.target.closest("[data-product-delete]");
  const removeCartButton = event.target.closest("[data-remove-cart-item]");
  const productCard = event.target.closest(".product-card");

  if (editButton && isPartnerSession()) {
    openProductEditor(editButton.dataset.productEdit);
    return;
  }

  if (deleteButton && isPartnerSession()) {
    const productId = deleteButton.dataset.productDelete;
    const product = state.products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    const confirmed = window.confirm(`¿Quieres quitar "${product.name}" del catálogo?`);

    if (!confirmed) {
      return;
    }

    state.products = state.products.filter((item) => item.id !== productId);
    state.cart = state.cart.filter((item) => item.productId !== productId);
    saveProducts();
    saveCart();
    renderProducts();
    return;
  }

  if (removeCartButton) {
    state.cart = state.cart.filter((item) => item.id !== removeCartButton.dataset.removeCartItem);
    saveCart();
    renderCheckout();
    return;
  }

  if (productCard && !event.target.closest("[data-product-edit], [data-product-delete]")) {
    openQuickView(productCard.dataset.productId);
    return;
  }

  if (!event.target.closest(".nav-item.has-panel")) {
    closePanels();
  }

  if (
    menuToggle &&
    siteNav &&
    siteNav.classList.contains("is-open") &&
    !event.target.closest(".site-nav") &&
    !event.target.closest(".menu-toggle")
  ) {
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (accountWrapper && !event.target.closest(".account-wrapper")) {
    closeAccountMenu();
  }
});

document.addEventListener("keydown", (event) => {
  const productCard = event.target.closest?.(".product-card");

  if (productCard && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openQuickView(productCard.dataset.productId);
    return;
  }

  if (event.key !== "Escape") {
    return;
  }

  closePanels();
  closeAccountMenu();
  closeAllModals();

  if (siteNav && menuToggle) {
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  resetProductForm();
  resetQuickViewState();
  resetAuthFlow();
  if (checkoutFeedback) {
    checkoutFeedback.textContent = "";
  }
});

if (newsletterForm && formFeedback) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formFeedback.textContent =
      "Gracias. La base quedó lista para conectar este formulario con tu herramienta de email marketing.";
    newsletterForm.reset();
  });
}

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (
  state.session &&
  (
    !state.session.email ||
    !findAccountByEmail(state.session.email || "") ||
    findAccountByEmail(state.session.email || "")?.role !== state.session.role ||
    (state.session.role === "partner" && !isAuthorizedPartnerEmail(state.session.email || ""))
  )
) {
  state.session = null;
  saveSession();
}

attachEditableListeners();
applyContentState();
applyContentSaveBarLayout();
applyAuthUi();
resetProductForm();
observeRevealTargets();
updateAccountUi();
syncCatalogViewFromHash({ scroll: Boolean(window.location.hash), fallbackToAll: true });
