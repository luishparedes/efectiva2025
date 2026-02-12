// ============================================
// CONFIGURACIÓN DE CLAVES DE ACCESO
// ============================================
const ACCESS_KEYS = [
    "A1B4", "C3D4", "E5F6", "X9Y8", "Z7W3"
];

// ============================================
// VARIABLES GLOBALES
// ============================================
let currentUser = {
    nombre: 'Usuario PPB',
    email: 'usuario@ppb.com',
    plan: 'pro',
    activo: true,
    accessKey: '',
    sessionStart: null
};

let companyData = null;
let cobranzas = [];
let proveedores = [];
let mensajes = [];
let abonos = [];
let pagosProveedores = [];
let actividades = [];
let statusChart = null;
let currentTab = 'all';
let currentTabProv = 'all-prov';
let isAuthenticated = false;

// Elementos DOM
const authScreen = document.getElementById('authScreen');
const appContainer = document.getElementById('appContainer');
const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const accessKeyInput = document.getElementById('accessKey');
const userNameInput = document.getElementById('userName');
const displayUserName = document.getElementById('displayUserName');
const logoutBtn = document.getElementById('logoutBtn');
const navLinks = document.querySelectorAll('.nav-link');
const cobranzasTableBody = document.getElementById('cobranzasTableBody');
const proveedoresTableBody = document.getElementById('proveedoresTableBody');
const upcomingList = document.getElementById('upcomingList');
const abonoModal = document.getElementById('abonoModal');
const abonoForm = document.getElementById('abonoForm');
const abonoCobranzaId = document.getElementById('abonoCobranzaId');
const abonoMonto = document.getElementById('abonoMonto');
const deudaTotal = document.getElementById('deudaTotal');
const saldoActual = document.getElementById('saldoActual');
const saldoDespues = document.getElementById('saldoDespues');

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================
function setupSecurity() {
    console.log("🛡️ Configurando sistema de seguridad...");
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || 
            (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            showNotification('Acceso deshabilitado por seguridad', 'warning');
            return false;
        }
    });
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, false);
    
    console.log("✅ Sistema de seguridad configurado");
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================
function validateAccessKey(key) {
    key = key.trim().toUpperCase();
    const keyRegex = /^[A-Z][0-9][A-Z][0-9]$/;
    
    if (!keyRegex.test(key)) {
        return { valid: false, message: 'Formato inválido. Use: Letra, Número, Letra, Número (ej: A1B2)' };
    }
    
    if (!ACCESS_KEYS.includes(key)) {
        return { valid: false, message: 'Clave de acceso incorrecta' };
    }
    
    return { valid: true, message: 'Clave válida' };
}

