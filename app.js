// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCqDkYDT2RDNkYOAvUoAd8RMT7AQ37EVWg",
    authDomain: "quake-cobranzas.firebaseapp.com",
    databaseURL: "https://quake-cobranzas-default-rtdb.firebaseio.com",
    projectId: "quake-cobranzas",
    storageBucket: "quake-cobranzas.firebasestorage.app",
    messagingSenderId: "278570669788",
    appId: "1:278570669788:web:50fba7fce26e0489784619"
};

// Inicializar Firebase
console.log("🔥 Inicializando Firebase...");
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Variables globales
let currentUser = null;
let userData = null;
let companyData = null;
let cobranzas = [];
let proveedores = [];
let statusChart = null;
let currentTab = 'all';
let currentTabProv = 'all-prov';

// 🔒 BLOQUE DE SEGURIDAD - Protección F12 y DevTools
console.log("🔒 Inicializando medidas de seguridad...");

// 1. Detectar apertura de DevTools (F12)
function detectDevTools() {
    const threshold = 160; // Umbral para detectar DevTools
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
        console.warn("🚫 Acceso a DevTools detectado");
        // No hacemos nada drástico, solo registramos
        return true;
    }
    return false;
}

// 2. Bloquear tecla F12 y acceso contextual
document.addEventListener('keydown', function(e) {
    // Bloquear F12
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        console.warn("🚫 Tecla F12 bloqueada");
        showNotification('Acceso restringido para proteger la aplicación', 'warning');
        return false;
    }
    
    // Bloquear Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        console.warn("🚫 Combinación de teclas bloqueada");
        return false;
    }
    
    // Bloquear clic derecho en elementos sensibles
    if (e.ctrlKey && e.key === 'U') {
        e.preventDefault();
        console.warn("🚫 Ver código fuente bloqueado");
        return false;
    }
});

// 3. Bloquear clic derecho en toda la página
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    console.warn("🚫 Clic derecho bloqueado");
    showNotification('Acceso restringido para proteger la aplicación', 'warning');
    return false;
});

// 4. Detectar cambios de tamaño (indicador de DevTools)
let devToolsOpen = false;
setInterval(function() {
    if (detectDevTools()) {
        if (!devToolsOpen) {
            devToolsOpen = true;
            console.warn("⚠️ Herramientas de desarrollo detectadas");
            // Podrías agregar aquí una acción como cerrar sesión si quieres
        }
    } else {
        devToolsOpen = false;
    }
}, 1000);

// 5. Protección contra manipulación del DOM
Object.defineProperty(window, 'console', {
    value: console,
    writable: false,
    configurable: false
});

// 📱 BLOQUE DE OPTIMIZACIÓN PARA MÓVILES
console.log("📱 Optimizando para dispositivos móviles...");

// 1. Detectar si es dispositivo móvil
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || 
           (navigator.userAgent.indexOf('IEMobile') !== -1) ||
           (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

// 2. Optimizar eventos táctiles
function setupMobileOptimizations() {
    if (isMobileDevice()) {
        console.log("📱 Dispositivo móvil detectado, aplicando optimizaciones...");
        
        // Aumentar tamaño de botones táctiles
        document.querySelectorAll('button, .btn, .btn-icon').forEach(button => {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        });
        
        // Optimizar inputs para móviles
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.fontSize = '16px'; // Previene zoom en iOS
        });
        
        // Prevenir zoom doble tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
}

// 3. Manejo de errores específicos de móviles
window.addEventListener('error', function(e) {
    if (isMobileDevice()) {
        console.log("📱 Error en móvil:", e.error);
        // No mostrar errores técnicos al usuario en móviles
        if (e.error && e.error.message && e.error.message.includes('firebase')) {
            showNotification('Error de conexión. Verifica tu internet.', 'warning');
        }
    }
});

// 4. Optimizar rendimiento en móviles
function optimizeMobilePerformance() {
    if (isMobileDevice()) {
        // Limitar re-renderizados frecuentes
        let renderTimeout;
        const originalUpdateCobranzasUI = updateCobranzasUI;
        updateCobranzasUI = function() {
            clearTimeout(renderTimeout);
            renderTimeout = setTimeout(originalUpdateCobranzasUI, 100);
        };
        
        const originalUpdateProveedoresUI = updateProveedoresUI;
        updateProveedoresUI = function() {
            clearTimeout(renderTimeout);
            renderTimeout = setTimeout(originalUpdateProveedoresUI, 100);
        };
    }
}

// 🛡️ BLOQUE DE SEGURIDAD ADICIONAL
console.log("🛡️ Aplicando medidas de seguridad adicionales...");

// 1. Protección contra inyección de código
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#x27;')
        .replace(/"/g, '&quot;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '&#x5C;')
        .replace(/`/g, '&#x60;');
}

// 2. Validación mejorada de teléfonos
function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+58|58)?(4(1[2-9]|2[0-9]|3[0-9]|4[0-9]))-?\d{7}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
}

// 3. Detectar navegadores sospechosos
function checkBrowserSecurity() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detectar herramientas de automatización
    if (userAgent.includes('headless') || 
        userAgent.includes('phantomjs') || 
        userAgent.includes('selenium') ||
        userAgent.includes('webdriver') ||
        userAgent.includes('puppeteer')) {
        console.warn("🚫 Navegador automatizado detectado");
        return false;
    }
    
    return true;
}

// 4. Protección contra bots y scripts automatizados
let lastActionTime = Date.now();
document.addEventListener('click', function() {
    lastActionTime = Date.now();
});

document.addEventListener('keypress', function() {
    lastActionTime = Date.now();
});

// Verificar actividad humana periódicamente
setInterval(function() {
    const inactiveTime = Date.now() - lastActionTime;
    if (inactiveTime > 300000) { // 5 minutos de inactividad
        console.log("🕒 Sesión inactiva detectada");
        // Podrías agregar logout automático aquí si quieres
    }
}, 60000);

// CORRECCIÓN 1: Solo tu correo como administrador
const ADMIN_EMAIL = 'luishparedes94@gmail.com';
const ADMIN_PHONE = '+58-412-5278450';

// Elementos DOM
console.log("🔍 Inicializando elementos DOM...");
const authContainer = document.getElementById('authContainer');
const loginCard = document.getElementById('loginCard');
const registerCard = document.getElementById('registerCard');
const dashboard = document.getElementById('dashboard');
const cobranzasSection = document.getElementById('cobranzas');
const proveedoresSection = document.getElementById('proveedores');
const mensajesSection = document.getElementById('mensajes');
const empresaSection = document.getElementById('empresa');
const adminSection = document.getElementById('admin');
const userInfo = document.getElementById('userInfo');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userPlanBadge = document.getElementById('userPlanBadge');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const notificationBtn = document.getElementById('notificationBtn');
const notificationBadge = document.getElementById('notificationBadge');
const notificationCenter = document.getElementById('notificationCenter');
const closeNotifications = document.getElementById('closeNotifications');
const notificationList = document.getElementById('notificationList');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const companyForm = document.getElementById('companyForm');
const cobranzaForm = document.getElementById('cobranzaForm');
const proveedorForm = document.getElementById('proveedorForm');
const abonoForm = document.getElementById('abonoForm');
const pagoProveedorForm = document.getElementById('pagoProveedorForm');
const messageForm = document.getElementById('messageForm');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const navLinks = document.querySelectorAll('.nav-link');
const tabs = document.querySelectorAll('.tab');
const cobranzasTableBody = document.getElementById('cobranzasTableBody');
const proveedoresTableBody = document.getElementById('proveedoresTableBody');
const messagesTableBody = document.getElementById('messagesTableBody');
const usersTableBody = document.getElementById('usersTableBody');
const addCobranzaBtn = document.getElementById('addCobranzaBtn');
const addCobranzaBtn2 = document.getElementById('addCobranzaBtn2');
const addProveedorBtn = document.getElementById('addProveedorBtn');
const addProveedorBtn2 = document.getElementById('addProveedorBtn2');
const addMessageBtn = document.getElementById('addMessageBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const exportProveedoresBtn = document.getElementById('exportProveedoresBtn');
const refreshUsersBtn = document.getElementById('refreshUsersBtn');
const cobranzaModal = document.getElementById('cobranzaModal');
const proveedorModal = document.getElementById('proveedorModal');
const abonoModal = document.getElementById('abonoModal');
const pagoProveedorModal = document.getElementById('pagoProveedorModal');
const messageModal = document.getElementById('messageModal');
const reciboModal = document.getElementById('reciboModal');
const closeModals = document.querySelectorAll('.close-modal');
const freeLimitAlert = document.getElementById('freeLimitAlert');
const upgradePlanLink = document.getElementById('upgradePlanLink');
const cobranzaModalTitle = document.getElementById('cobranzaModalTitle');
const proveedorModalTitle = document.getElementById('proveedorModalTitle');
const cobranzaSubmitBtn = document.getElementById('cobranzaSubmitBtn');
const proveedorSubmitBtn = document.getElementById('proveedorSubmitBtn');
const cobranzaIdInput = document.getElementById('cobranzaId');
const proveedorIdInput = document.getElementById('proveedorId');
const printReciboBtn = document.getElementById('printReciboBtn');
const sendReciboBtn = document.getElementById('sendReciboBtn');
const connectionStatus = document.getElementById('connectionStatus');
const adminConnectionAlert = document.getElementById('adminConnectionAlert');
const copyNotification = document.getElementById('copyNotification');
const mainNav = document.getElementById('mainNav');
const messageChannel = document.getElementById('messageChannel');
const messageIcon = document.getElementById('messageIcon');
const messageText = document.getElementById('messageText');
const upcomingList = document.getElementById('upcomingList');

// CORRECCIÓN: Input de teléfono para permitir guiones
const clientPhoneInput = document.getElementById('clientPhone');
const proveedorPhoneInput = document.getElementById('proveedorPhone');

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Aplicación iniciada");
  
      // 🔒 Inicializar medidas de seguridad
    console.log("🔒 Inicializando medidas de seguridad...");
    setupMobileOptimizations();
    optimizeMobilePerformance();
    checkBrowserSecurity();
    
    // Configurar monitoreo de conexión
    setupConnectionMonitoring();
    
    // Configurar listeners de autenticación
    setupAuthListeners();
    
    // Configurar navegación para usuarios no autenticados
    setupNavigationForUnauthenticated();
    
    // Configurar cambio de ícono en mensajes
    setupMessageChannelListener();
    
    // Configurar notificaciones
    setupNotifications();
    
    // CORRECCIÓN: Configurar input de teléfono para permitir guiones
    setupPhoneInput();
    
    // Configurar modales y formularios
    setupModals();
    setupForms();
    setupTabs();
    
    // Verificar estado de autenticación
    console.log("🔐 Verificando estado de autenticación...");
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("✅ Usuario autenticado:", user.email);
            currentUser = user;
            loadUserData(user.uid);
            showApp();
        } else {
            console.log("❌ Usuario no autenticado");
            currentUser = null;
            showAuth();
        }
    });
});

// Configurar sistema de notificaciones
function setupNotifications() {
    console.log("🔔 Configurando notificaciones...");
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            notificationCenter.classList.toggle('active');
        });
    }
    
    if (closeNotifications) {
        closeNotifications.addEventListener('click', function() {
            notificationCenter.classList.remove('active');
        });
    }
    
    // Cerrar notificaciones al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (notificationCenter && !notificationCenter.contains(e.target) && notificationBtn && !notificationBtn.contains(e.target)) {
            notificationCenter.classList.remove('active');
        }
    });
}

// Mostrar notificación en el centro de notificaciones
function showNotificationInCenter(title, message, type = 'info') {
    if (!notificationList) return;
    
    const notificationItem = document.createElement('div');
    notificationItem.className = `notification-item ${type}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    notificationItem.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-time">${timeString}</div>
    `;
    
    notificationList.insertBefore(notificationItem, notificationList.firstChild);
    
    // Actualizar badge
    updateNotificationBadge();
    
    // Auto-eliminar después de 10 segundos
    setTimeout(() => {
        if (notificationItem.parentNode) {
            notificationItem.remove();
            updateNotificationBadge();
        }
    }, 10000);
}

// Actualizar badge de notificaciones
function updateNotificationBadge() {
    if (!notificationBadge || !notificationList) return;
    
    const count = notificationList.children.length;
    if (count > 0) {
        notificationBadge.textContent = count > 99 ? '99+' : count;
        notificationBadge.style.display = 'flex';
    } else {
        notificationBadge.style.display = 'none';
    }
}

// 📞 Configurar inputs de teléfono para permitir guiones (formato mejorado)
function setupPhoneInput() {
    console.log("📞 Configurando inputs de teléfono...");
    
    const phoneInputs = [clientPhoneInput, proveedorPhoneInput];
    
    phoneInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^\d]/g, ''); // Solo números
                
                // Validar que sea un número venezolano válido
                if (value.length > 0 && !value.startsWith('4')) {
                    showNotification('Los números venezolanos deben comenzar con 4', 'warning');
                    value = value.substring(1); // Remover primer carácter inválido
                }
                
                // Formato automático: 412-1234567 (solo un guión)
                if (value.length > 3 && value.length <= 10) {
                    value = value.substring(0, 3) + '-' + value.substring(3);
                }
                
                // Limitar a 11 caracteres máximo (3+1+7)
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                
                e.target.value = value;
                
                // Validar en tiempo real
                if (value.length >= 11 && !validatePhoneNumber(value)) {
                    input.style.borderColor = 'var(--danger)';
                } else {
                    input.style.borderColor = '';
                }
            });
            
            input.addEventListener('keydown', function(e) {
                // Permitir teclas de control, números y guión
                if (
                    e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
                    e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                    (e.key >= '0' && e.key <= '9') || e.key === '-'
                ) {
                    return;
                }
                e.preventDefault();
            });
            
            // Establecer placeholder de ejemplo
            input.placeholder = '412-1234567';
            
            // Agregar validación al perder foco
            input.addEventListener('blur', function() {
                if (this.value && !validatePhoneNumber(this.value)) {
                    showNotification('Número de teléfono venezolano inválido. Formato: 412-1234567', 'warning');
                    this.focus();
                }
            });
        }
    });
}

// Configurar cambio de ícono en mensajes
function setupMessageChannelListener() {
    if (messageChannel) {
        messageChannel.addEventListener('change', function() {
            const channel = this.value;
            if (channel === 'whatsapp') {
                messageIcon.className = 'fab fa-whatsapp';
                messageText.textContent = 'Enviar por WhatsApp';
            } else {
                messageIcon.className = 'fas fa-envelope';
                messageText.textContent = 'Copiar para Email';
            }
        });
    }
}

// Configurar monitoreo de conexión
function setupConnectionMonitoring() {
    console.log("🌐 Configurando monitoreo de conexión...");
    
    const databaseRef = database.ref('.info/connected');
    databaseRef.on('value', (snapshot) => {
        const connected = snapshot.val();
        if (connected) {
            connectionStatus.textContent = 'Conectado';
            connectionStatus.className = 'connection-status connection-online';
            connectionStatus.style.display = 'block';
            if (adminConnectionAlert) adminConnectionAlert.style.display = 'none';
            
            setTimeout(() => {
                connectionStatus.style.display = 'none';
            }, 3000);
        } else {
            connectionStatus.textContent = 'Sin conexión';
            connectionStatus.className = 'connection-status connection-offline';
            connectionStatus.style.display = 'block';
            if (adminConnectionAlert) adminConnectionAlert.style.display = 'flex';
        }
    });
}

// Configurar navegación para usuarios no autenticados
function setupNavigationForUnauthenticated() {
    console.log("🧭 Configurando navegación para usuarios no autenticados...");
    
    const navLinks = mainNav ? mainNav.querySelectorAll('.nav-link') : [];
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!currentUser) {
                e.preventDefault();
                showNotification('Debes iniciar sesión para acceder a esta sección', 'warning');
                if (authContainer) authContainer.style.display = 'flex';
                if (loginCard) loginCard.style.display = 'block';
                if (registerCard) registerCard.style.display = 'none';
            }
        });
    });
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    console.log(`📢 Notificación: ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(notification, container.firstChild);
    }
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Mostrar notificación de copiado
function showCopyNotification() {
    if (copyNotification) {
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 3000);
    }
}

