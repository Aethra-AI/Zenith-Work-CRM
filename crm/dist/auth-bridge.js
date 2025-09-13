// auth-bridge.js
// Este script permite la comunicación entre la landing page y la aplicación React

// Configuración
const API_BASE = 'https://34-136-149-39.sslip.io';

// Función para manejar el inicio de sesión desde la landing page
window.handleLandingLogin = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Por favor, ingresa el correo y la contraseña.');
    }
    
    console.log('Iniciando proceso de login para:', email);
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Error al procesar la respuesta del servidor:', e);
      throw new Error('Error en la respuesta del servidor. Inténtalo de nuevo.');
    }
    
    if (!response.ok) {
      console.error('Error en la respuesta del servidor:', response.status, responseData);
      const errorMessage = responseData.message || 
        (response.status === 401 ? 'Credenciales incorrectas' : 'Error en el servidor');
      throw new Error(errorMessage);
    }

    if (!responseData.accessToken) {
      console.error('Token de acceso no recibido en la respuesta');
      throw new Error('No se pudo completar el inicio de sesión. Inténtalo de nuevo.');
    }
    
    console.log('Inicio de sesión exitoso');
    
    // Almacenar los tokens y datos del usuario
    const expiresIn = (responseData.expiresIn || 3600) * 1000; // Default 1 hora
    const expiryTime = Date.now() + expiresIn;
    
    localStorage.setItem('crm_token', responseData.accessToken);
    localStorage.setItem('crm_refresh_token', responseData.refreshToken || '');
    localStorage.setItem('crm_token_expiry', expiryTime.toString());
    localStorage.setItem('crm_user', JSON.stringify(responseData.user || {}));
    
    return { 
      success: true,
      user: responseData.user
    };
    
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return { 
      success: false, 
      error: error.message || 'Error al conectar con el servidor. Por favor, verifica tu conexión.'
    };
  }
};

// Verificar si el usuario ya está autenticado
window.checkAuthStatus = () => {
  try {
    const token = localStorage.getItem('crm_token');
    const expiry = localStorage.getItem('crm_token_expiry');
    
    if (!token || !expiry) return { isAuthenticated: false };
    
    const isExpired = Date.now() > parseInt(expiry, 10);
    
    return {
      isAuthenticated: !isExpired,
      user: JSON.parse(localStorage.getItem('crm_user') || '{}'),
      isExpired
    };
    
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return { 
      isAuthenticated: false,
      isExpired: true
    };
  }
};

// Cerrar sesión
window.handleLogout = () => {
  localStorage.removeItem('crm_token');
  localStorage.removeItem('crm_refresh_token');
  localStorage.removeItem('crm_token_expiry');
  window.location.href = `${window.location.origin}/cardboard-master`;
};