function showAuthMessage(message, type = 'danger') {
    if (!authMessage) return;
    authMessage.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span>`;
    authMessage.className = `alert alert-${type}`;
    authMessage.style.display = 'flex';
    setTimeout(() => { authMessage.style.display = 'none'; }, 5000);
}

function login(accessKey, userName = '') {
    console.log("🔑 Intentando inicio de sesión...");
    const validation = validateAccessKey(accessKey);
    
    if (!validation.valid) {
        showAuthMessage(validation.message, 'danger');
        accessKeyInput.focus();
        return false;
    }
    
    currentUser.accessKey = accessKey;
    currentUser.sessionStart = new Date();
    if (userName && userName.trim() !== '') currentUser.nombre = userName.trim();
    isAuthenticated = true;
    
    showAuthMessage('Acceso autorizado. Iniciando sesión...', 'success');
    
    setTimeout(() => {
        authScreen.style.opacity = '0';
        authScreen.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            authScreen.style.display = 'none';
            appContainer.style.display = 'block';
            initializeApp();
            registrarActividad('sistema', `Inicio de sesión - Clave: ${accessKey}`, `Usuario: ${currentUser.nombre}`);
            showNotification(`Bienvenido ${currentUser.nombre}`, 'success');
            showNotificationInCenter('Sesión iniciada', `Acceso autorizado`, 'success');
        }, 300);
    }, 1000);
    return true;
}

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        registrarActividad('sistema', 'Cierre de sesión', `Usuario: ${currentUser.nombre}`);
        currentUser.accessKey = '';
        currentUser.sessionStart = null;
        isAuthenticated = false;
        appContainer.style.display = 'none';
        authScreen.style.display = 'flex';
        authScreen.style.opacity = '1';
        authScreen.style.transform = 'translateY(0)';
        if (authForm) authForm.reset();
        if (authMessage) authMessage.style.display = 'none';
        showNotification('Sesión cerrada correctamente', 'info');
    }
}

function requireAuth(action) {
    if (!isAuthenticated) {
        showNotification('Debe iniciar sesión para realizar esta acción', 'warning');
        return false;
    }
    return true;
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Aplicación iniciada");
    setupSecurity();
    
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const accessKey = accessKeyInput.value.trim();
            const userName = userNameInput.value.trim();
            if (!accessKey) {
                showAuthMessage('Por favor ingrese la clave de acceso', 'warning');
                accessKeyInput.focus();
                return;
            }
            login(accessKey, userName);
        });
        
        accessKeyInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
            if (this.value.length === 4) {
                const keyRegex = /^[A-Z][0-9][A-Z][0-9]$/;
                this.style.borderColor = keyRegex.test(this.value) ? 'var(--success)' : 'var(--danger)';
            } else {
                this.style.borderColor = '';
            }
        });
    }
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    setupPhoneInput();
    console.log("✅ Sistema listo para autenticación");
});

function initializeApp() {
    console.log("🏠 Inicializando aplicación principal...");
    setupNavigation();
    setupNotifications();
    setupMessageChannelListener();
    setupModals();
    setupForms();
    setupTabs();
    loadInitialData();
    updateUserUI();
}

// ============================================
// FUNCIONES DE DATOS - CORREGIDAS Y OPTIMIZADAS
// ============================================

// CORRECCIÓN CRÍTICA: Cálculo exacto del saldo pendiente
function calcularSaldoPendiente(cobranza) {
    if (!cobranza) return 0;
    
    // Si ya tiene saldoPendiente calculado, lo usamos
    if (typeof cobranza.saldoPendiente === 'number' && !isNaN(cobranza.saldoPendiente)) {
        return Math.max(0, parseFloat(cobranza.saldoPendiente.toFixed(2)));
    }
    
    // Calcular sumando todos los abonos
    const abonosCobranza = abonos.filter(a => a.cobranzaId === cobranza.id);
    const totalAbonado = abonosCobranza.reduce((sum, abono) => {
        return sum + (parseFloat(abono.monto) || 0);
    }, 0);
    
    const montoTotal = parseFloat(cobranza.monto) || 0;
    const saldo = Math.max(0, montoTotal - totalAbonado);
    
    // Guardar en el objeto para referencia futura
    cobranza.saldoPendiente = saldo;
    
    return parseFloat(saldo.toFixed(2));
}

// CORRECCIÓN CRÍTICA: Recalcular todos los saldos para sincronizar
function recalcularTodosLosSaldos() {
    cobranzas.forEach(cobranza => {
        cobranza.saldoPendiente = calcularSaldoPendiente(cobranza);
        
        // Actualizar estado basado en saldo
        if (cobranza.saldoPendiente <= 0) {
            cobranza.estado = 'pagado';
        } else {
            const today = new Date();
            const dueDate = new Date(cobranza.fechaVencimiento);
            if (dueDate < today && cobranza.estado !== 'pagado') {
                cobranza.estado = 'vencido';
            } else if (cobranza.estado !== 'pagado' && cobranza.estado !== 'vencido') {
                cobranza.estado = 'pendiente';
            }
        }
    });
    
    proveedores.forEach(proveedor => {
        proveedor.saldoPendiente = calcularSaldoPendienteProveedor(proveedor);
        
        if (proveedor.saldoPendiente <= 0) {
            proveedor.estado = 'pagado';
        } else {
            const today = new Date();
            const dueDate = new Date(proveedor.fechaVencimiento);
            if (dueDate < today && proveedor.estado !== 'pagado') {
                proveedor.estado = 'vencido';
            } else if (proveedor.estado !== 'pagado' && proveedor.estado !== 'vencido') {
                proveedor.estado = 'pendiente';
            }
        }
    });
}

function calcularSaldoPendienteProveedor(proveedor) {
    if (!proveedor) return 0;
    
    if (typeof proveedor.saldoPendiente === 'number' && !isNaN(proveedor.saldoPendiente)) {
        return Math.max(0, parseFloat(proveedor.saldoPendiente.toFixed(2)));
    }
    
    const pagosProv = pagosProveedores.filter(p => p.proveedorId === proveedor.id);
    const totalPagado = pagosProv.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0);
    const montoTotal = parseFloat(proveedor.monto) || 0;
    const saldo = Math.max(0, montoTotal - totalPagado);
    
    proveedor.saldoPendiente = saldo;
    return parseFloat(saldo.toFixed(2));
}

function loadFromLocalStorage() {
    try {
        companyData = JSON.parse(localStorage.getItem('ppb_companyData')) || {};
        cobranzas = JSON.parse(localStorage.getItem('ppb_cobranzas')) || [];
        proveedores = JSON.parse(localStorage.getItem('ppb_proveedores')) || [];
        mensajes = JSON.parse(localStorage.getItem('ppb_mensajes')) || [];
        abonos = JSON.parse(localStorage.getItem('ppb_abonos')) || [];
        pagosProveedores = JSON.parse(localStorage.getItem('ppb_pagosProveedores')) || [];
        actividades = JSON.parse(localStorage.getItem('ppb_actividades')) || [];
        
        // CORRECCIÓN: Recalcular todos los saldos al cargar
        recalcularTodosLosSaldos();
        console.log("✅ Datos cargados y saldos recalculados");
    } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        companyData = {};
        cobranzas = [];
        proveedores = [];
        mensajes = [];
        abonos = [];
        pagosProveedores = [];
        actividades = [];
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('ppb_companyData', JSON.stringify(companyData));
        localStorage.setItem('ppb_cobranzas', JSON.stringify(cobranzas));
        localStorage.setItem('ppb_proveedores', JSON.stringify(proveedores));
        localStorage.setItem('ppb_mensajes', JSON.stringify(mensajes));
        localStorage.setItem('ppb_abonos', JSON.stringify(abonos));
        localStorage.setItem('ppb_pagosProveedores', JSON.stringify(pagosProveedores));
        localStorage.setItem('ppb_actividades', JSON.stringify(actividades));
        console.log("💾 Datos guardados en localStorage");
    } catch (error) {
        console.error("❌ Error al guardar datos:", error);
    }
}

function loadInitialData() {
    console.log("📂 Cargando datos iniciales...");
    loadFromLocalStorage();
    updateCobranzasUI();
    updateProveedoresUI();
    updateDashboardStats();
    updateUpcomingList();
    updateRecentActivityUI();
    showNotificationInCenter('Sistema cargado', 'Datos cargados correctamente', 'success');
}

// ============================================
// FUNCIONES DE ABONOS - COMPLETAMENTE CORREGIDAS
// ============================================

// CORRECCIÓN CRÍTICA: Abrir modal con datos correctos
function openAbonoModal(cobranzaId) {
    if (!requireAuth('registrar abono')) return;
    
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) {
        showNotification('Cobranza no encontrada', 'danger');
        return;
    }
    
    // Calcular saldo actual exacto
    const saldoPendiente = calcularSaldoPendiente(cobranza);
    
    // Actualizar campos del modal
    if (abonoCobranzaId) abonoCobranzaId.value = cobranzaId;
    if (deudaTotal) deudaTotal.textContent = parseFloat(cobranza.monto).toFixed(2);
    if (saldoActual) saldoActual.textContent = saldoPendiente.toFixed(2);
    if (saldoDespues) saldoDespues.textContent = saldoPendiente.toFixed(2);
    
    // Configurar input de monto
    if (abonoMonto) {
        abonoMonto.value = '';
        abonoMonto.max = saldoPendiente;
        abonoMonto.min = 0.01;
        abonoMonto.step = 0.01;
        
        // Remover event listeners anteriores y agregar nuevo
        abonoMonto.removeEventListener('input', actualizarSaldoDespues);
        abonoMonto.addEventListener('input', actualizarSaldoDespues);
    }
    
    // Configurar fecha por defecto
    const abonoFecha = document.getElementById('abonoFecha');
    if (abonoFecha) abonoFecha.valueAsDate = new Date();
    
    // Limpiar notas
    const abonoNotas = document.getElementById('abonoNotas');
    if (abonoNotas) abonoNotas.value = '';
    
    // Mostrar modal
    if (abonoModal) abonoModal.classList.add('active');
}

// CORRECCIÓN CRÍTICA: Función para actualizar saldo después del abono en tiempo real
function actualizarSaldoDespues() {
    const montoAbono = parseFloat(abonoMonto.value) || 0;
    const saldoPendiente = parseFloat(saldoActual.textContent) || 0;
    
    // Validar que el abono no sea mayor al saldo pendiente
    if (montoAbono > saldoPendiente) {
        abonoMonto.value = saldoPendiente.toFixed(2);
        saldoDespues.textContent = '0.00';
        showNotification('El abono no puede ser mayor al saldo pendiente', 'warning');
    } else {
        const nuevoSaldo = Math.max(0, saldoPendiente - montoAbono);
        saldoDespues.textContent = nuevoSaldo.toFixed(2);
    }
}

// CORRECCIÓN CRÍTICA: Procesar abono con validaciones estrictas
function procesarAbono(cobranzaId, monto, fecha, notas) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) {
        showNotification('Cobranza no encontrada', 'danger');
        return false;
    }
    
    const saldoPendiente = calcularSaldoPendiente(cobranza);
    const montoAbono = parseFloat(monto);
    
    // Validaciones estrictas
    if (isNaN(montoAbono) || montoAbono <= 0) {
        showNotification('El monto del abono debe ser mayor a 0', 'danger');
        return false;
    }
    
    if (montoAbono > saldoPendiente) {
        showNotification(`El abono no puede ser mayor al saldo pendiente ($${saldoPendiente.toFixed(2)})`, 'danger');
        return false;
    }
    
    if (cobranza.estado === 'pagado' || saldoPendiente <= 0) {
        showNotification('Esta cobranza ya está completamente pagada', 'warning');
        return false;
    }
    
    // Crear registro de abono
    const abonoData = {
        id: generateId(),
        cobranzaId: cobranzaId,
        monto: montoAbono,
        fecha: fecha,
        notas: notas || '',
        fechaRegistro: new Date().toISOString()
    };
    
    abonos.push(abonoData);
    
    // CORRECCIÓN CRÍTICA: Calcular nuevo saldo exacto
    const nuevoSaldo = parseFloat((saldoPendiente - montoAbono).toFixed(2));
    cobranza.saldoPendiente = nuevoSaldo;
    
    // Actualizar estado si está completamente pagado
    if (nuevoSaldo <= 0.01) { // Tolerancia para errores de redondeo
        cobranza.saldoPendiente = 0;
        cobranza.estado = 'pagado';
        registrarActividad('pago', `Cobranza pagada completamente - ${cobranza.cliente}`);
        showNotification('¡Cobranza pagada completamente!', 'success');
    } else {
        // Verificar si está vencido
        const today = new Date();
        const dueDate = new Date(cobranza.fechaVencimiento);
        cobranza.estado = dueDate < today ? 'vencido' : 'pendiente';
        showNotification('Abono registrado correctamente', 'success');
    }
    
    saveToLocalStorage();
    
    // Registrar actividad
    registrarActividad('abono', `Abono registrado - ${cobranza.cliente}`, 
        `Monto: $${montoAbono.toFixed(2)}, Nuevo saldo: $${nuevoSaldo.toFixed(2)}`);
    
    return true;
}

// ============================================
// CONFIGURACIÓN DE FORMULARIOS
// ============================================
function setupForms() {
    console.log("📝 Configurando formularios");
    
    // Formulario de cobranza
    const cobranzaForm = document.getElementById('cobranzaForm');
    if (cobranzaForm) {
        cobranzaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!requireAuth('guardar cobranza')) return;
            
            const cobranzaId = document.getElementById('cobranzaId');
            const telefono = document.getElementById('clientPhone').value;
            let telefonoLimpio = telefono.replace(/-/g, '');
            if (telefonoLimpio && !telefonoLimpio.startsWith('+58')) {
                telefonoLimpio = '+58' + telefonoLimpio;
            }
            
            const cobranzaData = {
                id: cobranzaId.value || generateId(),
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
            
            if (cobranzaId.value) {
                const index = cobranzas.findIndex(c => c.id === cobranzaId.value);
                if (index !== -1) {
                    // Mantener el saldo pendiente original si ya existía
                    const saldoOriginal = cobranzas[index].saldoPendiente;
                    cobranzas[index] = { ...cobranzas[index], ...cobranzaData };
                    cobranzas[index].saldoPendiente = saldoOriginal;
                    showNotification('Cobranza actualizada correctamente', 'success');
                    registrarActividad('cobranza', `Cobranza actualizada - ${cobranzaData.cliente}`, `Monto: $${cobranzaData.monto}`);
                }
            } else {
                cobranzas.push(cobranzaData);
                showNotification('Cobranza agregada correctamente', 'success');
                registrarActividad('cobranza', `Nueva cobranza creada - ${cobranzaData.cliente}`, `Monto: $${cobranzaData.monto}`);
            }
            
            saveToLocalStorage();
            cobranzaForm.reset();
            document.getElementById('cobranzaModal').classList.remove('active');
            cobranzaId.value = '';
            document.getElementById('cobranzaModalTitle').textContent = 'Nueva Cobranza';
            
            updateCobranzasUI();
            updateDashboardStats();
            updateUpcomingList();
        });
    }
    
    // CORRECCIÓN CRÍTICA: Formulario de abono
    if (abonoForm) {
        abonoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!requireAuth('registrar abono')) return;
            
            const cobranzaId = document.getElementById('abonoCobranzaId').value;
            const monto = document.getElementById('abonoMonto').value;
            const fecha = document.getElementById('abonoFecha').value;
            const notas = document.getElementById('abonoNotas').value;
            
            if (procesarAbono(cobranzaId, monto, fecha, notas)) {
                abonoForm.reset();
                abonoModal.classList.remove('active');
                updateCobranzasUI();
                updateDashboardStats();
                updateUpcomingList();
                updateRecentActivityUI();
            }
        });
    }
    
    // Resto de formularios (proveedor, pago, etc.)
    setupProveedorForm();
    setupPagoProveedorForm();
    setupMessageForm();
    setupCompanyForm();
}

function setupProveedorForm() {
    const proveedorForm = document.getElementById('proveedorForm');
    const proveedorIdInput = document.getElementById('proveedorId');
    const proveedorModal = document.getElementById('proveedorModal');
    const proveedorModalTitle = document.getElementById('proveedorModalTitle');
    
    if (proveedorForm) {
        proveedorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!requireAuth('guardar proveedor')) return;
            
            let telefono = document.getElementById('proveedorPhone').value;
            let telefonoLimpio = telefono.replace(/-/g, '');
            if (telefonoLimpio && !telefonoLimpio.startsWith('+58')) {
                telefonoLimpio = '+58' + telefonoLimpio;
            }
            
            const proveedorData = {
                id: proveedorIdInput.value || generateId(),
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
                const index = proveedores.findIndex(p => p.id === proveedorIdInput.value);
                if (index !== -1) {
                    const saldoOriginal = proveedores[index].saldoPendiente;
                    proveedores[index] = { ...proveedores[index], ...proveedorData };
                    proveedores[index].saldoPendiente = saldoOriginal;
                    showNotification('Proveedor actualizado correctamente', 'success');
                    registrarActividad('proveedor', `Proveedor actualizado - ${proveedorData.nombre}`, `Monto: $${proveedorData.monto}`);
                }
            } else {
                proveedores.push(proveedorData);
                showNotification('Proveedor agregado correctamente', 'success');
                registrarActividad('proveedor', `Nuevo proveedor creado - ${proveedorData.nombre}`, `Monto: $${proveedorData.monto}`);
            }
            
            saveToLocalStorage();
            proveedorForm.reset();
            proveedorModal.classList.remove('active');
            proveedorIdInput.value = '';
            proveedorModalTitle.textContent = 'Nuevo Proveedor';
            
            updateProveedoresUI();
            updateDashboardStats();
            updateUpcomingList();
        });
    }
}

function setupPagoProveedorForm() {
    const pagoProveedorForm = document.getElementById('pagoProveedorForm');
    const pagoProveedorModal = document.getElementById('pagoProveedorModal');
    
    if (pagoProveedorForm) {
        pagoProveedorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!requireAuth('registrar pago')) return;
            
            const proveedorId = document.getElementById('pagoProveedorId').value;
            const proveedor = proveedores.find(p => p.id === proveedorId);
            if (!proveedor) {
                showNotification('Proveedor no encontrado', 'danger');
                return;
            }
            
            const montoPago = parseFloat(document.getElementById('pagoMonto').value);
            const fecha = document.getElementById('pagoFecha').value;
            const notas = document.getElementById('pagoNotas').value;
            const saldoPendiente = calcularSaldoPendienteProveedor(proveedor);
            
            if (montoPago > saldoPendiente) {
                showNotification(`El pago no puede ser mayor al saldo pendiente ($${saldoPendiente.toFixed(2)})`, 'danger');
                return;
            }
            
            const pagoData = {
                id: generateId(),
                proveedorId: proveedorId,
                monto: montoPago,
                fecha: fecha,
                notas: notas,
                fechaRegistro: new Date().toISOString()
            };
            
            pagosProveedores.push(pagoData);
            
            const nuevoSaldo = parseFloat((saldoPendiente - montoPago).toFixed(2));
            proveedor.saldoPendiente = nuevoSaldo;
            
            if (nuevoSaldo <= 0.01) {
                proveedor.saldoPendiente = 0;
                proveedor.estado = 'pagado';
                registrarActividad('pago', `Proveedor pagado completamente - ${proveedor.nombre}`);
                showNotification('¡Proveedor pagado completamente!', 'success');
            } else {
                const today = new Date();
                const dueDate = new Date(proveedor.fechaVencimiento);
                proveedor.estado = dueDate < today ? 'vencido' : 'pendiente';
                showNotification('Pago registrado correctamente', 'success');
            }
            
            saveToLocalStorage();
            pagoProveedorForm.reset();
            pagoProveedorModal.classList.remove('active');
            
            registrarActividad('pago_proveedor', `Pago registrado - ${proveedor.nombre}`, 
                `Monto: $${montoPago.toFixed(2)}, Nuevo saldo: $${nuevoSaldo.toFixed(2)}`);
            
            updateProveedoresUI();
            updateDashboardStats();
            updateUpcomingList();
        });
    }
}

function setupMessageForm() {
    const messageForm = document.getElementById('messageForm');
    const messageModal = document.getElementById('messageModal');
    const messageType = document.getElementById('messageType');
    const messageClient = document.getElementById('messageClient');
    const messageContent = document.getElementById('messageContent');
    const messageChannel = document.getElementById('messageChannel');
    const messageIcon = document.getElementById('messageIcon');
    const messageText = document.getElementById('messageText');
    
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!requireAuth('enviar mensaje')) return;
            
            const clientId = messageClient.value;
            const client = cobranzas.find(c => c.id === clientId);
            if (!client) {
                showNotification('Cliente no encontrado', 'danger');
                return;
            }
            
            const messageData = {
                id: generateId(),
                tipo: messageType.value,
                contenido: messageContent.value,
                cliente: client.cliente,
                clienteId: clientId,
                canal: messageChannel.value,
                fechaEnvio: new Date().toISOString(),
                estado: 'enviado'
            };
            
            if (messageChannel.value === 'whatsapp') {
                enviarWhatsApp(client, messageContent.value);
                showNotification('Mensaje enviado por WhatsApp', 'success');
            } else {
                copyToClipboard(messageContent.value);
                showNotification('Mensaje copiado al portapapeles', 'success');
            }
            
            mensajes.push(messageData);
            saveToLocalStorage();
            registrarActividad('mensaje', `Mensaje enviado - ${client.cliente}`, `Tipo: ${messageType.value}`);
            
            messageForm.reset();
            messageModal.classList.remove('active');
        });
        
        if (messageChannel) {
            messageChannel.addEventListener('change', function() {
                if (messageIcon) messageIcon.className = this.value === 'whatsapp' ? 'fab fa-whatsapp' : 'fas fa-envelope';
                if (messageText) messageText.textContent = this.value === 'whatsapp' ? 'Enviar por WhatsApp' : 'Copiar para Email';
            });
        }
        
        if (messageType) {
            messageType.addEventListener('change', generarContenidoMensaje);
        }
        
        if (messageClient) {
            messageClient.addEventListener('change', generarContenidoMensaje);
        }
    }
}

function generarContenidoMensaje() {
    const type = document.getElementById('messageType').value;
    const clientId = document.getElementById('messageClient').value;
    const client = cobranzas.find(c => c.id === clientId);
    
    if (!client || !type || type === 'personalizado') return;
    
    let content = '';
    const saldoPendiente = calcularSaldoPendiente(client);
    
    switch(type) {
        case 'recordatorio_amable':
            content = `Hola ${client.cliente}, desde ${companyData?.nombre || 'PPB Cobranza'} te recordamos que tu pago de $${saldoPendiente.toFixed(2)} vence el ${formatDate(client.fechaVencimiento)}. Contáctanos: ${companyData?.telefono || 'No disponible'}.`;
            break;
        case 'recordatorio_cercano':
            content = `Hola ${client.cliente}, tu pago de $${saldoPendiente.toFixed(2)} con ${companyData?.nombre || 'PPB Cobranza'} vence hoy (${formatDate(client.fechaVencimiento)}). Agradecemos tu pronta atención.`;
            break;
        case 'vencido_leve':
            content = `Hola ${client.cliente}, tu pago de $${saldoPendiente.toFixed(2)} con ${companyData?.nombre || 'PPB Cobranza'} está vencido desde ${formatDate(client.fechaVencimiento)}. Por favor realiza tu pago cuanto antes.`;
            break;
        case 'ultima_advertencia':
            content = `Estimado ${client.cliente}, tu pago de $${saldoPendiente.toFixed(2)} con ${companyData?.nombre || 'PPB Cobranza'} está vencido desde ${formatDate(client.fechaVencimiento)}. Esta es la última notificación antes de tomar medidas. Contáctanos: ${companyData?.telefono || 'No disponible'}.`;
            break;
    }
    
    document.getElementById('messageContent').value = content;
}

function setupCompanyForm() {
    const companyForm = document.getElementById('companyForm');
    if (companyForm) {
        companyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!requireAuth('guardar datos empresa')) return;
            
            companyData = {
                nombre: document.getElementById('companyName').value,
                rif: document.getElementById('companyRif').value,
                telefono: document.getElementById('companyPhone').value,
                email: document.getElementById('companyEmail').value,
                contactos: document.getElementById('companyContacts').value,
                fechaActualizacion: new Date().toISOString()
            };
            
            saveToLocalStorage();
            showNotification('Datos de empresa guardados correctamente', 'success');
            registrarActividad('sistema', 'Datos de empresa actualizados', `Empresa: ${companyData.nombre}`);
        });
        
        // Cargar datos si existen
        if (companyData) {
            document.getElementById('companyName').value = companyData.nombre || '';
            document.getElementById('companyRif').value = companyData.rif || '';
            document.getElementById('companyPhone').value = companyData.telefono || '';
            document.getElementById('companyEmail').value = companyData.email || '';
            document.getElementById('companyContacts').value = companyData.contactos || '';
        }
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return formatDate(dateString);
}

function showNotification(message, type = 'info') {
    console.log(`📢 Notificación: ${message}`);
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i><span>${message}</span>`;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(notification, container.firstChild);
        setTimeout(() => notification.remove(), 5000);
    }
}