// Copiar texto al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyNotification();
    }).catch(err => {
        console.error('Error al copiar: ', err);
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification();
    });
}

// Configurar listeners de autenticación
function setupAuthListeners() {
    console.log("🔑 Configurando listeners de autenticación...");
    
    // Switch entre login y registro
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginCard) loginCard.style.display = 'none';
            if (registerCard) registerCard.style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerCard) registerCard.style.display = 'none';
            if (loginCard) loginCard.style.display = 'block';
        });
    }

    // Formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            console.log("🔐 Intentando login...");
            
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log('✅ Usuario autenticado:', userCredential.user.email);
                    loginForm.reset();
                    showNotification('Sesión iniciada correctamente', 'success');
                })
                .catch((error) => {
                    console.error('❌ Error al iniciar sesión:', error);
                    showNotification('Error al iniciar sesión: ' + error.message, 'danger');
                });
        });
    }

    // Formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            
            console.log("📝 Intentando registro...");
            
            // CORRECCIÓN: Solo tu correo puede tener acceso administrativo
            let userPlan = 'free';
            let isAdmin = false;
            
            if (email === ADMIN_EMAIL) {
                userPlan = 'pro';
                isAdmin = true;
                console.log("👑 Usuario administrador detectado");
            }
            
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log('✅ Usuario creado en Auth:', user.email);
                    
                    return database.ref('users/' + user.uid).set({
                        email: user.email,
                        nombre: name,
                        plan: userPlan,
                        activo: true,
                        isAdmin: isAdmin,
                        fechaRegistro: new Date().toISOString()
                    });
                })
                .then(() => {
                    console.log('✅ Usuario registrado exitosamente en Database');
                    registerForm.reset();
                    if (switchToLogin) switchToLogin.click();
                    showNotification('Cuenta creada exitosamente', 'success');
                })
                .catch((error) => {
                    console.error('❌ Error al registrar usuario:', error);
                    showNotification('Error al registrar usuario: ' + error.message, 'danger');
                });
        });
    }

    // Botones de login/registro/logout
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            console.log("📱 Click en login button");
            if (authContainer) authContainer.style.display = 'flex';
            if (dashboard) dashboard.style.display = 'none';
            if (cobranzasSection) cobranzasSection.style.display = 'none';
            if (proveedoresSection) proveedoresSection.style.display = 'none';
            if (mensajesSection) mensajesSection.style.display = 'none';
            if (empresaSection) empresaSection.style.display = 'none';
            if (adminSection) adminSection.style.display = 'none';
            if (loginCard) loginCard.style.display = 'block';
            if (registerCard) registerCard.style.display = 'none';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            console.log("📱 Click en register button");
            if (authContainer) authContainer.style.display = 'flex';
            if (loginCard) loginCard.style.display = 'none';
            if (registerCard) registerCard.style.display = 'block';
            if (dashboard) dashboard.style.display = 'none';
            if (cobranzasSection) cobranzasSection.style.display = 'none';
            if (proveedoresSection) proveedoresSection.style.display = 'none';
            if (mensajesSection) mensajesSection.style.display = 'none';
            if (empresaSection) empresaSection.style.display = 'none';
            if (adminSection) adminSection.style.display = 'none';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log("🚪 Cerrando sesión...");
            auth.signOut()
                .then(() => {
                    console.log('✅ Sesión cerrada correctamente');
                    showNotification('Sesión cerrada correctamente', 'success');
                })
                .catch((error) => {
                    console.error('❌ Error al cerrar sesión:', error);
                });
        });
    }
}

// Cargar datos del usuario desde Realtime Database
function loadUserData(userId) {
    console.log("👤 Cargando datos del usuario:", userId);
    
    database.ref('users/' + userId).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                userData = snapshot.val();
                userData.userId = userId;
                console.log("✅ Datos de usuario cargados:", userData);
                
                updateUserUI();
                loadCompanyData(userId);
                loadCobranzas(userId);
                loadProveedores(userId);
                loadRecentActivity(userId);
                
                // CORRECCIÓN 2: Solo tu correo tiene acceso administrativo
                if (userData.email === ADMIN_EMAIL || userData.isAdmin) {
                    console.log("👑 Usuario es administrador, mostrando panel admin");
                    document.querySelectorAll('.admin-only').forEach(el => {
                        el.style.display = 'block';
                    });
                    loadAdminData();
                }
                
                // Mostrar botón de notificaciones
                if (notificationBtn) {
                    notificationBtn.style.display = 'flex';
                }
            } else {
                console.log("❌ No se encontraron datos de usuario");
            }
        })
        .catch((error) => {
            console.error('❌ Error al cargar datos del usuario:', error);
        });
}

// Cargar datos de la empresa
function loadCompanyData(userId) {
    console.log("🏢 Cargando datos de empresa para usuario:", userId);
    
    database.ref('empresas/' + userId).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                companyData = snapshot.val();
                companyData.userId = userId;
                console.log("✅ Datos de empresa cargados:", companyData);
                
                if (document.getElementById('companyName')) document.getElementById('companyName').value = companyData.nombre || '';
                if (document.getElementById('companyRif')) document.getElementById('companyRif').value = companyData.rif || '';
                if (document.getElementById('companyPhone')) document.getElementById('companyPhone').value = companyData.telefono || '';
                if (document.getElementById('companyEmail')) document.getElementById('companyEmail').value = companyData.email || '';
                if (document.getElementById('companyContacts')) document.getElementById('companyContacts').value = companyData.contactos || '';
            } else {
                console.log("ℹ️ No se encontraron datos de empresa");
            }
        })
        .catch((error) => {
            console.error('❌ Error al cargar datos de la empresa:', error);
        });
}

// Cargar cobranzas del usuario
function loadCobranzas(userId) {
    console.log("💰 Cargando cobranzas para usuario:", userId);
    
    database.ref('cobranzas').orderByChild('userId').equalTo(userId).on('value', (snapshot) => {
        cobranzas = [];
        snapshot.forEach((childSnapshot) => {
            const cobranza = childSnapshot.val();
            cobranza.id = childSnapshot.key;
            
            // Cargar abonos para esta cobranza
            loadAbonos(cobranza.id).then(abonos => {
                cobranza.abonos = abonos || [];
                cobranza.saldoPendiente = calcularSaldoPendiente(cobranza);
                
                // Verificar vencimientos y generar notificaciones
                checkCobranzaVencimientos(cobranza);
            });
            
            cobranzas.push(cobranza);
        });
        
        cobranzas.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
        console.log(`✅ ${cobranzas.length} cobranzas cargadas`);
        
        updateCobranzasUI();
        updateDashboardStats();
        updateUpcomingList();
        
        if (userData && userData.plan === 'free' && cobranzas.length >= 3) {
            if (freeLimitAlert) freeLimitAlert.style.display = 'flex';
        } else {
            if (freeLimitAlert) freeLimitAlert.style.display = 'none';
        }
    });
}

// Cargar proveedores del usuario
function loadProveedores(userId) {
    console.log("🚚 Cargando proveedores para usuario:", userId);
    
    database.ref('proveedores').orderByChild('userId').equalTo(userId).on('value', (snapshot) => {
        proveedores = [];
        snapshot.forEach((childSnapshot) => {
            const proveedor = childSnapshot.val();
            proveedor.id = childSnapshot.key;
            
            // Cargar pagos para este proveedor
            loadPagosProveedor(proveedor.id).then(pagos => {
                proveedor.pagos = pagos || [];
                proveedor.saldoPendiente = calcularSaldoPendienteProveedor(proveedor);
                
                // Verificar vencimientos y generar notificaciones
                checkProveedorVencimientos(proveedor);
            });
            
            proveedores.push(proveedor);
        });
        
        proveedores.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
        console.log(`✅ ${proveedores.length} proveedores cargados`);
        
        updateProveedoresUI();
        updateDashboardStats();
        updateUpcomingList();
    });
}

// Verificar vencimientos de cobranzas y generar notificaciones
function checkCobranzaVencimientos(cobranza) {
    if (cobranza.estado === 'pagado' || (cobranza.saldoPendiente && cobranza.saldoPendiente <= 0)) {
        return; // No verificar cobranzas ya pagadas
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    const dueDate = new Date(cobranza.fechaVencimiento);
    dueDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`📊 Cobranza ${cobranza.cliente}: Vence en ${diffDays} días`);
    
    // Notificar si vence en 3 días o está vencida
    if (diffDays <= 3 && diffDays >= 0) {
        showNotificationInCenter(
            'Cobranza próxima a vencer', 
            `La cobranza de ${cobranza.cliente} por $${cobranza.monto} vence en ${diffDays} día(s)`,
            diffDays === 0 ? 'danger' : 'warning'
        );
    } else if (diffDays < 0) {
        showNotificationInCenter(
            'Cobranza vencida', 
            `La cobranza de ${cobranza.cliente} por $${cobranza.monto} está vencida hace ${Math.abs(diffDays)} día(s)`,
            'danger'
        );
    }
}

