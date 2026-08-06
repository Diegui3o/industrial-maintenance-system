package com.planta.mantenimiento.ui.screens.home

import androidx.compose.ui.graphics.Color
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.ui.theme.AppColors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

data class HomeState(
    val isConnected: Boolean? = null,
    val isLoading: Boolean = false,
    val errorMessage: String = ""
) {
    val showError: Boolean get() = errorMessage.isNotEmpty()
    val statusText: String get() = when (isConnected) {
        true -> "Conectado"
        false -> "Offline"
        null -> "..."
    }
    val statusColor: Color get() = when (isConnected) {
        true -> AppColors.Success
        false -> AppColors.Error
        null -> AppColors.TextSecondary
    }
}

suspend fun checkServerConnection(prefs: PreferencesManager): Pair<Boolean, String> {
    return try {
        val urlStr = prefs.backendUrl + "api/equipos"
        val isOk = withContext(Dispatchers.IO) {
            val conn = URL(urlStr).openConnection() as HttpURLConnection
            conn.apply {
                connectTimeout = 5000
                readTimeout = 5000
                requestMethod = "GET"
                doInput = true
            }
            conn.responseCode == 200
        }
        Pair(isOk, if (isOk) "" else "No se pudo conectar con el servidor")
    } catch (e: Exception) {
        Pair(false, "Error de red: ${e.localizedMessage ?: "Desconocido"}")
    }
}