function showNotificationInCenter(title, message, type = 'info') {
    const notificationList = document.getElementById('notificationList');
    const notificationBadge = document.getElementById('notificationBadge');
    
    if (!notificationList || !requireAuth('ver notificaciones')) return;
    
    const notificationItem = document.createElement('div');
    notificationItem.className = `notification-item ${type}`;
    const timeString = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    notificationItem.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-time">${timeString}</div>
    `;
    
    notificationList.insertBefore(notificationItem, notificationList.firstChild);
    
    if (notificationBadge) {
        const count = notificationList.children.length;
        notificationBadge.textContent = count > 99 ? '99+' : count;
        notificationBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    
    setTimeout(() => {
        if (notificationItem.parentNode) {
            notificationItem.remove();
            if (notificationBadge) {
                const newCount = notificationList.children.length;
                notificationBadge.textContent = newCount > 99 ? '99+' : newCount;
                notificationBadge.style.display = newCount > 0 ? 'flex' : 'none';
            }
        }
    }, 10000);
}

function showCopyNotification() {
    const copyNotification = document.getElementById('copyNotification');
    if (copyNotification) {
        copyNotification.classList.add('show');
        setTimeout(() => copyNotification.classList.remove('show'), 3000);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyNotification();
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification();
    });
}

function enviarWhatsApp(cliente, mensaje) {
    if (!cliente.telefono) {
        showNotification('El cliente no tiene número de teléfono registrado', 'warning');
        return false;
    }
    
    let telefonoLimpio = cliente.telefono.replace(/\D/g, '');
    if (!telefonoLimpio.startsWith('58')) telefonoLimpio = '58' + telefonoLimpio.replace(/^0+/, '');
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappURL = `https://web.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
    
    setTimeout(() => window.open(whatsappURL, 'WHATSAPP_FIJO'), 100);
    return true;
}