// Verificar vencimientos de proveedores y generar notificaciones
function checkProveedorVencimientos(proveedor) {
    if (proveedor.estado === 'pagado' || (proveedor.saldoPendiente && proveedor.saldoPendiente <= 0)) {
        return; // No verificar proveedores ya pagados
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    const dueDate = new Date(proveedor.fechaVencimiento);
    dueDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`📊 Proveedor ${proveedor.nombre}: Vence en ${diffDays} días`);
    
    // Notificar si vence en 3 días o está vencido
    if (diffDays <= 3 && diffDays >= 0) {
        showNotificationInCenter(
            'Pago a proveedor próximo a vencer', 
            `El pago a ${proveedor.nombre} por $${proveedor.monto} vence en ${diffDays} día(s)`,
            diffDays === 0 ? 'danger' : 'warning'
        );
    } else if (diffDays < 0) {
        showNotificationInCenter(
            'Pago a proveedor vencido', 
            `El pago a ${proveedor.nombre} por $${proveedor.monto} está vencido hace ${Math.abs(diffDays)} día(s)`,
            'danger'
        );
    }
}

// Cargar pagos de proveedores
function loadPagosProveedor(proveedorId) {
    return database.ref('pagosProveedores').orderByChild('proveedorId').equalTo(proveedorId).once('value')
        .then((snapshot) => {
            const pagos = [];
            snapshot.forEach((childSnapshot) => {
                const pago = childSnapshot.val();
                pago.id = childSnapshot.key;
                pagos.push(pago);
            });
            return pagos;
        })
        .catch((error) => {
            console.error('Error al cargar pagos de proveedores:', error);
            return [];
        });
}

// Calcular saldo pendiente de proveedor
function calcularSaldoPendienteProveedor(proveedor) {
    const totalPagado = proveedor.pagos ? proveedor.pagos.reduce((sum, pago) => sum + parseFloat(pago.monto), 0) : 0;
    return parseFloat(proveedor.monto) - totalPagado;
}

// Cargar actividad reciente
function loadRecentActivity(userId) {
    console.log("📊 Cargando actividades para usuario:", userId);
    
    database.ref('actividades')
        .orderByChild('userId')
        .equalTo(userId)
        .on('value', (snapshot) => {
            const activities = [];
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            console.log('📊 Actividades encontradas en BD:', snapshot.numChildren());
            
            snapshot.forEach((childSnapshot) => {
                const activity = childSnapshot.val();
                activity.id = childSnapshot.key;
                
                const activityDate = new Date(activity.fecha);
                const isRecent = activityDate >= twentyFourHoursAgo;
                
                // Mostrar actividades de las últimas 24 horas
                if (isRecent) {
                    activities.push(activity);
                } else {
                    // Eliminar actividad antigua en segundo plano
                    database.ref('actividades/' + childSnapshot.key).remove()
                        .then(() => console.log('🗑️ Actividad antigua eliminada:', activity.descripcion))
                        .catch(error => console.error('❌ Error eliminando actividad:', error));
                }
            });
            
            console.log('🎯 Actividades a mostrar:', activities.length);
            activities.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            updateRecentActivityUI(activities);
        });
}

// Actualizar UI de actividad reciente
function updateRecentActivityUI(activities) {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) {
        console.error('❌ No se encontró el elemento recentActivity');
        return;
    }
    
    activityList.innerHTML = '';
    
    console.log('🔄 Actualizando UI con:', activities.length, 'actividades');
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <li class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Sin actividad reciente</div>
                    <div class="activity-time">Realiza alguna acción para ver actividades aquí</div>
                </div>
            </li>
        `;
        return;
    }
    
    activities.slice(0, 10).forEach(activity => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        
        let icon = 'fas fa-info-circle';
        let color = 'var(--primary)';
        
        switch(activity.tipo) {
            case 'cobranza':
                icon = 'fas fa-file-invoice-dollar';
                break;
            case 'abono':
                icon = 'fas fa-hand-holding-usd';
                color = 'var(--success)';
                break;
            case 'mensaje':
                icon = 'fas fa-envelope';
                color = 'var(--warning)';
                break;
            case 'pago':
                icon = 'fas fa-check-circle';
                color = 'var(--success)';
                break;
            case 'proveedor':
                icon = 'fas fa-truck';
                color = 'var(--secondary)';
                break;
            case 'pago_proveedor':
                icon = 'fas fa-money-bill-wave';
                color = 'var(--success)';
                break;
            case 'sistema':
                icon = 'fas fa-cog';
                color = 'var(--gray)';
                break;
        }
        
        li.innerHTML = `
            <div class="activity-icon" style="background-color: ${color}20; color: ${color};">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.descripcion}</div>
                <div class="activity-time">${formatRelativeTime(activity.fecha)}</div>
                ${activity.detalles ? `<div class="activity-details" style="font-size: 0.8rem; color: var(--gray); margin-top: 5px;">${activity.detalles}</div>` : ''}
            </div>
        `;
        
        activityList.appendChild(li);
    });
    
    console.log('✅ UI actualizada correctamente');
}

// Actualizar lista de próximos vencimientos
function updateUpcomingList() {
    if (!upcomingList) return;
    
    upcomingList.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    let upcomingItems = [];
    
    // Agregar cobranzas próximas a vencer
    cobranzas.forEach(cobranza => {
        if (cobranza.estado === 'pagado' || (cobranza.saldoPendiente && cobranza.saldoPendiente <= 0)) {
            return;
        }
        
        const dueDate = new Date(cobranza.fechaVencimiento);
        dueDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Mostrar cobranzas que vencen en los próximos 7 días
        if (diffDays >= 0 && diffDays <= 7) {
            upcomingItems.push({
                type: 'cobranza',
                title: `Cobranza: ${cobranza.cliente}`,
                amount: `$${cobranza.monto}`,
                days: diffDays,
                date: dueDate,
                item: cobranza
            });
        }
    });
    
    // Agregar pagos a proveedores próximos a vencer
    proveedores.forEach(proveedor => {
        if (proveedor.estado === 'pagado' || (proveedor.saldoPendiente && proveedor.saldoPendiente <= 0)) {
            return;
        }
        
        const dueDate = new Date(proveedor.fechaVencimiento);
        dueDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Mostrar proveedores que vencen en los próximos 7 días
        if (diffDays >= 0 && diffDays <= 7) {
            upcomingItems.push({
                type: 'proveedor',
                title: `Pago: ${proveedor.nombre}`,
                amount: `$${proveedor.monto}`,
                days: diffDays,
                date: dueDate,
                item: proveedor
            });
        }
    });
    
    // Ordenar por días más próximos
    upcomingItems.sort((a, b) => a.days - b.days);
    
    if (upcomingItems.length === 0) {
        upcomingList.innerHTML = `
            <div class="upcoming-item">
                <div class="upcoming-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="upcoming-content">
                    <div class="upcoming-title">Sin vencimientos próximos</div>
                    <div class="upcoming-time">No hay cobranzas o pagos que venzan en los próximos 7 días</div>
                </div>
            </div>
        `;
        return;
    }
    
    upcomingItems.slice(0, 5).forEach(item => {
        const div = document.createElement('div');
        div.className = 'upcoming-item';
        
        let icon = 'fas fa-file-invoice-dollar';
        let color = 'var(--warning)';
        
        if (item.type === 'proveedor') {
            icon = 'fas fa-truck';
            color = 'var(--secondary)';
        }
        
        div.innerHTML = `
            <div class="upcoming-icon" style="background-color: ${color}20; color: ${color};">
                <i class="${icon}"></i>
            </div>
            <div class="upcoming-content">
                <div class="upcoming-title">${item.title}</div>
                <div class="upcoming-time">Vence en ${item.days} día(s) - ${formatDate(item.date)}</div>
            </div>
            <div class="upcoming-amount">${item.amount}</div>
        `;
        
        upcomingList.appendChild(div);
    });
}

// Registrar actividad
function registrarActividad(tipo, descripcion, detalles = null) {
    if (!currentUser || !userData) return;
    
    const actividadData = {
        userId: currentUser.uid,
        tipo: tipo,
        descripcion: descripcion,
        detalles: detalles,
        fecha: new Date().toISOString(),
        usuario: userData.nombre
    };
    
    database.ref('actividades').push(actividadData)
        .then(() => {
            console.log('✅ Actividad registrada:', descripcion);
        })
        .catch((error) => {
            console.error('❌ Error al registrar actividad:', error);
        });
}

// Cargar abonos para una cobranza
function loadAbonos(cobranzaId) {
    return database.ref('abonos').orderByChild('cobranzaId').equalTo(cobranzaId).once('value')
        .then((snapshot) => {
            const abonos = [];
            snapshot.forEach((childSnapshot) => {
                const abono = childSnapshot.val();
                abono.id = childSnapshot.key;
                abonos.push(abono);
            });
            return abonos;
        })
        .catch((error) => {
            console.error('Error al cargar abonos:', error);
            return [];
        });
}

// Calcular saldo pendiente
function calcularSaldoPendiente(cobranza) {
    const totalAbonado = cobranza.abonos ? cobranza.abonos.reduce((sum, abono) => sum + parseFloat(abono.monto), 0) : 0;
    return parseFloat(cobranza.monto) - totalAbonado;
}

// Actualizar UI del usuario
function updateUserUI() {
    console.log("👤 Actualizando UI del usuario");
    
    if (userName) userName.textContent = userData.nombre;
    if (userAvatar) userAvatar.textContent = userData.nombre.charAt(0).toUpperCase();
    
    // Limpiar badge anterior antes de crear uno nuevo
    const existingBadge = userInfo ? userInfo.querySelector('.plan-badge') : null;
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Crear y mostrar el badge del plan
    if (userPlanBadge) {
        userPlanBadge.textContent = userData.plan === 'free' ? 'Free' : 'Pro';
        userPlanBadge.className = `plan-badge plan-${userData.plan}`;
        userPlanBadge.style.display = 'inline-block';
    }
}

// Mostrar aplicación (usuario autenticado)
function showApp() {
    console.log("🏠 Mostrando aplicación");
    
    if (authContainer) authContainer.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    if (userInfo) userInfo.style.display = 'flex';
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    
    setupNavigation();
}

// Mostrar autenticación (usuario no autenticado)
function showAuth() {
    console.log("🔐 Mostrando autenticación");
    
    if (authContainer) authContainer.style.display = 'flex';
    if (loginCard) loginCard.style.display = 'block';
    if (registerCard) registerCard.style.display = 'none';
    if (dashboard) dashboard.style.display = 'none';
    if (cobranzasSection) cobranzasSection.style.display = 'none';
    if (proveedoresSection) proveedoresSection.style.display = 'none';
    if (mensajesSection) mensajesSection.style.display = 'none';
    if (empresaSection) empresaSection.style.display = 'none';
    if (adminSection) adminSection.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (registerBtn) registerBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    
    // Ocultar todas las secciones excepto auth
    document.querySelectorAll('.dashboard, .admin-panel').forEach(section => {
        section.style.display = 'none';
    });
}

// Configurar navegación
function setupNavigation() {
    console.log("🧭 Configurando navegación");
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            if (dashboard) dashboard.style.display = 'none';
            if (cobranzasSection) cobranzasSection.style.display = 'none';
            if (proveedoresSection) proveedoresSection.style.display = 'none';
            if (mensajesSection) mensajesSection.style.display = 'none';
            if (empresaSection) empresaSection.style.display = 'none';
            if (adminSection) adminSection.style.display = 'none';
            
            const target = this.getAttribute('data-target');
            const targetElement = document.getElementById(target);
            if (targetElement) {
                targetElement.style.display = 'block';
            }
            
            if (target === 'admin') {
                loadAdminData();
            }
        });
    });
}

// Configurar modales
function setupModals() {
    console.log("📦 Configurando modales");
    
    if (addCobranzaBtn) {
        addCobranzaBtn.addEventListener('click', openCobranzaModal);
    }
    if (addCobranzaBtn2) {
        addCobranzaBtn2.addEventListener('click', openCobranzaModal);
    }
    if (addProveedorBtn) {
        addProveedorBtn.addEventListener('click', openProveedorModal);
    }
    if (addProveedorBtn2) {
        addProveedorBtn2.addEventListener('click', openProveedorModal);
    }
    if (addMessageBtn) {
        addMessageBtn.addEventListener('click', openMessageModal);
    }
    
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            if (cobranzaModal) cobranzaModal.classList.remove('active');
            if (proveedorModal) proveedorModal.classList.remove('active');
            if (abonoModal) abonoModal.classList.remove('active');
            if (pagoProveedorModal) pagoProveedorModal.classList.remove('active');
            if (messageModal) messageModal.classList.remove('active');
            if (reciboModal) reciboModal.classList.remove('active');
        });
    });
    
    window.addEventListener('click', function(e) {
        if (cobranzaModal && e.target === cobranzaModal) cobranzaModal.classList.remove('active');
        if (proveedorModal && e.target === proveedorModal) proveedorModal.classList.remove('active');
        if (abonoModal && e.target === abonoModal) abonoModal.classList.remove('active');
        if (pagoProveedorModal && e.target === pagoProveedorModal) pagoProveedorModal.classList.remove('active');
        if (messageModal && e.target === messageModal) messageModal.classList.remove('active');
        if (reciboModal && e.target === reciboModal) reciboModal.classList.remove('active');
    });
    
    if (printReciboBtn) {
        printReciboBtn.addEventListener('click', function() {
            const reciboContent = document.getElementById('reciboContent');
            if (reciboContent) {
                const reciboHTML = reciboContent.innerHTML;
                const ventana = window.open('', '_blank');
                ventana.document.write(`
                    <html>
                        <head>
                            <title>Recibo de Cobranza</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .recibo-container { max-width: 600px; margin: 0 auto; }
                            </style>
                        </head>
                        <body>
                            <div class="recibo-container">${reciboHTML}</div>
                        </body>
                    </html>
                `);
                ventana.document.close();
                ventana.print();
            }
        });
    }
}

// Configurar formularios
function setupForms() {
    console.log("📝 Configurando formularios");
    
    // Formulario de empresa
    if (companyForm) {
        companyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const companyData = {
                userId: currentUser.uid,
                nombre: document.getElementById('companyName').value,
                rif: document.getElementById('companyRif').value,
                telefono: document.getElementById('companyPhone').value,
                email: document.getElementById('companyEmail').value,
                contactos: document.getElementById('companyContacts').value,
                fechaActualizacion: new Date().toISOString()
            };
            
            database.ref('empresas/' + currentUser.uid).set(companyData)
                .then(() => {
                    showNotification('Datos de empresa guardados correctamente', 'success');
                    loadCompanyData(currentUser.uid);
                    registrarActividad('sistema', 'Datos de empresa actualizados', `Empresa: ${companyData.nombre}`);
                })
                .catch((error) => {
                    showNotification('Error al guardar datos: ' + error.message, 'danger');
                });
        });
    }
    
    // Formulario de cobranza
    let isSubmitting = false;
    
    if (cobranzaForm) {
        cobranzaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (isSubmitting) {
                showNotification('Ya se está procesando la cobranza...', 'warning');
                return;
            }
            
            if (userData.plan === 'free' && cobranzas.length >= 3 && !cobranzaIdInput.value) {
                showNotification('Has alcanzado el límite de 3 cobranzas para el plan Free. Contacta al administrador para actualizar a Pro.', 'warning');
                return;
            }
            
            // Formatear teléfono
            let telefono = document.getElementById('clientPhone').value;
            let telefonoLimpio = telefono.replace(/-/g, '');
            if (telefonoLimpio && !telefonoLimpio.startsWith('+58')) {
                telefonoLimpio = '+58' + telefonoLimpio;
            }
            
            const cobranzaData = {
                userId: currentUser.uid,
                cliente: document.getElementById('clientName').value,
                telefono: telefonoLimpio,
                email: document.getElementById('clientEmail').value,
                monto: parseFloat(document.getElementById('amount').value),
                fechaEmision: document.getElementById('issueDate').value,
                fechaVencimiento: document.getElementById('dueDate').value,
                estado: 'pendiente',
                notas: document.getElementById('notes').value,
                fechaCreacion: new Date().toISOString(),
                saldoPendiente: parseFloat(document.getElementById('amount').value)
            };
            
            isSubmitting = true;
            cobranzaSubmitBtn.disabled = true;
            cobranzaSubmitBtn.textContent = 'Guardando...';
            
            if (cobranzaIdInput.value) {
                database.ref('cobranzas/' + cobranzaIdInput.value).update(cobranzaData)
                    .then(() => {
                        showNotification('Cobranza actualizada correctamente', 'success');
                        cobranzaForm.reset();
                        cobranzaModal.classList.remove('active');
                        cobranzaIdInput.value = '';
                        cobranzaModalTitle.textContent = 'Nueva Cobranza';
                        cobranzaSubmitBtn.textContent = 'Guardar Cobranza';
                        registrarActividad('cobranza', `Cobranza actualizada - ${cobranzaData.cliente}`, `Monto: $${cobranzaData.monto}`);
                    })
                    .catch((error) => {
                        showNotification('Error al actualizar cobranza: ' + error.message, 'danger');
                    })
                    .finally(() => {
                        isSubmitting = false;
                        cobranzaSubmitBtn.disabled = false;
                    });
            } else {
                database.ref('cobranzas').push(cobranzaData)
                    .then(() => {
                        showNotification('Cobranza agregada correctamente', 'success');
                        cobranzaForm.reset();
                        cobranzaModal.classList.remove('active');
                        registrarActividad('cobranza', `Nueva cobranza creada - ${cobranzaData.cliente}`, `Monto: $${cobranzaData.monto}, Vence: ${formatDate(cobranzaData.fechaVencimiento)}`);
                    })
                    .catch((error) => {
                        showNotification('Error al agregar cobranza: ' + error.message, 'danger');
                    })
                    .finally(() => {
                        isSubmitting = false;
                        cobranzaSubmitBtn.disabled = false;
                        cobranzaSubmitBtn.textContent = 'Guardar Cobranza';
                    });
            }
        });
    }
    
    // Formulario de proveedor
    if (proveedorForm) {
        proveedorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let telefono = document.getElementById('proveedorPhone').value;
            let telefonoLimpio = telefono.replace(/-/g, '');
            if (telefonoLimpio && !telefonoLimpio.startsWith('+58')) {
                telefonoLimpio = '+58' + telefonoLimpio;
            }
            
            const proveedorData = {
                userId: currentUser.uid,
                nombre: document.getElementById('proveedorName').value,
                contacto: document.getElementById('proveedorContact').value,
                telefono: telefonoLimpio,
                email: document.getElementById('proveedorEmail').value,
                concepto: document.getElementById('proveedorConcepto').value,
                monto: parseFloat(document.getElementById('proveedorMonto').value),
                fechaEmision: document.getElementById('proveedorIssueDate').value,
                fechaVencimiento: document.getElementById('proveedorDueDate').value,
                estado: 'pendiente',
                notas: document.getElementById('proveedorNotes').value,
                fechaCreacion: new Date().toISOString(),
                saldoPendiente: parseFloat(document.getElementById('proveedorMonto').value)
            };
            
            if (proveedorIdInput.value) {
                database.ref('proveedores/' + proveedorIdInput.value).update(proveedorData)
                    .then(() => {
                        showNotification('Proveedor actualizado correctamente', 'success');
                        proveedorForm.reset();
                        proveedorModal.classList.remove('active');
                        proveedorIdInput.value = '';
                        proveedorModalTitle.textContent = 'Nuevo Proveedor';
                        registrarActividad('proveedor', `Proveedor actualizado - ${proveedorData.nombre}`, `Monto: $${proveedorData.monto}`);
                    })
                    .catch((error) => {
                        showNotification('Error al actualizar proveedor: ' + error.message, 'danger');
                    });
            } else {
                database.ref('proveedores').push(proveedorData)
                    .then(() => {
                        showNotification('Proveedor agregado correctamente', 'success');
                        proveedorForm.reset();
                        proveedorModal.classList.remove('active');
                        registrarActividad('proveedor', `Nuevo proveedor creado - ${proveedorData.nombre}`, `Monto: $${proveedorData.monto}, Vence: ${formatDate(proveedorData.fechaVencimiento)}`);
                    })
                    .catch((error) => {
                        showNotification('Error al agregar proveedor: ' + error.message, 'danger');
                    });
            }
        });
    }
    
    // Formulario de abono
    if (abonoForm) {
        abonoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cobranzaId = document.getElementById('abonoCobranzaId').value;
            const cobranza = cobranzas.find(c => c.id === cobranzaId);
            
            if (!cobranza) {
                showNotification('Cobranza no encontrada', 'danger');
                return;
            }
            
            const abonoData = {
                cobranzaId: cobranzaId,
                userId: currentUser.uid,
                monto: parseFloat(document.getElementById('abonoMonto').value),
                fecha: document.getElementById('abonoFecha').value,
                notas: document.getElementById('abonoNotas').value,
                fechaRegistro: new Date().toISOString()
            };
            
            database.ref('abonos').push(abonoData)
                .then(() => {
                    // Actualizar saldo pendiente en la cobranza
                    const nuevoSaldo = calcularSaldoPendiente(cobranza) - abonoData.monto;
                    database.ref('cobranzas/' + cobranzaId).update({
                        saldoPendiente: nuevoSaldo
                    })
                    .then(() => {
                        showNotification('Abono registrado correctamente', 'success');
                        abonoForm.reset();
                        abonoModal.classList.remove('active');
                        
                        // Registrar actividad
                        registrarActividad('abono', `Abono registrado - ${cobranza.cliente}`, `Monto: $${abonoData.monto}, Nuevo saldo: $${nuevoSaldo.toFixed(2)}`);
                        
                        // Si el saldo llega a cero, marcar como pagado
                        if (nuevoSaldo <= 0) {
                            database.ref('cobranzas/' + cobranzaId).update({
                                estado: 'pagado'
                            }).then(() => {
                                registrarActividad('pago', `Cobranza pagada completamente - ${cobranza.cliente}`);
                            });
                        }
                    });
                })
                .catch((error) => {
                    showNotification('Error al registrar abono: ' + error.message, 'danger');
                });
        });
    }
    
    // Formulario de pago a proveedor
    if (pagoProveedorForm) {
        pagoProveedorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const proveedorId = document.getElementById('pagoProveedorId').value;
            const proveedor = proveedores.find(p => p.id === proveedorId);
            
            if (!proveedor) {
                showNotification('Proveedor no encontrada', 'danger');
                return;
            }
            
            const pagoData = {
                proveedorId: proveedorId,
                userId: currentUser.uid,
                monto: parseFloat(document.getElementById('pagoMonto').value),
                fecha: document.getElementById('pagoFecha').value,
                notas: document.getElementById('pagoNotas').value,
                fechaRegistro: new Date().toISOString()
            };
            
            database.ref('pagosProveedores').push(pagoData)
                .then(() => {
                    // Actualizar saldo pendiente en el proveedor
                    const nuevoSaldo = calcularSaldoPendienteProveedor(proveedor) - pagoData.monto;
                    database.ref('proveedores/' + proveedorId).update({
                        saldoPendiente: nuevoSaldo
                    })
                    .then(() => {
                        showNotification('Pago registrado correctamente', 'success');
                        pagoProveedorForm.reset();
                        pagoProveedorModal.classList.remove('active');
                        
                        // Registrar actividad
                        registrarActividad('pago_proveedor', `Pago registrado - ${proveedor.nombre}`, `Monto: $${pagoData.monto}, Nuevo saldo: $${nuevoSaldo.toFixed(2)}`);
                        
                        // Si el saldo llega a cero, marcar como pagado
                        if (nuevoSaldo <= 0) {
                            database.ref('proveedores/' + proveedorId).update({
                                estado: 'pagado'
                            }).then(() => {
                                registrarActividad('pago', `Proveedor pagado completamente - ${proveedor.nombre}`);
                            });
                        }
                    });
                })
                .catch((error) => {
                    showNotification('Error al registrar pago: ' + error.message, 'danger');
                });
        });
    }
    
    // Formulario de mensaje
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const clientId = document.getElementById('messageClient').value;
            const client = cobranzas.find(c => c.id === clientId);
            
            if (!client) {
                showNotification('Cliente no encontrado', 'danger');
                return;
            }
            
            const messageType = document.getElementById('messageType').value;
            const messageContent = document.getElementById('messageContent').value;
            const channel = document.getElementById('messageChannel').value;
            
            const messageData = {
                userId: currentUser.uid,
                tipo: messageType,
                contenido: messageContent,
                cliente: client.cliente,
                clienteId: clientId,
                canal: channel,
                fechaEnvio: new Date().toISOString(),
                estado: 'pendiente'
            };
            
            // Enviar mensaje por WhatsApp si está seleccionado
            if (channel === 'whatsapp') {
                if (enviarWhatsApp(client, messageContent)) {
                    messageData.estado = 'enviado';
                    showNotification('Mensaje enviado por WhatsApp', 'success');
                    registrarActividad('mensaje', `Mensaje WhatsApp enviado - ${client.cliente}`, `Tipo: ${messageType}`);
                }
            } else if (channel === 'email') {
                // Copiar mensaje al portapapeles para email
                copyToClipboard(messageContent);
                showNotification('Mensaje copiado al portapapeles. Péguelo en su cliente de email.', 'success');
                registrarActividad('mensaje', `Mensaje Email preparado - ${client.cliente}`, `Tipo: ${messageType} - Mensaje copiado al portapapeles`);
            }
            
            database.ref('mensajes').push(messageData)
                .then(() => {
                    messageForm.reset();
                    messageModal.classList.remove('active');
                })
                .catch((error) => {
                    showNotification('Error al guardar mensaje: ' + error.message, 'danger');
                });
        });
        
        // Cambiar contenido del mensaje según el tipo seleccionado
        document.getElementById('messageType').addEventListener('change', function() {
            const type = this.value;
            let content = '';
            
            if (type === 'recordatorio_amable') {
                content = 'Hola {cliente}, desde {empresa} te recordamos que tu pago de {monto} vence el {vencimiento}. Contáctanos: {telefono}.';
            } else if (type === 'recordatorio_cercano') {
                content = 'Hola {cliente}, tu pago de {monto} con {empresa} vence hoy ({vencimiento}). Agradecemos tu pronta atención.';
            } else if (type === 'vencido_leve') {
                content = 'Hola {cliente}, tu pago de {monto} con {empresa} está vencido desde {vencimiento}. Por favor realiza tu pago cuanto antes.';
            } else if (type === 'ultima_advertencia') {
                content = 'Estimado {cliente}, tu pago de {monto} con {empresa} está vencido desde {vencimiento}. Esta es la última notificación antes de tomar medidas. Contáctanos: {telefono}.';
            }
            
            if (content && document.getElementById('messageClient').value) {
                const clientId = document.getElementById('messageClient').value;
                const client = cobranzas.find(c => c.id === clientId);
                
                if (client && companyData) {
                    content = content
                        .replace('{cliente}', client.cliente)
                        .replace('{empresa}', companyData.nombre)
                        .replace('{monto}', `$${client.monto}`)
                        .replace('{vencimiento}', formatDate(client.fechaVencimiento))
                        .replace('{telefono}', companyData.telefono);
                }
            }
            
            document.getElementById('messageContent').value = content;
        });
        
        document.getElementById('messageClient').addEventListener('change', function() {
            const type = document.getElementById('messageType').value;
            if (type && type !== 'personalizado') {
                document.getElementById('messageType').dispatchEvent(new Event('change'));
            }
        });
    }
}

// Configurar tabs
function setupTabs() {
    console.log("📑 Configurando tabs");
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            
            if (tabType.includes('prov')) {
                // Tabs de proveedores
                tabs.forEach(t => {
                    if (t.getAttribute('data-tab').includes('prov')) {
                        t.classList.remove('active');
                    }
                });
                this.classList.add('active');
                currentTabProv = tabType;
                updateProveedoresUI();
            } else {
                // Tabs de cobranzas
                tabs.forEach(t => {
                    if (!t.getAttribute('data-tab').includes('prov')) {
                        t.classList.remove('active');
                    }
                });
                this.classList.add('active');
                currentTab = tabType;
                updateCobranzasUI();
            }
        });
    });
}

// Abrir modal de cobranza
function openCobranzaModal() {
    if (document.getElementById('issueDate')) {
        document.getElementById('issueDate').valueAsDate = new Date();
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('dueDate').valueAsDate = dueDate;
    }
    
    if (cobranzaForm) cobranzaForm.reset();
    if (cobranzaIdInput) cobranzaIdInput.value = '';
    if (cobranzaModalTitle) cobranzaModalTitle.textContent = 'Nueva Cobranza';
    if (cobranzaSubmitBtn) {
        cobranzaSubmitBtn.textContent = 'Guardar Cobranza';
        cobranzaSubmitBtn.disabled = false;
    }
    
    if (cobranzaModal) cobranzaModal.classList.add('active');
}

// Abrir modal de proveedor
function openProveedorModal() {
    if (document.getElementById('proveedorIssueDate')) {
        document.getElementById('proveedorIssueDate').valueAsDate = new Date();
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('proveedorDueDate').valueAsDate = dueDate;
    }
    
    if (proveedorForm) proveedorForm.reset();
    if (proveedorIdInput) proveedorIdInput.value = '';
    if (proveedorModalTitle) proveedorModalTitle.textContent = 'Nuevo Proveedor';
    if (proveedorSubmitBtn) proveedorSubmitBtn.textContent = 'Guardar Proveedor';
    
    if (proveedorModal) proveedorModal.classList.add('active');
}

// Abrir modal para registrar abono
function openAbonoModal(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    if (document.getElementById('abonoCobranzaId')) {
        document.getElementById('abonoCobranzaId').value = cobranzaId;
    }
    if (document.getElementById('deudaTotal')) {
        document.getElementById('deudaTotal').textContent = cobranza.monto;
    }
    
    const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
    if (document.getElementById('abonoMonto')) {
        document.getElementById('abonoMonto').setAttribute('max', saldoPendiente);
        document.getElementById('abonoMonto').value = '';
        
        document.getElementById('abonoMonto').addEventListener('input', function() {
            const montoAbono = parseFloat(this.value) || 0;
            const nuevoSaldo = saldoPendiente - montoAbono;
            if (document.getElementById('saldoDespues')) {
                document.getElementById('saldoDespues').textContent = nuevoSaldo.toFixed(2);
            }
        });
    }
    
    if (document.getElementById('abonoFecha')) {
        document.getElementById('abonoFecha').valueAsDate = new Date();
    }
    if (document.getElementById('abonoNotas')) {
        document.getElementById('abonoNotas').value = '';
    }
    if (document.getElementById('saldoDespues')) {
        document.getElementById('saldoDespues').textContent = saldoPendiente.toFixed(2);
    }
    
    if (abonoModal) abonoModal.classList.add('active');
}

// Abrir modal para registrar pago a proveedor
function openPagoProveedorModal(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    if (document.getElementById('pagoProveedorId')) {
        document.getElementById('pagoProveedorId').value = proveedorId;
    }
    if (document.getElementById('deudaTotalProv')) {
        document.getElementById('deudaTotalProv').textContent = proveedor.monto;
    }
    
    const saldoPendiente = proveedor.saldoPendiente || calcularSaldoPendienteProveedor(proveedor);
    if (document.getElementById('pagoMonto')) {
        document.getElementById('pagoMonto').setAttribute('max', saldoPendiente);
        document.getElementById('pagoMonto').value = '';
        
        document.getElementById('pagoMonto').addEventListener('input', function() {
            const montoPago = parseFloat(this.value) || 0;
            const nuevoSaldo = saldoPendiente - montoPago;
            if (document.getElementById('saldoDespuesProv')) {
                document.getElementById('saldoDespuesProv').textContent = nuevoSaldo.toFixed(2);
            }
        });
    }
    
    if (document.getElementById('pagoFecha')) {
        document.getElementById('pagoFecha').valueAsDate = new Date();
    }
    if (document.getElementById('pagoNotas')) {
        document.getElementById('pagoNotas').value = '';
    }
    if (document.getElementById('saldoDespuesProv')) {
        document.getElementById('saldoDespuesProv').textContent = saldoPendiente.toFixed(2);
    }
    
    if (pagoProveedorModal) pagoProveedorModal.classList.add('active');
}

// Abrir modal de mensaje
function openMessageModal() {
    const clientSelect = document.getElementById('messageClient');
    if (clientSelect) {
        clientSelect.innerHTML = '<option value="">Selecciona un cliente</option>';
        
        cobranzas.forEach(cobranza => {
            const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
            if (cobranza.estado !== 'pagado' && saldoPendiente > 0) {
                const option = document.createElement('option');
                option.value = cobranza.id;
                option.textContent = `${cobranza.cliente} - $${cobranza.monto}`;
                clientSelect.appendChild(option);
            }
        });
    }
    
    if (messageModal) messageModal.classList.add('active');
}

// Abrir modal de mensaje para una cobranza específica
function openMessageModalForCobranza(cobranzaId) {
    openMessageModal();
    if (document.getElementById('messageClient')) {
        document.getElementById('messageClient').value = cobranzaId;
    }
    
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (cobranza) {
        const today = new Date();
        const dueDate = new Date(cobranza.fechaVencimiento);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let messageType = 'recordatorio_amable';
        
        if (diffDays < 0) {
            const daysOverdue = Math.abs(diffDays);
            if (daysOverdue > 15) {
                messageType = 'ultima_advertencia';
            } else {
                messageType = 'vencido_leve';
            }
        } else if (diffDays === 0) {
            messageType = 'recordatorio_cercano';
        }
        
        if (document.getElementById('messageType')) {
            document.getElementById('messageType').value = messageType;
            document.getElementById('messageType').dispatchEvent(new Event('change'));
        }
    }
}

// Enviar mensaje por WhatsApp
function enviarWhatsApp(cliente, mensaje) {
    const telefono = cliente.telefono;
    if (!telefono) {
        showNotification('El cliente no tiene número de teléfono registrado', 'warning');
        return false;
    }
    
    let telefonoLimpio = telefono.replace(/\D/g, '');
    if (telefonoLimpio.startsWith('58')) {
        telefonoLimpio = telefonoLimpio;
    } else if (telefonoLimpio.startsWith('0')) {
        telefonoLimpio = '58' + telefonoLimpio.substring(1);
    } else {
        telefonoLimpio = '58' + telefonoLimpio;
    }
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappURL = `https://web.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
    
    // SOLUCIÓN: Forzar a que use siempre la misma pestaña
    // Primero intentar cerrar cualquier pestaña anterior con ese nombre
    try {
        const ventanaAnterior = window.open('', 'WHATSAPP_FIJO');
        if (ventanaAnterior) {
            ventanaAnterior.close();
        }
    } catch (e) {
        // Ignorar errores
    }
    
    // Pequeña pausa para asegurar que se cerró
    setTimeout(() => {
        window.open(whatsappURL, 'WHATSAPP_FIJO');
    }, 100);
    
    return true;
}