function registrarActividad(tipo, descripcion, detalles = null) {
    const actividadData = {
        id: generateId(),
        tipo: tipo,
        descripcion: descripcion,
        detalles: detalles,
        fecha: new Date().toISOString(),
        usuario: currentUser.nombre
    };
    
    actividades.unshift(actividadData);
    if (actividades.length > 50) actividades = actividades.slice(0, 50);
    saveToLocalStorage();
    updateRecentActivityUI();
    console.log('✅ Actividad registrada:', descripcion);
}

// ============================================
// CONFIGURACIÓN DE INTERFAZ
// ============================================
function setupNavigation() {
    console.log("🧭 Configurando navegación");
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (!requireAuth('navegar')) return;
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.dashboard').forEach(el => el.style.display = 'none');
            const target = document.getElementById(this.getAttribute('data-target'));
            if (target) target.style.display = 'block';
        });
    });
}

function setupNotifications() {
    console.log("🔔 Configurando notificaciones");
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationCenter = document.getElementById('notificationCenter');
    const closeNotifications = document.getElementById('closeNotifications');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            if (!requireAuth('ver notificaciones')) return;
            notificationCenter.classList.toggle('active');
        });
    }
    
    if (closeNotifications) {
        closeNotifications.addEventListener('click', () => notificationCenter.classList.remove('active'));
    }
    
    window.addEventListener('click', function(e) {
        if (notificationCenter && !notificationCenter.contains(e.target) && 
            notificationBtn && !notificationBtn.contains(e.target)) {
            notificationCenter.classList.remove('active');
        }
    });
}

function setupPhoneInput() {
    console.log("📞 Configurando inputs de teléfono");
    const phoneInputs = [
        document.getElementById('clientPhone'),
        document.getElementById('proveedorPhone')
    ];
    
    phoneInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^\d]/g, '');
                
                if (value.length > 0 && !value.startsWith('4')) {
                    showNotification('Los números venezolanos deben comenzar con 4', 'warning');
                    value = value.substring(1);
                }
                
                if (value.length > 3) value = value.substring(0, 3) + '-' + value.substring(3);
                if (value.length > 11) value = value.substring(0, 11);
                e.target.value = value;
            });
            
            input.addEventListener('keydown', function(e) {
                if (!['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key) && 
                    !(e.key >= '0' && e.key <= '9') && e.key !== '-') {
                    e.preventDefault();
                }
            });
            
            input.placeholder = '412-1234567';
        }
    });
}

function setupMessageChannelListener() {
    const messageChannel = document.getElementById('messageChannel');
    const messageIcon = document.getElementById('messageIcon');
    const messageText = document.getElementById('messageText');
    
    if (messageChannel && messageIcon && messageText) {
        messageChannel.addEventListener('change', function() {
            messageIcon.className = this.value === 'whatsapp' ? 'fab fa-whatsapp' : 'fas fa-envelope';
            messageText.textContent = this.value === 'whatsapp' ? 'Enviar por WhatsApp' : 'Copiar para Email';
        });
    }
}

function setupModals() {
    console.log("📦 Configurando modales");
    
    // Botones para abrir modales
    document.querySelectorAll('[id^="addCobranzaBtn"]').forEach(btn => {
        if (btn) btn.addEventListener('click', () => requireAuth('agregar cobranza') && openCobranzaModal());
    });
    
    document.querySelectorAll('[id^="addProveedorBtn"]').forEach(btn => {
        if (btn) btn.addEventListener('click', () => requireAuth('agregar proveedor') && openProveedorModal());
    });
    
    const addMessageBtn = document.getElementById('addMessageBtn');
    if (addMessageBtn) {
        addMessageBtn.addEventListener('click', () => requireAuth('enviar mensaje') && openMessageModal());
    }
    
    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
        });
    });
    
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });
    
    // Botones de recibo
    const printReciboBtn = document.getElementById('printReciboBtn');
    const sendReciboBtn = document.getElementById('sendReciboBtn');
    
    if (printReciboBtn) {
        printReciboBtn.addEventListener('click', function() {
            if (!requireAuth('imprimir recibo')) return;
            const reciboContent = document.getElementById('reciboContent');
            if (reciboContent) {
                const ventana = window.open('', '_blank');
                ventana.document.write(`
                    <html><head><title>Recibo de Cobranza</title>
                    <style>body { font-family: Arial, sans-serif; padding: 20px; } .recibo-container { max-width: 600px; margin: 0 auto; }</style>
                    </head><body><div class="recibo-container">${reciboContent.innerHTML}</div></body></html>
                `);
                ventana.document.close();
                ventana.print();
            }
        });
    }
    
    if (sendReciboBtn) {
        sendReciboBtn.addEventListener('click', function() {
            if (!requireAuth('enviar recibo')) return;
            const reciboText = document.getElementById('reciboContent');
            if (reciboText) {
                copyToClipboard(reciboText.innerText);
                showNotification('Recibo copiado al portapapeles', 'success');
            }
        });
    }
}

function openCobranzaModal() {
    const issueDate = document.getElementById('issueDate');
    const dueDate = document.getElementById('dueDate');
    const cobranzaForm = document.getElementById('cobranzaForm');
    const cobranzaId = document.getElementById('cobranzaId');
    const cobranzaModalTitle = document.getElementById('cobranzaModalTitle');
    const cobranzaModal = document.getElementById('cobranzaModal');
    
    if (issueDate) issueDate.valueAsDate = new Date();
    if (dueDate) {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        dueDate.valueAsDate = date;
    }
    
    if (cobranzaForm) cobranzaForm.reset();
    if (cobranzaId) cobranzaId.value = '';
    if (cobranzaModalTitle) cobranzaModalTitle.textContent = 'Nueva Cobranza';
    if (cobranzaModal) cobranzaModal.classList.add('active');
}

function openProveedorModal() {
    const issueDate = document.getElementById('proveedorIssueDate');
    const dueDate = document.getElementById('proveedorDueDate');
    const proveedorForm = document.getElementById('proveedorForm');
    const proveedorId = document.getElementById('proveedorId');
    const proveedorModalTitle = document.getElementById('proveedorModalTitle');
    const proveedorModal = document.getElementById('proveedorModal');
    
    if (issueDate) issueDate.valueAsDate = new Date();
    if (dueDate) {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        dueDate.valueAsDate = date;
    }
    
    if (proveedorForm) proveedorForm.reset();
    if (proveedorId) proveedorId.value = '';
    if (proveedorModalTitle) proveedorModalTitle.textContent = 'Nuevo Proveedor';
    if (proveedorModal) proveedorModal.classList.add('active');
}

function openPagoProveedorModal(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    const saldoPendiente = calcularSaldoPendienteProveedor(proveedor);
    
    document.getElementById('pagoProveedorId').value = proveedorId;
    document.getElementById('deudaTotalProv').textContent = proveedor.monto;
    document.getElementById('saldoActualProv').textContent = saldoPendiente.toFixed(2);
    document.getElementById('saldoDespuesProv').textContent = saldoPendiente.toFixed(2);
    
    const pagoMonto = document.getElementById('pagoMonto');
    pagoMonto.value = '';
    pagoMonto.max = saldoPendiente;
    pagoMonto.min = 0.01;
    
    pagoMonto.removeEventListener('input', actualizarSaldoDespuesProv);
    pagoMonto.addEventListener('input', actualizarSaldoDespuesProv);
    
    document.getElementById('pagoFecha').valueAsDate = new Date();
    document.getElementById('pagoNotas').value = '';
    document.getElementById('pagoProveedorModal').classList.add('active');
}

function actualizarSaldoDespuesProv() {
    const montoPago = parseFloat(document.getElementById('pagoMonto').value) || 0;
    const saldoActual = parseFloat(document.getElementById('saldoActualProv').textContent) || 0;
    
    if (montoPago > saldoActual) {
        document.getElementById('pagoMonto').value = saldoActual.toFixed(2);
        document.getElementById('saldoDespuesProv').textContent = '0.00';
        showNotification('El pago no puede ser mayor al saldo pendiente', 'warning');
    } else {
        document.getElementById('saldoDespuesProv').textContent = (saldoActual - montoPago).toFixed(2);
    }
}