// Actualizar UI de cobranzas
function updateCobranzasUI() {
    if (!cobranzasTableBody) return;
    
    cobranzasTableBody.innerHTML = '';
    
    if (cobranzas.length === 0) {
        cobranzasTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <i class="fas fa-inbox" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay cobranzas registradas</p>
                    <button class="btn btn-primary" id="addFirstCobranza" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Agregar Primera Cobranza
                    </button>
                </td>
            </tr>
        `;
        
        const addFirstBtn = document.getElementById('addFirstCobranza');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', function() {
                openCobranzaModal();
            });
        }
        
        return;
    }
    
    let filteredCobranzas = cobranzas;
    if (currentTab === 'pending') {
        filteredCobranzas = cobranzas.filter(c => c.estado === 'pendiente' && c.saldoPendiente > 0);
    } else if (currentTab === 'paid') {
        filteredCobranzas = cobranzas.filter(c => c.estado === 'pagado' || c.saldoPendiente <= 0);
    } else if (currentTab === 'overdue') {
        filteredCobranzas = cobranzas.filter(c => {
            const today = new Date();
            const dueDate = new Date(c.fechaVencimiento);
            return (c.estado !== 'pagado' && c.saldoPendiente > 0) && dueDate < today;
        });
    }
    
    if (filteredCobranzas.length === 0) {
        cobranzasTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <i class="fas fa-inbox" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay cobranzas en esta categoría</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredCobranzas.forEach(cobranza => {
        const tr = document.createElement('tr');
        
        let estado = 'pendiente';
        let estadoClass = 'status-pending';
        let estadoText = 'Pendiente';
        
        const today = new Date();
        const dueDate = new Date(cobranza.fechaVencimiento);
        const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
        
        if (cobranza.estado === 'pagado' || saldoPendiente <= 0) {
            estado = 'pagado';
            estadoClass = 'status-paid';
            estadoText = 'Pagado';
        } else if (dueDate < today) {
            estado = 'vencido';
            estadoClass = 'status-overdue';
            estadoText = 'Vencido';
        }
        
        tr.innerHTML = `
            <td>
                <strong class="clickable-name" style="color: var(--primary); cursor: pointer; text-decoration: underline;" data-id="${cobranza.id}">
                    ${cobranza.cliente}
                </strong>
                ${cobranza.abonos && cobranza.abonos.length > 0 ? 
                  `<br><small>${cobranza.abonos.length} abono(s)</small>` : ''}
            </td>
            <td>
                $${cobranza.monto}
                ${saldoPendiente < parseFloat(cobranza.monto) ? 
                  `<br><small>Saldo: $${saldoPendiente.toFixed(2)}</small>` : ''}
            </td>
            <td>${formatDate(cobranza.fechaEmision)}</td>
            <td>${formatDate(cobranza.fechaVencimiento)}</td>
            <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="Registrar abono" data-id="${cobranza.id}">
                        <i class="fas fa-hand-holding-usd" style="color: var(--success);"></i>
                    </button>
                    <button class="btn-icon" title="Ver abonos" data-id="${cobranza.id}">
                        <i class="fas fa-list" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Generar recibo" data-id="${cobranza.id}">
                        <i class="fas fa-receipt" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Enviar mensaje" data-id="${cobranza.id}">
                        <i class="fas fa-envelope" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Marcar como pagado" data-id="${cobranza.id}">
                        <i class="fas fa-check" style="color: var(--success);"></i>
                    </button>
                    <button class="btn-icon" title="Editar" data-id="${cobranza.id}">
                        <i class="fas fa-edit" style="color: var(--warning);"></i>
                    </button>
                    <button class="btn-icon" title="Eliminar" data-id="${cobranza.id}">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </div>
            </td>
        `;
        
        cobranzasTableBody.appendChild(tr);
    });
    
    document.querySelectorAll('.action-buttons .btn-icon').forEach(button => {
        button.addEventListener('click', function() {
            const cobranzaId = this.getAttribute('data-id');
            const action = this.querySelector('i').className;
            
            if (action.includes('fa-hand-holding-usd')) {
                openAbonoModal(cobranzaId);
            } else if (action.includes('fa-list')) {
                verAbonos(cobranzaId);
            } else if (action.includes('fa-check')) {
                markAsPaid(cobranzaId);
            } else if (action.includes('fa-trash')) {
                deleteCobranza(cobranzaId);
            } else if (action.includes('fa-envelope')) {
                openMessageModalForCobranza(cobranzaId);
            } else if (action.includes('fa-edit')) {
                editCobranza(cobranzaId);
            } else if (action.includes('fa-receipt')) {
                generateRecibo(cobranzaId);
            }
        });
    });

    // AGREGAR ESTO: Event listeners para los nombres clickeables de clientes
    document.querySelectorAll('.clickable-name').forEach(name => {
        name.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            mostrarFichaCliente(id);
        });
    });
}

// Mostrar ficha completa del cliente
function mostrarFichaCliente(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    // Calcular estadísticas del cliente
    const cobranzasCliente = cobranzas.filter(c => c.cliente === cobranza.cliente);
    const totalCobranzas = cobranzasCliente.length;
    const cobranzasPagadas = cobranzasCliente.filter(c => c.estado === 'pagado').length;
    const tasaPago = totalCobranzas > 0 ? (cobranzasPagadas / totalCobranzas) * 100 : 0;
    
    // Calcular totales
    const totalPrestado = cobranzasCliente.reduce((sum, c) => sum + parseFloat(c.monto), 0);
    const totalPagado = cobranzasCliente
        .filter(c => c.estado === 'pagado')
        .reduce((sum, c) => sum + parseFloat(c.monto), 0);
    
    // Formatear teléfono para mostrar
    let telefonoMostrar = cobranza.telefono || 'No registrado';
    if (telefonoMostrar.startsWith('+58')) {
        telefonoMostrar = telefonoMostrar.substring(3);
    }
    if (telefonoMostrar.length > 3) {
        telefonoMostrar = telefonoMostrar.substring(0, 3) + '-' + telefonoMostrar.substring(3);
    }
    
    const modalHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">👤 Ficha de Cliente: ${cobranza.cliente}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ficha-section">
                    <h4>📋 Información de Contacto</h4>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Teléfono:</label>
                            <span>${telefonoMostrar}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Email:</label>
                            <span>${cobranza.email || 'No registrado'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ficha-section">
                    <h4>📊 Estadísticas del Cliente</h4>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Total Cobranzas:</label>
                            <span>${totalCobranzas}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Tasa de Pago:</label>
                            <span>${tasaPago.toFixed(1)}%</span>
                        </div>
                        <div class="ficha-item">
                            <label>Total Prestado:</label>
                            <span>$${totalPrestado.toFixed(2)}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Total Pagado:</label>
                            <span>$${totalPagado.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ficha-section">
                    <h4>💰 Cobranzas Activas</h4>
                    ${cobranzasCliente.filter(c => c.estado !== 'pagado' && c.saldoPendiente > 0).length > 0 ? 
                        cobranzasCliente.filter(c => c.estado !== 'pagado' && c.saldoPendiente > 0).map(c => `
                            <div class="cobranza-activa">
                                <strong>$${c.monto}</strong> - Vence: ${formatDate(c.fechaVencimiento)}
                                <span class="status-badge ${new Date(c.fechaVencimiento) < new Date() ? 'status-overdue' : 'status-pending'}">
                                    ${new Date(c.fechaVencimiento) < new Date() ? 'Vencida' : 'Pendiente'}
                                </span>
                            </div>
                        `).join('') : 
                        '<p>No hay cobranzas activas</p>'
                    }
                </div>
                
                ${cobranza.notas ? `
                <div class="ficha-section">
                    <h4>📝 Notas</h4>
                    <p>${cobranza.notas}</p>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cerrarFicha">Cerrar</button>
                <button class="btn btn-primary" id="editarCliente" data-id="${cobranzaId}">
                    <i class="fas fa-edit"></i> Editar Cliente
                </button>
                <button class="btn btn-warning" id="enviarMensajeCliente" data-id="${cobranzaId}">
                    <i class="fas fa-envelope"></i> Enviar Mensaje
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#cerrarFicha').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#editarCliente').addEventListener('click', function() {
        modal.remove();
        editCobranza(cobranzaId);
    });
    
    modal.querySelector('#enviarMensajeCliente').addEventListener('click', function() {
        modal.remove();
        openMessageModalForCobranza(cobranzaId);
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Actualizar UI de proveedores
function updateProveedoresUI() {
    if (!proveedoresTableBody) return;
    
    proveedoresTableBody.innerHTML = '';
    
    if (proveedores.length === 0) {
        proveedoresTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px;">
                    <i class="fas fa-truck" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay proveedores registrados</p>
                    <button class="btn btn-primary" id="addFirstProveedor" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Agregar Primer Proveedor
                    </button>
                </td>
            </tr>
        `;
        
        const addFirstBtn = document.getElementById('addFirstProveedor');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', function() {
                openProveedorModal();
            });
        }
        
        return;
    }
    
    let filteredProveedores = proveedores;
    if (currentTabProv === 'pending-prov') {
        filteredProveedores = proveedores.filter(p => p.estado === 'pendiente' && p.saldoPendiente > 0);
    } else if (currentTabProv === 'paid-prov') {
        filteredProveedores = proveedores.filter(p => p.estado === 'pagado' || p.saldoPendiente <= 0);
    } else if (currentTabProv === 'overdue-prov') {
        filteredProveedores = proveedores.filter(p => {
            const today = new Date();
            const dueDate = new Date(p.fechaVencimiento);
            return (p.estado !== 'pagado' && p.saldoPendiente > 0) && dueDate < today;
        });
    }
    
    if (filteredProveedores.length === 0) {
        proveedoresTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px;">
                    <i class="fas fa-truck" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay proveedores en esta categoría</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredProveedores.forEach(proveedor => {
        const tr = document.createElement('tr');
        
        let estado = 'pendiente';
        let estadoClass = 'status-pending';
        let estadoText = 'Pendiente';
        
        const today = new Date();
        const dueDate = new Date(proveedor.fechaVencimiento);
        const saldoPendiente = proveedor.saldoPendiente || calcularSaldoPendienteProveedor(proveedor);
        
        if (proveedor.estado === 'pagado' || saldoPendiente <= 0) {
            estado = 'pagado';
            estadoClass = 'status-paid';
            estadoText = 'Pagado';
        } else if (dueDate < today) {
            estado = 'vencido';
            estadoClass = 'status-overdue';
            estadoText = 'Vencido';
        }
        
        tr.innerHTML = `
            <td>
                <strong class="clickable-proveedor" style="color: var(--primary); cursor: pointer; text-decoration: underline;" data-id="${proveedor.id}">
                    ${proveedor.nombre}
                </strong>
                ${proveedor.contacto ? `<br><small>${proveedor.contacto}</small>` : ''}
            </td>
            <td>${proveedor.concepto}</td>
            <td>
                $${proveedor.monto}
                ${saldoPendiente < parseFloat(proveedor.monto) ? 
                  `<br><small>Saldo: $${saldoPendiente.toFixed(2)}</small>` : ''}
            </td>
            <td>${formatDate(proveedor.fechaEmision)}</td>
            <td>${formatDate(proveedor.fechaVencimiento)}</td>
            <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="Registrar pago" data-id="${proveedor.id}">
                        <i class="fas fa-money-bill-wave" style="color: var(--success);"></i>
                    </button>
                    <button class="btn-icon" title="Ver pagos" data-id="${proveedor.id}">
                        <i class="fas fa-list" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Marcar como pagado" data-id="${proveedor.id}">
                        <i class="fas fa-check" style="color: var(--success);"></i>
                    </button>
                    <button class="btn-icon" title="Editar" data-id="${proveedor.id}">
                        <i class="fas fa-edit" style="color: var(--warning);"></i>
                    </button>
                    <button class="btn-icon" title="Eliminar" data-id="${proveedor.id}">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </div>
            </td>
        `;
        
        proveedoresTableBody.appendChild(tr);
    });
    
    document.querySelectorAll('#proveedoresTableBody .action-buttons .btn-icon').forEach(button => {
        button.addEventListener('click', function() {
            const proveedorId = this.getAttribute('data-id');
            const action = this.querySelector('i').className;
            
            if (action.includes('fa-money-bill-wave')) {
                openPagoProveedorModal(proveedorId);
            } else if (action.includes('fa-list')) {
                verPagosProveedor(proveedorId);
            } else if (action.includes('fa-check')) {
                markProveedorAsPaid(proveedorId);
            } else if (action.includes('fa-trash')) {
                deleteProveedor(proveedorId);
            } else if (action.includes('fa-edit')) {
                editProveedor(proveedorId);
            }
        });
    });

    // AGREGAR ESTO: Event listeners para los nombres clickeables de proveedores
    document.querySelectorAll('.clickable-proveedor').forEach(name => {
        name.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            mostrarFichaProveedor(id);
        });
    });
}

// Ver abonos de una cobranza
function verAbonos(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    let abonosHTML = '';
    if (cobranza.abonos && cobranza.abonos.length > 0) {
        cobranza.abonos.forEach(abono => {
            abonosHTML += `
                <div class="abono-item">
                    <div class="abono-info">
                        <strong>$${abono.monto}</strong>
                        <div class="abono-fecha">${formatDate(abono.fecha)}</div>
                        ${abono.notas ? `<small>${abono.notas}</small>` : ''}
                    </div>
                </div>
            `;
        });
    } else {
        abonosHTML = '<p>No hay abonos registrados</p>';
    }
    
    const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
    
    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Abonos - ${cobranza.cliente}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div>
                <p><strong>Deuda total:</strong> $${cobranza.monto}</p>
                <p><strong>Total abonado:</strong> $${(parseFloat(cobranza.monto) - saldoPendiente).toFixed(2)}</p>
                <p><strong>Saldo pendiente:</strong> $${saldoPendiente.toFixed(2)}</p>
                
                <div class="abonos-section">
                    <h4>Historial de Abonos</h4>
                    ${abonosHTML}
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-primary" id="addAbonoFromList" data-id="${cobranzaId}">
                        <i class="fas fa-plus"></i> Agregar Abono
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#addAbonoFromList').addEventListener('click', function() {
        modal.remove();
        openAbonoModal(cobranzaId);
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Ver pagos de un proveedor
function mostrarFichaProveedor(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    // Calcular estadísticas del proveedor
    const proveedoresMismo = proveedores.filter(p => p.nombre === proveedor.nombre);
    const totalProveedores = proveedoresMismo.length;
    const proveedoresPagados = proveedoresMismo.filter(p => p.estado === 'pagado').length;
    const tasaPago = totalProveedores > 0 ? (proveedoresPagados / totalProveedores) * 100 : 0;
    
    // Calcular totales
    const totalFacturado = proveedoresMismo.reduce((sum, p) => sum + parseFloat(p.monto), 0);
    const totalPagado = proveedoresMismo
        .filter(p => p.estado === 'pagado')
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);
    
    // Formatear teléfono para mostrar
    let telefonoMostrar = proveedor.telefono || 'No registrado';
    if (telefonoMostrar.startsWith('+58')) {
        telefonoMostrar = telefonoMostrar.substring(3);
    }
    if (telefonoMostrar.length > 3) {
        telefonoMostrar = telefonoMostrar.substring(0, 3) + '-' + telefonoMostrar.substring(3);
    }
    
    const modalHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">🏢 Ficha de Proveedor: ${proveedor.nombre}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ficha-section">
                    <h4>📋 Información de Contacto</h4>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Contacto:</label>
                            <span>${proveedor.contacto || 'No registrado'}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Teléfono:</label>
                            <span>${telefonoMostrar}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Email:</label>
                            <span>${proveedor.email || 'No registrado'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ficha-section">
                    <h4>📊 Estadísticas del Proveedor</h4>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Total Facturas:</label>
                            <span>${totalProveedores}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Tasa de Pago:</label>
                            <span>${tasaPago.toFixed(1)}%</span>
                        </div>
                        <div class="ficha-item">
                            <label>Total Facturado:</label>
                            <span>$${totalFacturado.toFixed(2)}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Total Pagado:</label>
                            <span>$${totalPagado.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ficha-section">
                    <h4>📦 Servicios/Productos</h4>
                    <p><strong>Concepto:</strong> ${proveedor.concepto || 'No especificado'}</p>
                </div>
                
                <div class="ficha-section">
                    <h4>💰 Facturas Pendientes</h4>
                    ${proveedoresMismo.filter(p => p.estado !== 'pagado' && p.saldoPendiente > 0).length > 0 ? 
                        proveedoresMismo.filter(p => p.estado !== 'pagado' && p.saldoPendiente > 0).map(p => `
                            <div class="proveedor-pendiente">
                                <strong>$${p.monto}</strong> - Vence: ${formatDate(p.fechaVencimiento)}
                                <span class="status-badge ${new Date(p.fechaVencimiento) < new Date() ? 'status-overdue' : 'status-pending'}">
                                    ${new Date(p.fechaVencimiento) < new Date() ? 'Vencida' : 'Pendiente'}
                                </span>
                            </div>
                        `).join('') : 
                        '<p>No hay facturas pendientes</p>'
                    }
                </div>
                
                ${proveedor.notas ? `
                <div class="ficha-section">
                    <h4>📝 Notas</h4>
                    <p>${proveedor.notas}</p>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cerrarFichaProv">Cerrar</button>
                <button class="btn btn-primary" id="editarProveedor" data-id="${proveedorId}">
                    <i class="fas fa-edit"></i> Editar Proveedor
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#cerrarFichaProv').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#editarProveedor').addEventListener('click', function() {
        modal.remove();
        editProveedor(proveedorId);
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Editar cobranza
function editCobranza(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    if (document.getElementById('clientName')) document.getElementById('clientName').value = cobranza.cliente;
    
    // Formatear teléfono
    let telefono = cobranza.telefono || '';
    if (telefono.startsWith('+58')) {
        telefono = telefono.substring(3);
    }
    telefono = telefono.replace(/\D/g, '');
    if (telefono.length > 3) {
        telefono = telefono.substring(0, 3) + '-' + telefono.substring(3);
    }
    if (document.getElementById('clientPhone')) document.getElementById('clientPhone').value = telefono;
    
    if (document.getElementById('clientEmail')) document.getElementById('clientEmail').value = cobranza.email || '';
    if (document.getElementById('amount')) document.getElementById('amount').value = cobranza.monto;
    if (document.getElementById('issueDate')) document.getElementById('issueDate').value = cobranza.fechaEmision;
    if (document.getElementById('dueDate')) document.getElementById('dueDate').value = cobranza.fechaVencimiento;
    if (document.getElementById('notes')) document.getElementById('notes').value = cobranza.notas || '';
    
    if (cobranzaIdInput) cobranzaIdInput.value = cobranzaId;
    if (cobranzaModalTitle) cobranzaModalTitle.textContent = 'Editar Cobranza';
    if (cobranzaSubmitBtn) cobranzaSubmitBtn.textContent = 'Actualizar Cobranza';
    
    if (cobranzaModal) cobranzaModal.classList.add('active');
}

// Editar proveedor
function editProveedor(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    if (document.getElementById('proveedorName')) document.getElementById('proveedorName').value = proveedor.nombre;
    if (document.getElementById('proveedorContact')) document.getElementById('proveedorContact').value = proveedor.contacto || '';
    
    // Formatear teléfono
    let telefono = proveedor.telefono || '';
    if (telefono.startsWith('+58')) {
        telefono = telefono.substring(3);
    }
    telefono = telefono.replace(/\D/g, '');
    if (telefono.length > 3) {
        telefono = telefono.substring(0, 3) + '-' + telefono.substring(3);
    }
    if (document.getElementById('proveedorPhone')) document.getElementById('proveedorPhone').value = telefono;
    
    if (document.getElementById('proveedorEmail')) document.getElementById('proveedorEmail').value = proveedor.email || '';
    if (document.getElementById('proveedorConcepto')) document.getElementById('proveedorConcepto').value = proveedor.concepto;
    if (document.getElementById('proveedorMonto')) document.getElementById('proveedorMonto').value = proveedor.monto;
    if (document.getElementById('proveedorIssueDate')) document.getElementById('proveedorIssueDate').value = proveedor.fechaEmision;
    if (document.getElementById('proveedorDueDate')) document.getElementById('proveedorDueDate').value = proveedor.fechaVencimiento;
    if (document.getElementById('proveedorNotes')) document.getElementById('proveedorNotes').value = proveedor.notas || '';
    
    if (proveedorIdInput) proveedorIdInput.value = proveedorId;
    if (proveedorModalTitle) proveedorModalTitle.textContent = 'Editar Proveedor';
    if (proveedorSubmitBtn) proveedorSubmitBtn.textContent = 'Actualizar Proveedor';
    
    if (proveedorModal) proveedorModal.classList.add('active');
}

// Marcar cobranza como pagada
function markAsPaid(cobranzaId) {
    if (confirm('¿Estás seguro de que quieres marcar esta cobranza como pagada?')) {
        const cobranza = cobranzas.find(c => c.id === cobranzaId);
        database.ref('cobranzas/' + cobranzaId).update({
            estado: 'pagado',
            saldoPendiente: 0
        })
        .then(() => {
            showNotification('Cobranza marcada como pagada', 'success');
            registrarActividad('pago', `Cobranza marcada como pagada - ${cobranza.cliente}`, `Monto: $${cobranza.monto}`);
        })
        .catch((error) => {
            showNotification('Error al actualizar cobranza: ' + error.message, 'danger');
        });
    }
}

// Marcar proveedor como pagado
function markProveedorAsPaid(proveedorId) {
    if (confirm('¿Estás seguro de que quieres marcar este proveedor como pagado?')) {
        const proveedor = proveedores.find(p => p.id === proveedorId);
        database.ref('proveedores/' + proveedorId).update({
            estado: 'pagado',
            saldoPendiente: 0
        })
        .then(() => {
            showNotification('Proveedor marcado como pagado', 'success');
            registrarActividad('pago', `Proveedor marcado como pagado - ${proveedor.nombre}`, `Monto: $${proveedor.monto}`);
        })
        .catch((error) => {
            showNotification('Error al actualizar proveedor: ' + error.message, 'danger');
        });
    }
}

// Eliminar cobranza
function deleteCobranza(cobranzaId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cobranza?')) {
        const cobranza = cobranzas.find(c => c.id === cobranzaId);
        // Primero eliminar todos los abonos asociados
        database.ref('abonos').orderByChild('cobranzaId').equalTo(cobranzaId).once('value')
            .then((snapshot) => {
                const promises = [];
                snapshot.forEach((childSnapshot) => {
                    promises.push(database.ref('abonos/' + childSnapshot.key).remove());
                });
                return Promise.all(promises);
            })
            .then(() => {
                // Luego eliminar la cobranza
                return database.ref('cobranzas/' + cobranzaId).remove();
            })
            .then(() => {
                showNotification('Cobranza eliminada', 'success');
                registrarActividad('sistema', `Cobranza eliminada - ${cobranza.cliente}`, `Monto: $${cobranza.monto}`);
            })
            .catch((error) => {
                showNotification('Error al eliminar cobranza: ' + error.message, 'danger');
            });
    }
}

// Eliminar proveedor
function deleteProveedor(proveedorId) {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
        const proveedor = proveedores.find(p => p.id === proveedorId);
        // Primero eliminar todos los pagos asociados
        database.ref('pagosProveedores').orderByChild('proveedorId').equalTo(proveedorId).once('value')
            .then((snapshot) => {
                const promises = [];
                snapshot.forEach((childSnapshot) => {
                    promises.push(database.ref('pagosProveedores/' + childSnapshot.key).remove());
                });
                return Promise.all(promises);
            })
            .then(() => {
                // Luego eliminar el proveedor
                return database.ref('proveedores/' + proveedorId).remove();
            })
            .then(() => {
                showNotification('Proveedor eliminado', 'success');
                registrarActividad('sistema', `Proveedor eliminado - ${proveedor.nombre}`, `Monto: $${proveedor.monto}`);
            })
            .catch((error) => {
                showNotification('Error al eliminar proveedor: ' + error.message, 'danger');
            });
    }
}

// Generar recibo
function generateRecibo(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    const reciboContent = document.getElementById('reciboContent');
    if (!reciboContent) return;
    
    const today = new Date();
    const dueDate = new Date(cobranza.fechaVencimiento);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
    const totalAbonado = parseFloat(cobranza.monto) - saldoPendiente;
    
    let estadoRecibo = 'Pendiente';
    let estadoClase = 'status-pending';
    
    if (cobranza.estado === 'pagado' || saldoPendiente <= 0) {
        estadoRecibo = 'Pagado';
        estadoClase = 'status-paid';
    } else if (diffDays < 0) {
        estadoRecibo = 'Vencido';
        estadoClase = 'status-overdue';
    }
    
    let abonosHTML = '';
    if (cobranza.abonos && cobranza.abonos.length > 0) {
        abonosHTML = `
            <div class="abonos-section">
                <h4>Historial de Abonos</h4>
                ${cobranza.abonos.map(abono => `
                    <div class="abono-item">
                        <div class="abono-info">
                            <strong>$${abono.monto}</strong>
                            <div class="abono-fecha">${formatDate(abono.fecha)}</div>
                            ${abono.notas ? `<small>${abono.notas}</small>` : ''}
                        </div>
                    </div>
                `).join('')}
                <div class="saldo-restante">
                    <strong>Total abonado:</strong> $${totalAbonado.toFixed(2)}<br>
                    <strong>Saldo pendiente:</strong> $${saldoPendiente.toFixed(2)}
                </div>
            </div>
        `;
    }
    
    reciboContent.innerHTML = `
        <div class="recibo-header">
            <div class="recibo-empresa">${companyData ? companyData.nombre : 'Mi Empresa'}</div>
            <div>${companyData ? companyData.rif : 'RIF: X-XXXXXXXX-X'}</div>
            <div>${companyData ? companyData.telefono : 'Teléfono: XXXX-XXXX'}</div>
            <div>${companyData ? companyData.email : 'Email: info@empresa.com'}</div>
        </div>
        
        <div class="recibo-details">
            <div class="recibo-cliente">
                <h4>Cliente</h4>
                <p><strong>${cobranza.cliente}</strong></p>
                <p>${cobranza.telefono || 'Teléfono no disponible'}</p>
                <p>${cobranza.email || 'Email no disponible'}</p>
            </div>
            
            <div class="recibo-info">
                <h4>Información del Recibo</h4>
                <p><strong>Fecha de Emisión:</strong> ${formatDate(cobranza.fechaEmision)}</p>
                <p><strong>Fecha de Vencimiento:</strong> ${formatDate(cobranza.fechaVencimiento)}</p>
                <p><strong>Estado:</strong> <span class="status-badge ${estadoClase}">${estadoRecibo}</span></p>
                ${cobranza.estado !== 'pagado' && saldoPendiente > 0 ? 
                  `<p><strong>Días ${diffDays >= 0 ? 'restantes' : 'vencidos'}:</strong> ${Math.abs(diffDays)}</p>` : ''}
            </div>
        </div>
        
        <div class="recibo-items">
            <h4>Detalles de la Cobranza</h4>
            <div class="recibo-item">
                <span>Concepto</span>
                <span>Monto</span>
            </div>
            <div class="recibo-item">
                <span>Pago pendiente</span>
                <span>$${cobranza.monto}</span>
            </div>
        </div>
        
        <div class="recibo-total">
            <span>Total a Pagar:</span>
            <span>$${cobranza.monto}</span>
        </div>
        
        ${abonosHTML}
        
        ${cobranza.notas ? `
        <div class="recibo-notes" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border);">
            <h4>Notas</h4>
            <p>${cobranza.notas}</p>
        </div>
        ` : ''}
        
        <div class="recibo-footer">
            <p>Este es un recibo generado automáticamente por PPB Cobranza</p>
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
    `;
    
    if (reciboModal) reciboModal.classList.add('active');
}

// Actualizar estadísticas del dashboard
function updateDashboardStats() {
    // Estadísticas de cobranzas
    const pending = cobranzas.filter(c => {
        const saldoPendiente = c.saldoPendiente || calcularSaldoPendiente(c);
        return c.estado !== 'pagado' && saldoPendiente > 0;
    }).length;
    
    const paid = cobranzas.filter(c => {
        const saldoPendiente = c.saldoPendiente || calcularSaldoPendiente(c);
        return c.estado === 'pagado' || saldoPendiente <= 0;
    }).length;
    
    const overdue = cobranzas.filter(c => {
        const today = new Date();
        const dueDate = new Date(c.fechaVencimiento);
        const saldoPendiente = c.saldoPendiente || calcularSaldoPendiente(c);
        return c.estado !== 'pagado' && saldoPendiente > 0 && dueDate < today;
    }).length;
    
    const totalAmount = cobranzas
        .filter(c => {
            const saldoPendiente = c.saldoPendiente || calcularSaldoPendiente(c);
            return c.estado !== 'pagado' && saldoPendiente > 0;
        })
        .reduce((sum, c) => sum + (c.saldoPendiente || calcularSaldoPendiente(c)), 0);
    
    // Estadísticas de proveedores
    const proveedoresCount = proveedores.length;
    
    const totalPagos = proveedores
        .filter(p => {
            const saldoPendiente = p.saldoPendiente || calcularSaldoPendienteProveedor(p);
            return p.estado !== 'pagado' && saldoPendiente > 0;
        })
        .reduce((sum, p) => sum + (p.saldoPendiente || calcularSaldoPendienteProveedor(p)), 0);
    
    if (document.getElementById('pendingCount')) document.getElementById('pendingCount').textContent = pending;
    if (document.getElementById('paidCount')) document.getElementById('paidCount').textContent = paid;
    if (document.getElementById('overdueCount')) document.getElementById('overdueCount').textContent = overdue;
    if (document.getElementById('proveedoresCount')) document.getElementById('proveedoresCount').textContent = proveedoresCount;
    if (document.getElementById('totalAmount')) document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    if (document.getElementById('totalPagos')) document.getElementById('totalPagos').textContent = `$${totalPagos.toFixed(2)}`;
    
    updateStatusChart(pending, paid, overdue);
}

// Actualizar gráfico de estados
function updateStatusChart(pending, paid, overdue) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    if (statusChart) {
        statusChart.destroy();
    }
    
    statusChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Pendientes', 'Pagadas', 'Vencidas'],
            datasets: [{
                data: [pending, paid, overdue],
                backgroundColor: [
                    'rgba(255, 149, 0, 0.7)',
                    'rgba(52, 199, 89, 0.7)',
                    'rgba(255, 59, 48, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 149, 0, 1)',
                    'rgba(52, 199, 89, 1)',
                    'rgba(255, 59, 48, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Cargar datos para el panel de administración
function loadAdminData() {
    database.ref('users').once('value')
        .then((snapshot) => {
            const users = [];
            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                user.id = childSnapshot.key;
                users.push(user);
            });
            
            updateAdminUI(users);
        })
        .catch((error) => {
            console.error('Error al cargar usuarios:', error);
            if (adminConnectionAlert) adminConnectionAlert.style.display = 'flex';
        });
}

// Actualizar UI del panel de administración
function updateAdminUI(users) {
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = '';
    
    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <i class="fas fa-users" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay usuarios registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    if (document.getElementById('totalUsers')) document.getElementById('totalUsers').textContent = users.length;
    if (document.getElementById('proUsers')) document.getElementById('proUsers').textContent = users.filter(u => u.plan === 'pro').length;
    if (document.getElementById('inactiveUsers')) document.getElementById('inactiveUsers').textContent = users.filter(u => !u.activo).length;
    
    database.ref('cobranzas').once('value')
        .then((snapshot) => {
            if (document.getElementById('totalCobranzasAdmin')) {
                document.getElementById('totalCobranzasAdmin').textContent = snapshot.numChildren();
            }
        });
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td><span class="plan-badge plan-${user.plan}">${user.plan === 'free' ? 'Free' : 'Pro'}</span></td>
            <td>${user.activo ? 'Activo' : 'Inactivo'}</td>
            <td class="user-cobranzas-count">Cargando...</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon toggle-active" data-id="${user.id}" data-active="${user.activo}" title="${user.activo ? 'Desactivar' : 'Activar'}">
                        <i class="fas ${user.activo ? 'fa-user-slash' : 'fa-user-check'}" style="color: ${user.activo ? 'var(--warning)' : 'var(--success)'};"></i>
                    </button>
                    <button class="btn-icon toggle-plan" data-id="${user.id}" data-plan="${user.plan}" title="${user.plan === 'free' ? 'Hacer Pro' : 'Hacer Free'}">
                        <i class="fas ${user.plan === 'free' ? 'fa-crown' : 'fa-user'}" style="color: ${user.plan === 'free' ? 'var(--secondary)' : 'var(--gray)'};"></i>
                    </button>
                    <button class="btn-icon delete-user" data-id="${user.id}" data-name="${user.nombre}" title="Eliminar usuario">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </div>
            </td>
        `;
        
        usersTableBody.appendChild(tr);
        
        database.ref('cobranzas').orderByChild('userId').equalTo(user.id).once('value')
            .then((snapshot) => {
                const count = snapshot.numChildren();
                tr.querySelector('.user-cobranzas-count').textContent = count;
            });
    });
    
    document.querySelectorAll('.toggle-active').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const currentActive = this.getAttribute('data-active') === 'true';
            
            database.ref('users/' + userId).update({
                activo: !currentActive
            })
            .then(() => {
                showNotification(`Usuario ${!currentActive ? 'activado' : 'desactivado'} correctamente`, 'success');
                loadAdminData();
            })
            .catch((error) => {
                showNotification('Error al actualizar usuario: ' + error.message, 'danger');
            });
        });
    });
    
    document.querySelectorAll('.toggle-plan').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const currentPlan = this.getAttribute('data-plan');
            const newPlan = currentPlan === 'free' ? 'pro' : 'free';
            
            database.ref('users/' + userId).update({
                plan: newPlan
            })
            .then(() => {
                showNotification(`Usuario actualizado a plan ${newPlan}`, 'success');
                loadAdminData();
            })
            .catch((error) => {
                showNotification('Error al actualizar usuario: ' + error.message, 'danger');
            });
        });
    });
    
    // NUEVA FUNCIONALIDAD: Eliminar usuarios
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const userName = this.getAttribute('data-name');
            
            if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
                // Primero eliminar todos los datos del usuario
                const deletePromises = [];
                
                // Eliminar cobranzas del usuario
                deletePromises.push(
                    database.ref('cobranzas').orderByChild('userId').equalTo(userId).once('value')
                        .then(snapshot => {
                            const promises = [];
                            snapshot.forEach(child => {
                                promises.push(database.ref('cobranzas/' + child.key).remove());
                            });
                            return Promise.all(promises);
                        })
                );
                
                // Eliminar abonos del usuario
                deletePromises.push(
                    database.ref('abonos').orderByChild('userId').equalTo(userId).once('value')
                        .then(snapshot => {
                            const promises = [];
                            snapshot.forEach(child => {
                                promises.push(database.ref('abonos/' + child.key).remove());
                            });
                            return Promise.all(promises);
                        })
                );
                
                // Eliminar proveedores del usuario
                deletePromises.push(
                    database.ref('proveedores').orderByChild('userId').equalTo(userId).once('value')
                        .then(snapshot => {
                            const promises = [];
                            snapshot.forEach(child => {
                                promises.push(database.ref('proveedores/' + child.key).remove());
                            });
                            return Promise.all(promises);
                        })
                );
                
                // Eliminar pagos a proveedores del usuario
                deletePromises.push(
                    database.ref('pagosProveedores').orderByChild('userId').equalTo(userId).once('value')
                        .then(snapshot => {
                            const promises = [];
                            snapshot.forEach(child => {
                                promises.push(database.ref('pagosProveedores/' + child.key).remove());
                            });
                            return Promise.all(promises);
                        })
                );
                
                // Eliminar mensajes del usuario
                deletePromises.push(
                    database.ref('mensajes').orderByChild('userId').equalTo(userId).once('value')
                        .then(snapshot => {
                            const promises = [];
                            snapshot.forEach(child => {
                                promises.push(database.ref('mensajes/' + child.key).remove());
                            });
                            return Promise.all(promises);
                        })
                );
                
                // Eliminar actividades del usuario
                deletePromises.push(
                    database.ref('actividades').orderByChild('userId').equalTo(userId).once('value')
                        .then(snapshot => {
                            const promises = [];
                            snapshot.forEach(child => {
                                promises.push(database.ref('actividades/' + child.key).remove());
                            });
                            return Promise.all(promises);
                        })
                );
                
                // Eliminar datos de empresa del usuario
                deletePromises.push(
                    database.ref('empresas/' + userId).remove()
                );
                
                // Eliminar el usuario de la base de datos
                deletePromises.push(
                    database.ref('users/' + userId).remove()
                );
                
                // Ejecutar todas las eliminaciones
                Promise.all(deletePromises)
                    .then(() => {
                        showNotification(`Usuario "${userName}" eliminado correctamente`, 'success');
                        loadAdminData();
                    })
                    .catch((error) => {
                        console.error('Error al eliminar usuario:', error);
                        showNotification('Error al eliminar usuario: ' + error.message, 'danger');
                    });
            }
        });
    });
}

// Exportar a Excel - Cobranzas
if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', function() {
        const data = cobranzas.map(cobranza => {
            const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
            return {
                'Cliente': cobranza.cliente,
                'Teléfono': cobranza.telefono || '',
                'Monto Total': cobranza.monto,
                'Saldo Pendiente': saldoPendiente,
                'Abonos': cobranza.abonos ? cobranza.abonos.length : 0,
                'Estado': cobranza.estado,
                'Fecha Emisión': formatDate(cobranza.fechaEmision),
                'Fecha Vencimiento': formatDate(cobranza.fechaVencimiento),
                'Notas': cobranza.notas || ''
            };
        });
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Cobranzas');
        XLSX.writeFile(wb, 'cobranzas.xlsx');
    });
}

// Exportar a Excel - Proveedores
if (exportProveedoresBtn) {
    exportProveedoresBtn.addEventListener('click', function() {
        const data = proveedores.map(proveedor => {
            const saldoPendiente = proveedor.saldoPendiente || calcularSaldoPendienteProveedor(proveedor);
            return {
                'Proveedor': proveedor.nombre,
                'Contacto': proveedor.contacto || '',
                'Concepto': proveedor.concepto,
                'Monto Total': proveedor.monto,
                'Saldo Pendiente': saldoPendiente,
                'Pagos': proveedor.pagos ? proveedor.pagos.length : 0,
                'Estado': proveedor.estado,
                'Fecha Emisión': formatDate(proveedor.fechaEmision),
                'Fecha Vencimiento': formatDate(proveedor.fechaVencimiento),
                'Notas': proveedor.notas || ''
            };
        });
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
        XLSX.writeFile(wb, 'proveedores.xlsx');
    });
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Formatear tiempo relativo
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Hace un momento';
    } else if (diffMins < 60) {
        return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
        return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
        return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
        return formatDate(dateString);
    }
}

// Actualizar datos de admin
if (refreshUsersBtn) {
    refreshUsersBtn.addEventListener('click', loadAdminData);
}

// Enlace para actualizar plan
if (upgradePlanLink) {
    upgradePlanLink.addEventListener('click', function(e) {
        e.preventDefault();
        const mensaje = `Hola, estoy interesado en actualizar a Plan Pro. Mi usuario es: ${userData.email}\n\nContacto del administrador:\nEmail: ${ADMIN_EMAIL}\nTeléfono: ${ADMIN_PHONE}`;
        copyToClipboard(mensaje);
        showNotification('Información de contacto copiada al portapapeles', 'info');
    });
}

// Enviar recibo por email
if (sendReciboBtn) {
    sendReciboBtn.addEventListener('click', function() {
        const reciboText = document.getElementById('reciboContent');
        if (reciboText) {
            copyToClipboard(reciboText.innerText);
            showNotification('Recibo copiado al portapapeles. Péguelo en su cliente de email.', 'success');
        }
    });
}

console.log("✅ app.js cargado correctamente");