function openMessageModal() {
    const clientSelect = document.getElementById('messageClient');
    if (clientSelect) {
        clientSelect.innerHTML = '<option value="">Selecciona un cliente</option>';
        
        cobranzas.forEach(cobranza => {
            const saldoPendiente = calcularSaldoPendiente(cobranza);
            if (cobranza.estado !== 'pagado' && saldoPendiente > 0) {
                const option = document.createElement('option');
                option.value = cobranza.id;
                option.textContent = `${cobranza.cliente} - $${saldoPendiente.toFixed(2)}`;
                clientSelect.appendChild(option);
            }
        });
    }
    
    document.getElementById('messageModal').classList.add('active');
}

function openMessageModalForCobranza(cobranzaId) {
    openMessageModal();
    document.getElementById('messageClient').value = cobranzaId;
    
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (cobranza) {
        const today = new Date();
        const dueDate = new Date(cobranza.fechaVencimiento);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        let messageType = 'recordatorio_amable';
        if (diffDays < 0) {
            messageType = Math.abs(diffDays) > 15 ? 'ultima_advertencia' : 'vencido_leve';
        } else if (diffDays === 0) {
            messageType = 'recordatorio_cercano';
        }
        
        document.getElementById('messageType').value = messageType;
        generarContenidoMensaje();
    }
}

function setupTabs() {
    console.log("📑 Configurando tabs");
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            
            if (!requireAuth('cambiar pestaña')) return;
            
            if (tabType.includes('prov')) {
                document.querySelectorAll('.tab[data-tab*="prov"]').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentTabProv = tabType;
                updateProveedoresUI();
            } else {
                document.querySelectorAll('.tab:not([data-tab*="prov"])').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentTab = tabType;
                updateCobranzasUI();
            }
        });
    });
}

// ============================================
// ACTUALIZACIÓN DE INTERFACES
// ============================================
function updateUserUI() {
    console.log("👤 Actualizando UI del usuario");
    const displayUserName = document.getElementById('displayUserName');
    const userAvatar = document.getElementById('userAvatar');
    const userPlanBadge = document.getElementById('userPlanBadge');
    
    if (displayUserName) displayUserName.textContent = currentUser.nombre;
    if (userAvatar) userAvatar.textContent = currentUser.nombre.charAt(0).toUpperCase();
    if (userPlanBadge) {
        userPlanBadge.textContent = currentUser.plan === 'free' ? 'Free' : 'Pro';
        userPlanBadge.className = `plan-badge plan-${currentUser.plan}`;
    }
}

function updateCobranzasUI() {
    if (!cobranzasTableBody || !requireAuth('ver cobranzas')) return;
    
    cobranzasTableBody.innerHTML = '';
    
    if (cobranzas.length === 0) {
        mostrarMensajeVacioCobranzas();
        return;
    }
    
    let filteredCobranzas = filtrarCobranzas();
    
    if (filteredCobranzas.length === 0) {
        cobranzasTableBody.innerHTML = `
            <tr><td colspan="6" style="text-align: center; padding: 30px;">
                <i class="fas fa-inbox" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                <p>No hay cobranzas en esta categoría</p>
            </td></tr>
        `;
        return;
    }
    
    filteredCobranzas.forEach(cobranza => {
        const tr = document.createElement('tr');
        const saldoPendiente = calcularSaldoPendiente(cobranza);
        const estadoInfo = obtenerEstadoCobranza(cobranza, saldoPendiente);
        const abonosCobranza = abonos.filter(a => a.cobranzaId === cobranza.id);
        
        tr.innerHTML = `
            <td>
                <strong class="clickable-name" style="color: var(--primary); cursor: pointer; text-decoration: underline;" data-id="${cobranza.id}">
                    ${cobranza.cliente}
                </strong>
                ${abonosCobranza.length > 0 ? `<br><small>${abonosCobranza.length} abono(s)</small>` : ''}
            </td>
            <td>
                $${parseFloat(cobranza.monto).toFixed(2)}
                ${saldoPendiente < parseFloat(cobranza.monto) ? 
                  `<br><small>Saldo: $${saldoPendiente.toFixed(2)}</small>` : ''}
            </td>
            <td>${formatDate(cobranza.fechaEmision)}</td>
            <td>${formatDate(cobranza.fechaVencimiento)}</td>
            <td><span class="status-badge ${estadoInfo.class}">${estadoInfo.text}</span></td>
            <td>
                <div class="action-buttons">
                    ${saldoPendiente > 0 ? `<button class="btn-icon" title="Registrar abono" data-id="${cobranza.id}" data-action="abono">
                        <i class="fas fa-hand-holding-usd" style="color: var(--success);"></i>
                    </button>` : ''}
                    <button class="btn-icon" title="Ver abonos" data-id="${cobranza.id}" data-action="verAbonos">
                        <i class="fas fa-list" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Generar recibo" data-id="${cobranza.id}" data-action="recibo">
                        <i class="fas fa-receipt" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Enviar mensaje" data-id="${cobranza.id}" data-action="mensaje">
                        <i class="fas fa-envelope" style="color: var(--primary);"></i>
                    </button>
                    ${saldoPendiente > 0 ? `<button class="btn-icon" title="Marcar como pagado" data-id="${cobranza.id}" data-action="marcarPagado">
                        <i class="fas fa-check" style="color: var(--success);"></i>
                    </button>` : ''}
                    <button class="btn-icon" title="Editar" data-id="${cobranza.id}" data-action="editar">
                        <i class="fas fa-edit" style="color: var(--warning);"></i>
                    </button>
                    <button class="btn-icon" title="Eliminar" data-id="${cobranza.id}" data-action="eliminar">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </div>
            </td>
        `;
        
        cobranzasTableBody.appendChild(tr);
    });
    
    agregarEventListenersCobranzas();
}

function mostrarMensajeVacioCobranzas() {
    cobranzasTableBody.innerHTML = `
        <tr><td colspan="6" style="text-align: center; padding: 30px;">
            <i class="fas fa-inbox" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
            <p>No hay cobranzas registradas</p>
            <button class="btn btn-primary" id="addFirstCobranza" style="margin-top: 15px;">
                <i class="fas fa-plus"></i> Agregar Primera Cobranza
            </button>
        </td></tr>
    `;
    
    const addFirstBtn = document.getElementById('addFirstCobranza');
    if (addFirstBtn) addFirstBtn.addEventListener('click', () => requireAuth('agregar cobranza') && openCobranzaModal());
}

function filtrarCobranzas() {
    let filtered = cobranzas;
    
    if (currentTab === 'pending') {
        filtered = cobranzas.filter(c => {
            const saldo = calcularSaldoPendiente(c);
            return c.estado !== 'pagado' && saldo > 0 && new Date(c.fechaVencimiento) >= new Date();
        });
    } else if (currentTab === 'paid') {
        filtered = cobranzas.filter(c => c.estado === 'pagado' || calcularSaldoPendiente(c) <= 0);
    } else if (currentTab === 'overdue') {
        filtered = cobranzas.filter(c => {
            const saldo = calcularSaldoPendiente(c);
            return c.estado !== 'pagado' && saldo > 0 && new Date(c.fechaVencimiento) < new Date();
        });
    }
    
    return filtered;
}

function obtenerEstadoCobranza(cobranza, saldoPendiente) {
    if (cobranza.estado === 'pagado' || saldoPendiente <= 0) {
        return { class: 'status-paid', text: 'Pagado' };
    }
    
    const today = new Date();
    const dueDate = new Date(cobranza.fechaVencimiento);
    
    if (dueDate < today) {
        return { class: 'status-overdue', text: 'Vencido' };
    }
    
    return { class: 'status-pending', text: 'Pendiente' };
}

function agregarEventListenersCobranzas() {
    document.querySelectorAll('#cobranzasTableBody .action-buttons .btn-icon').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!requireAuth('acciones cobranza')) return;
            e.stopPropagation();
            
            const cobranzaId = this.getAttribute('data-id');
            const action = this.getAttribute('data-action');
            
            switch(action) {
                case 'abono': openAbonoModal(cobranzaId); break;
                case 'verAbonos': verAbonos(cobranzaId); break;
                case 'recibo': generateRecibo(cobranzaId); break;
                case 'mensaje': openMessageModalForCobranza(cobranzaId); break;
                case 'marcarPagado': markAsPaid(cobranzaId); break;
                case 'editar': editCobranza(cobranzaId); break;
                case 'eliminar': deleteCobranza(cobranzaId); break;
            }
        });
    });
    
    document.querySelectorAll('.clickable-name').forEach(name => {
        name.addEventListener('click', function() {
            if (!requireAuth('ver ficha cliente')) return;
            mostrarFichaCliente(this.getAttribute('data-id'));
        });
    });
}

function verAbonos(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    const abonosCobranza = abonos.filter(a => a.cobranzaId === cobranzaId);
    const saldoPendiente = calcularSaldoPendiente(cobranza);
    const totalAbonado = parseFloat(cobranza.monto) - saldoPendiente;
    
    let abonosHTML = abonosCobranza.length > 0 
        ? abonosCobranza.map(abono => `
            <div class="abono-item">
                <div class="abono-info">
                    <strong>$${parseFloat(abono.monto).toFixed(2)}</strong>
                    <div class="abono-fecha">${formatDate(abono.fecha)}</div>
                    ${abono.notas ? `<small>${abono.notas}</small>` : ''}
                </div>
            </div>
        `).join('')
        : '<p>No hay abonos registrados</p>';
    
    const modalHTML = `
        <div class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Abonos - ${cobranza.cliente}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div>
                    <p><strong>Deuda total:</strong> $${parseFloat(cobranza.monto).toFixed(2)}</p>
                    <p><strong>Total abonado:</strong> $${totalAbonado.toFixed(2)}</p>
                    <p><strong>Saldo pendiente:</strong> $${saldoPendiente.toFixed(2)}</p>
                    
                    <div class="abonos-section">
                        <h4>Historial de Abonos</h4>
                        ${abonosHTML}
                    </div>
                    
                    ${saldoPendiente > 0 ? `
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="btn btn-primary" id="addAbonoFromList" data-id="${cobranzaId}">
                            <i class="fas fa-plus"></i> Agregar Abono
                        </button>
                    </div>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.body.lastChild;
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    const addBtn = modal.querySelector('#addAbonoFromList');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            modal.remove();
            openAbonoModal(cobranzaId);
        });
    }
    window.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function mostrarFichaCliente(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    const cobranzasCliente = cobranzas.filter(c => c.cliente === cobranza.cliente);
    const totalCobranzas = cobranzasCliente.length;
    const cobranzasPagadas = cobranzasCliente.filter(c => c.estado === 'pagado').length;
    const tasaPago = totalCobranzas > 0 ? (cobranzasPagadas / totalCobranzas) * 100 : 0;
    const totalPrestado = cobranzasCliente.reduce((sum, c) => sum + parseFloat(c.monto), 0);
    const totalPagado = cobranzasCliente.filter(c => c.estado === 'pagado').reduce((sum, c) => sum + parseFloat(c.monto), 0);
    
    let telefonoMostrar = cobranza.telefono?.replace('+58', '') || 'No registrado';
    if (telefonoMostrar.length > 3) telefonoMostrar = telefonoMostrar.substring(0, 3) + '-' + telefonoMostrar.substring(3);
    
    const modalHTML = `
        <div class="modal active">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">👤 Ficha de Cliente: ${cobranza.cliente}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="ficha-section">
                        <h4>📋 Información de Contacto</h4>
                        <div class="ficha-grid">
                            <div class="ficha-item"><label>Teléfono:</label><span>${telefonoMostrar}</span></div>
                            <div class="ficha-item"><label>Email:</label><span>${cobranza.email || 'No registrado'}</span></div>
                        </div>
                    </div>
                    <div class="ficha-section">
                        <h4>📊 Estadísticas</h4>
                        <div class="ficha-grid">
                            <div class="ficha-item"><label>Total Cobranzas:</label><span>${totalCobranzas}</span></div>
                            <div class="ficha-item"><label>Tasa de Pago:</label><span>${tasaPago.toFixed(1)}%</span></div>
                            <div class="ficha-item"><label>Total Prestado:</label><span>$${totalPrestado.toFixed(2)}</span></div>
                            <div class="ficha-item"><label>Total Pagado:</label><span>$${totalPagado.toFixed(2)}</span></div>
                        </div>
                    </div>
                    <div class="ficha-section">
                        <h4>💰 Cobranzas Activas</h4>
                        ${cobranzasCliente.filter(c => c.estado !== 'pagado' && calcularSaldoPendiente(c) > 0).map(c => `
                            <div class="cobranza-activa">
                                <strong>$${calcularSaldoPendiente(c).toFixed(2)}</strong> - Vence: ${formatDate(c.fechaVencimiento)}
                                <span class="status-badge ${new Date(c.fechaVencimiento) < new Date() ? 'status-overdue' : 'status-pending'}">
                                    ${new Date(c.fechaVencimiento) < new Date() ? 'Vencida' : 'Pendiente'}
                                </span>
                            </div>
                        `).join('') || '<p>No hay cobranzas activas</p>'}
                    </div>
                    ${cobranza.notas ? `<div class="ficha-section"><h4>📝 Notas</h4><p>${cobranza.notas}</p></div>` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cerrarFicha">Cerrar</button>
                    <button class="btn btn-primary" id="editarCliente" data-id="${cobranzaId}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-warning" id="enviarMensajeCliente" data-id="${cobranzaId}"><i class="fas fa-envelope"></i> Mensaje</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.body.lastChild;
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#cerrarFicha').addEventListener('click', () => modal.remove());
    modal.querySelector('#editarCliente').addEventListener('click', () => { modal.remove(); editCobranza(cobranzaId); });
    modal.querySelector('#enviarMensajeCliente').addEventListener('click', () => { modal.remove(); openMessageModalForCobranza(cobranzaId); });
    window.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function updateProveedoresUI() {
    if (!proveedoresTableBody || !requireAuth('ver proveedores')) return;
    
    proveedoresTableBody.innerHTML = '';
    
    if (proveedores.length === 0) {
        proveedoresTableBody.innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 30px;">
                <i class="fas fa-truck" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                <p>No hay proveedores registrados</p>
                <button class="btn btn-primary" id="addFirstProveedor" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Agregar Primer Proveedor
                </button>
            </td></tr>
        `;
        const addFirstBtn = document.getElementById('addFirstProveedor');
        if (addFirstBtn) addFirstBtn.addEventListener('click', () => requireAuth('agregar proveedor') && openProveedorModal());
        return;
    }
    
    let filteredProveedores = filtrarProveedores();
    
    if (filteredProveedores.length === 0) {
        proveedoresTableBody.innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 30px;">
                <i class="fas fa-truck" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                <p>No hay proveedores en esta categoría</p>
            </td></tr>
        `;
        return;
    }
    
    filteredProveedores.forEach(proveedor => {
        const tr = document.createElement('tr');
        const saldoPendiente = calcularSaldoPendienteProveedor(proveedor);
        const estadoInfo = obtenerEstadoProveedor(proveedor, saldoPendiente);
        const pagosProv = pagosProveedores.filter(p => p.proveedorId === proveedor.id);
        
        tr.innerHTML = `
            <td>
                <strong class="clickable-proveedor" style="color: var(--primary); cursor: pointer; text-decoration: underline;" data-id="${proveedor.id}">
                    ${proveedor.nombre}
                </strong>
                ${proveedor.contacto ? `<br><small>${proveedor.contacto}</small>` : ''}
            </td>
            <td>${proveedor.concepto}</td>
            <td>
                $${parseFloat(proveedor.monto).toFixed(2)}
                ${saldoPendiente < parseFloat(proveedor.monto) ? `<br><small>Saldo: $${saldoPendiente.toFixed(2)}</small>` : ''}
            </td>
            <td>${formatDate(proveedor.fechaEmision)}</td>
            <td>${formatDate(proveedor.fechaVencimiento)}</td>
            <td><span class="status-badge ${estadoInfo.class}">${estadoInfo.text}</span></td>
            <td>
                <div class="action-buttons">
                    ${saldoPendiente > 0 ? `<button class="btn-icon" title="Registrar pago" data-id="${proveedor.id}" data-action="pago">
                        <i class="fas fa-money-bill-wave" style="color: var(--success);"></i>
                    </button>` : ''}
                    <button class="btn-icon" title="Ver pagos" data-id="${proveedor.id}" data-action="verPagos">
                        <i class="fas fa-list" style="color: var(--primary);"></i>
                    </button>
                    ${saldoPendiente > 0 ? `<button class="btn-icon" title="Marcar como pagado" data-id="${proveedor.id}" data-action="marcarPagado">
                        <i class="fas fa-check" style="color: var(--success);"></i>
                    </button>` : ''}
                    <button class="btn-icon" title="Editar" data-id="${proveedor.id}" data-action="editar">
                        <i class="fas fa-edit" style="color: var(--warning);"></i>
                    </button>
                    <button class="btn-icon" title="Eliminar" data-id="${proveedor.id}" data-action="eliminar">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </div>
            </td>
        `;
        
        proveedoresTableBody.appendChild(tr);
    });
    
    agregarEventListenersProveedores();
}

function filtrarProveedores() {
    let filtered = proveedores;
    
    if (currentTabProv === 'pending-prov') {
        filtered = proveedores.filter(p => {
            const saldo = calcularSaldoPendienteProveedor(p);
            return p.estado !== 'pagado' && saldo > 0 && new Date(p.fechaVencimiento) >= new Date();
        });
    } else if (currentTabProv === 'paid-prov') {
        filtered = proveedores.filter(p => p.estado === 'pagado' || calcularSaldoPendienteProveedor(p) <= 0);
    } else if (currentTabProv === 'overdue-prov') {
        filtered = proveedores.filter(p => {
            const saldo = calcularSaldoPendienteProveedor(p);
            return p.estado !== 'pagado' && saldo > 0 && new Date(p.fechaVencimiento) < new Date();
        });
    }
    
    return filtered;
}

function obtenerEstadoProveedor(proveedor, saldoPendiente) {
    if (proveedor.estado === 'pagado' || saldoPendiente <= 0) {
        return { class: 'status-paid', text: 'Pagado' };
    }
    
    const today = new Date();
    const dueDate = new Date(proveedor.fechaVencimiento);
    
    if (dueDate < today) {
        return { class: 'status-overdue', text: 'Vencido' };
    }
    
    return { class: 'status-pending', text: 'Pendiente' };
}

function agregarEventListenersProveedores() {
    document.querySelectorAll('#proveedoresTableBody .action-buttons .btn-icon').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!requireAuth('acciones proveedor')) return;
            e.stopPropagation();
            
            const proveedorId = this.getAttribute('data-id');
            const action = this.getAttribute('data-action');
            
            switch(action) {
                case 'pago': openPagoProveedorModal(proveedorId); break;
                case 'verPagos': verPagosProveedor(proveedorId); break;
                case 'marcarPagado': markProveedorAsPaid(proveedorId); break;
                case 'editar': editProveedor(proveedorId); break;
                case 'eliminar': deleteProveedor(proveedorId); break;
            }
        });
    });
    
    document.querySelectorAll('.clickable-proveedor').forEach(name => {
        name.addEventListener('click', function() {
            if (!requireAuth('ver ficha proveedor')) return;
            mostrarFichaProveedor(this.getAttribute('data-id'));
        });
    });
}

function verPagosProveedor(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    const pagosProv = pagosProveedores.filter(p => p.proveedorId === proveedorId);
    const saldoPendiente = calcularSaldoPendienteProveedor(proveedor);
    const totalPagado = parseFloat(proveedor.monto) - saldoPendiente;
    
    let pagosHTML = pagosProv.length > 0
        ? pagosProv.map(pago => `
            <div class="abono-item">
                <div class="abono-info">
                    <strong>$${parseFloat(pago.monto).toFixed(2)}</strong>
                    <div class="abono-fecha">${formatDate(pago.fecha)}</div>
                    ${pago.notas ? `<small>${pago.notas}</small>` : ''}
                </div>
            </div>
        `).join('')
        : '<p>No hay pagos registrados</p>';
    
    const modalHTML = `
        <div class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Pagos - ${proveedor.nombre}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div>
                    <p><strong>Deuda total:</strong> $${parseFloat(proveedor.monto).toFixed(2)}</p>
                    <p><strong>Total pagado:</strong> $${totalPagado.toFixed(2)}</p>
                    <p><strong>Saldo pendiente:</strong> $${saldoPendiente.toFixed(2)}</p>
                    
                    <div class="abonos-section">
                        <h4>Historial de Pagos</h4>
                        ${pagosHTML}
                    </div>
                    
                    ${saldoPendiente > 0 ? `
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="btn btn-primary" id="addPagoFromList" data-id="${proveedorId}">
                            <i class="fas fa-plus"></i> Registrar Pago
                        </button>
                    </div>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.body.lastChild;
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    const addBtn = modal.querySelector('#addPagoFromList');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            modal.remove();
            openPagoProveedorModal(proveedorId);
        });
    }
    window.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function mostrarFichaProveedor(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    const proveedoresMismo = proveedores.filter(p => p.nombre === proveedor.nombre);
    const totalProveedores = proveedoresMismo.length;
    const proveedoresPagados = proveedoresMismo.filter(p => p.estado === 'pagado').length;
    const tasaPago = totalProveedores > 0 ? (proveedoresPagados / totalProveedores) * 100 : 0;
    const totalFacturado = proveedoresMismo.reduce((sum, p) => sum + parseFloat(p.monto), 0);
    const totalPagado = proveedoresMismo.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + parseFloat(p.monto), 0);
    
    let telefonoMostrar = proveedor.telefono?.replace('+58', '') || 'No registrado';
    if (telefonoMostrar.length > 3) telefonoMostrar = telefonoMostrar.substring(0, 3) + '-' + telefonoMostrar.substring(3);
    
    const modalHTML = `
        <div class="modal active">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">🏢 Ficha de Proveedor: ${proveedor.nombre}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="ficha-section">
                        <h4>📋 Información de Contacto</h4>
                        <div class="ficha-grid">
                            <div class="ficha-item"><label>Contacto:</label><span>${proveedor.contacto || 'No registrado'}</span></div>
                            <div class="ficha-item"><label>Teléfono:</label><span>${telefonoMostrar}</span></div>
                            <div class="ficha-item"><label>Email:</label><span>${proveedor.email || 'No registrado'}</span></div>
                        </div>
                    </div>
                    <div class="ficha-section">
                        <h4>📊 Estadísticas</h4>
                        <div class="ficha-grid">
                            <div class="ficha-item"><label>Total Facturas:</label><span>${totalProveedores}</span></div>
                            <div class="ficha-item"><label>Tasa de Pago:</label><span>${tasaPago.toFixed(1)}%</span></div>
                            <div class="ficha-item"><label>Total Facturado:</label><span>$${totalFacturado.toFixed(2)}</span></div>
                            <div class="ficha-item"><label>Total Pagado:</label><span>$${totalPagado.toFixed(2)}</span></div>
                        </div>
                    </div>
                    <div class="ficha-section">
                        <h4>📦 Servicios/Productos</h4>
                        <p><strong>Concepto:</strong> ${proveedor.concepto || 'No especificado'}</p>
                    </div>
                    <div class="ficha-section">
                        <h4>💰 Facturas Pendientes</h4>
                        ${proveedoresMismo.filter(p => p.estado !== 'pagado' && calcularSaldoPendienteProveedor(p) > 0).map(p => `
                            <div class="proveedor-pendiente">
                                <strong>$${calcularSaldoPendienteProveedor(p).toFixed(2)}</strong> - Vence: ${formatDate(p.fechaVencimiento)}
                                <span class="status-badge ${new Date(p.fechaVencimiento) < new Date() ? 'status-overdue' : 'status-pending'}">
                                    ${new Date(p.fechaVencimiento) < new Date() ? 'Vencida' : 'Pendiente'}
                                </span>
                            </div>
                        `).join('') || '<p>No hay facturas pendientes</p>'}
                    </div>
                    ${proveedor.notas ? `<div class="ficha-section"><h4>📝 Notas</h4><p>${proveedor.notas}</p></div>` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cerrarFichaProv">Cerrar</button>
                    <button class="btn btn-primary" id="editarProveedor" data-id="${proveedorId}"><i class="fas fa-edit"></i> Editar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.body.lastChild;
    
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#cerrarFichaProv').addEventListener('click', () => modal.remove());
    modal.querySelector('#editarProveedor').addEventListener('click', () => { modal.remove(); editProveedor(proveedorId); });
    window.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function editCobranza(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    document.getElementById('clientName').value = cobranza.cliente;
    
    let telefono = cobranza.telefono?.replace('+58', '') || '';
    telefono = telefono.replace(/\D/g, '');
    if (telefono.length > 3) telefono = telefono.substring(0, 3) + '-' + telefono.substring(3);
    document.getElementById('clientPhone').value = telefono;
    
    document.getElementById('clientEmail').value = cobranza.email || '';
    document.getElementById('amount').value = cobranza.monto;
    document.getElementById('issueDate').value = cobranza.fechaEmision;
    document.getElementById('dueDate').value = cobranza.fechaVencimiento;
    document.getElementById('notes').value = cobranza.notas || '';
    
    document.getElementById('cobranzaId').value = cobranzaId;
    document.getElementById('cobranzaModalTitle').textContent = 'Editar Cobranza';
    document.getElementById('cobranzaSubmitBtn').textContent = 'Actualizar Cobranza';
    document.getElementById('cobranzaModal').classList.add('active');
}

function editProveedor(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    document.getElementById('proveedorName').value = proveedor.nombre;
    document.getElementById('proveedorContact').value = proveedor.contacto || '';
    
    let telefono = proveedor.telefono?.replace('+58', '') || '';
    telefono = telefono.replace(/\D/g, '');
    if (telefono.length > 3) telefono = telefono.substring(0, 3) + '-' + telefono.substring(3);
    document.getElementById('proveedorPhone').value = telefono;
    
    document.getElementById('proveedorEmail').value = proveedor.email || '';
    document.getElementById('proveedorConcepto').value = proveedor.concepto;
    document.getElementById('proveedorMonto').value = proveedor.monto;
    document.getElementById('proveedorIssueDate').value = proveedor.fechaEmision;
    document.getElementById('proveedorDueDate').value = proveedor.fechaVencimiento;
    document.getElementById('proveedorNotes').value = proveedor.notas || '';
    
    document.getElementById('proveedorId').value = proveedorId;
    document.getElementById('proveedorModalTitle').textContent = 'Editar Proveedor';
    document.getElementById('proveedorSubmitBtn').textContent = 'Actualizar Proveedor';
    document.getElementById('proveedorModal').classList.add('active');
}

function markAsPaid(cobranzaId) {
    if (confirm('¿Estás seguro de que quieres marcar esta cobranza como pagada?')) {
        const cobranza = cobranzas.find(c => c.id === cobranzaId);
        cobranza.estado = 'pagado';
        cobranza.saldoPendiente = 0;
        
        saveToLocalStorage();
        showNotification('Cobranza marcada como pagada', 'success');
        registrarActividad('pago', `Cobranza marcada como pagada - ${cobranza.cliente}`, `Monto: $${cobranza.monto}`);
        
        updateCobranzasUI();
        updateDashboardStats();
        updateUpcomingList();
    }
}

function markProveedorAsPaid(proveedorId) {
    if (confirm('¿Estás seguro de que quieres marcar este proveedor como pagado?')) {
        const proveedor = proveedores.find(p => p.id === proveedorId);
        proveedor.estado = 'pagado';
        proveedor.saldoPendiente = 0;
        
        saveToLocalStorage();
        showNotification('Proveedor marcado como pagado', 'success');
        registrarActividad('pago', `Proveedor marcado como pagado - ${proveedor.nombre}`, `Monto: $${proveedor.monto}`);
        
        updateProveedoresUI();
        updateDashboardStats();
        updateUpcomingList();
    }
}

function deleteCobranza(cobranzaId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cobranza?')) {
        const cobranza = cobranzas.find(c => c.id === cobranzaId);
        abonos = abonos.filter(a => a.cobranzaId !== cobranzaId);
        cobranzas = cobranzas.filter(c => c.id !== cobranzaId);
        
        saveToLocalStorage();
        showNotification('Cobranza eliminada', 'success');
        registrarActividad('sistema', `Cobranza eliminada - ${cobranza.cliente}`, `Monto: $${cobranza.monto}`);
        
        updateCobranzasUI();
        updateDashboardStats();
        updateUpcomingList();
    }
}

function deleteProveedor(proveedorId) {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
        const proveedor = proveedores.find(p => p.id === proveedorId);
        pagosProveedores = pagosProveedores.filter(p => p.proveedorId !== proveedorId);
        proveedores = proveedores.filter(p => p.id !== proveedorId);
        
        saveToLocalStorage();
        showNotification('Proveedor eliminado', 'success');
        registrarActividad('sistema', `Proveedor eliminado - ${proveedor.nombre}`, `Monto: $${proveedor.monto}`);
        
        updateProveedoresUI();
        updateDashboardStats();
        updateUpcomingList();
    }
}

function generateRecibo(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    const reciboContent = document.getElementById('reciboContent');
    if (!reciboContent) return;
    
    const today = new Date();
    const dueDate = new Date(cobranza.fechaVencimiento);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    const saldoPendiente = calcularSaldoPendiente(cobranza);
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
    
    const abonosCobranza = abonos.filter(a => a.cobranzaId === cobranzaId);
    let abonosHTML = '';
    if (abonosCobranza.length > 0) {
        abonosHTML = `
            <div class="abonos-section">
                <h4>Historial de Abonos</h4>
                ${abonosCobranza.map(abono => `
                    <div class="abono-item">
                        <div class="abono-info">
                            <strong>$${parseFloat(abono.monto).toFixed(2)}</strong>
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
            <div class="recibo-empresa">${companyData?.nombre || 'Mi Empresa'}</div>
            <div>${companyData?.rif || 'RIF: X-XXXXXXXX-X'}</div>
            <div>${companyData?.telefono || 'Teléfono: XXXX-XXXX'}</div>
            <div>${companyData?.email || 'Email: info@empresa.com'}</div>
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
                ${cobranza.estado !== 'pagado' && saldoPendiente > 0 ? `<p><strong>Días ${diffDays >= 0 ? 'restantes' : 'vencidos'}:</strong> ${Math.abs(diffDays)}</p>` : ''}
            </div>
        </div>
        <div class="recibo-items">
            <h4>Detalles de la Cobranza</h4>
            <div class="recibo-item"><span>Concepto</span><span>Monto</span></div>
            <div class="recibo-item"><span>Pago pendiente</span><span>$${parseFloat(cobranza.monto).toFixed(2)}</span></div>
        </div>
        <div class="recibo-total"><span>Total a Pagar:</span><span>$${parseFloat(cobranza.monto).toFixed(2)}</span></div>
        ${abonosHTML}
        ${cobranza.notas ? `<div class="recibo-notes" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border);"><h4>Notas</h4><p>${cobranza.notas}</p></div>` : ''}
        <div class="recibo-footer">
            <p>Este es un recibo generado automáticamente por PPB Cobranza</p>
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
    `;
    
    document.getElementById('reciboModal').classList.add('active');
}

// ============================================
// DASHBOARD Y ESTADÍSTICAS
// ============================================
function updateDashboardStats() {
    // Recalcular todos los saldos primero
    recalcularTodosLosSaldos();
    
    const pending = cobranzas.filter(c => {
        const saldo = calcularSaldoPendiente(c);
        return c.estado !== 'pagado' && saldo > 0 && new Date(c.fechaVencimiento) >= new Date();
    }).length;
    
    const paid = cobranzas.filter(c => c.estado === 'pagado' || calcularSaldoPendiente(c) <= 0).length;
    
    const overdue = cobranzas.filter(c => {
        const saldo = calcularSaldoPendiente(c);
        return c.estado !== 'pagado' && saldo > 0 && new Date(c.fechaVencimiento) < new Date();
    }).length;
    
    const totalAmount = cobranzas
        .filter(c => {
            const saldo = calcularSaldoPendiente(c);
            return c.estado !== 'pagado' && saldo > 0;
        })
        .reduce((sum, c) => sum + calcularSaldoPendiente(c), 0);
    
    const proveedoresCount = proveedores.length;
    
    const totalPagos = proveedores
        .filter(p => {
            const saldo = calcularSaldoPendienteProveedor(p);
            return p.estado !== 'pagado' && saldo > 0;
        })
        .reduce((sum, p) => sum + calcularSaldoPendienteProveedor(p), 0);
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('paidCount').textContent = paid;
    document.getElementById('overdueCount').textContent = overdue;
    document.getElementById('proveedoresCount').textContent = proveedoresCount;
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('totalPagos').textContent = `$${totalPagos.toFixed(2)}`;
    
    updateStatusChart(pending, paid, overdue);
}

function updateStatusChart(pending, paid, overdue) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    if (statusChart) statusChart.destroy();
    
    statusChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Pendientes', 'Pagadas', 'Vencidas'],
            datasets: [{
                data: [pending, paid, overdue],
                backgroundColor: ['rgba(255, 149, 0, 0.7)', 'rgba(52, 199, 89, 0.7)', 'rgba(255, 59, 48, 0.7)'],
                borderColor: ['rgba(255, 149, 0, 1)', 'rgba(52, 199, 89, 1)', 'rgba(255, 59, 48, 1)'],
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

function updateUpcomingList() {
    if (!upcomingList) return;
    
    upcomingList.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let upcomingItems = [];
    
    cobranzas.forEach(cobranza => {
        if (cobranza.estado === 'pagado' || calcularSaldoPendiente(cobranza) <= 0) return;
        
        const dueDate = new Date(cobranza.fechaVencimiento);
        dueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 7) {
            upcomingItems.push({
                type: 'cobranza',
                title: `Cobranza: ${cobranza.cliente}`,
                amount: `$${calcularSaldoPendiente(cobranza).toFixed(2)}`,
                days: diffDays,
                date: dueDate
            });
        }
    });
    
    proveedores.forEach(proveedor => {
        if (proveedor.estado === 'pagado' || calcularSaldoPendienteProveedor(proveedor) <= 0) return;
        
        const dueDate = new Date(proveedor.fechaVencimiento);
        dueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 7) {
            upcomingItems.push({
                type: 'proveedor',
                title: `Pago: ${proveedor.nombre}`,
                amount: `$${calcularSaldoPendienteProveedor(proveedor).toFixed(2)}`,
                days: diffDays,
                date: dueDate
            });
        }
    });
    
    upcomingItems.sort((a, b) => a.days - b.days);
    
    if (upcomingItems.length === 0) {
        upcomingList.innerHTML = `
            <div class="upcoming-item">
                <div class="upcoming-icon"><i class="fas fa-check-circle"></i></div>
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
        const icon = item.type === 'cobranza' ? 'fas fa-file-invoice-dollar' : 'fas fa-truck';
        const color = item.type === 'cobranza' ? 'var(--warning)' : 'var(--secondary)';
        
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

function updateRecentActivityUI() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivities = actividades
        .filter(activity => new Date(activity.fecha) >= twentyFourHoursAgo)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 10);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = `
            <li class="activity-item">
                <div class="activity-icon"><i class="fas fa-info-circle"></i></div>
                <div class="activity-content">
                    <div class="activity-title">Sin actividad reciente</div>
                    <div class="activity-time">Realiza alguna acción para ver actividades aquí</div>
                </div>
            </li>
        `;
        return;
    }
    
    recentActivities.forEach(activity => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        
        let icon = 'fas fa-info-circle';
        let color = 'var(--primary)';
        
        switch(activity.tipo) {
            case 'cobranza': icon = 'fas fa-file-invoice-dollar'; break;
            case 'abono': icon = 'fas fa-hand-holding-usd'; color = 'var(--success)'; break;
            case 'mensaje': icon = 'fas fa-envelope'; color = 'var(--warning)'; break;
            case 'pago': icon = 'fas fa-check-circle'; color = 'var(--success)'; break;
            case 'proveedor': icon = 'fas fa-truck'; color = 'var(--secondary)'; break;
            case 'pago_proveedor': icon = 'fas fa-money-bill-wave'; color = 'var(--success)'; break;
            case 'sistema': icon = 'fas fa-cog'; color = 'var(--gray)'; break;
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
}

// ============================================
// EXPORTACIÓN A EXCEL
// ============================================
document.getElementById('exportExcelBtn')?.addEventListener('click', function() {
    if (!requireAuth('exportar excel')) return;
    
    const data = cobranzas.map(cobranza => ({
        'Cliente': cobranza.cliente,
        'Teléfono': cobranza.telefono || '',
        'Monto Total': cobranza.monto,
        'Saldo Pendiente': calcularSaldoPendiente(cobranza),
        'Abonos': abonos.filter(a => a.cobranzaId === cobranza.id).length,
        'Estado': cobranza.estado,
        'Fecha Emisión': formatDate(cobranza.fechaEmision),
        'Fecha Vencimiento': formatDate(cobranza.fechaVencimiento),
        'Notas': cobranza.notas || ''
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Cobranzas');
    XLSX.writeFile(wb, 'cobranzas.xlsx');
});

document.getElementById('exportProveedoresBtn')?.addEventListener('click', function() {
    if (!requireAuth('exportar excel')) return;
    
    const data = proveedores.map(proveedor => ({
        'Proveedor': proveedor.nombre,
        'Contacto': proveedor.contacto || '',
        'Concepto': proveedor.concepto,
        'Monto Total': proveedor.monto,
        'Saldo Pendiente': calcularSaldoPendienteProveedor(proveedor),
        'Pagos': pagosProveedores.filter(p => p.proveedorId === proveedor.id).length,
        'Estado': proveedor.estado,
        'Fecha Emisión': formatDate(proveedor.fechaEmision),
        'Fecha Vencimiento': formatDate(proveedor.fechaVencimiento),
        'Notas': proveedor.notas || ''
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    XLSX.writeFile(wb, 'proveedores.xlsx');
});

console.log("✅ app.js cargado correctamente - Versión corregida");
