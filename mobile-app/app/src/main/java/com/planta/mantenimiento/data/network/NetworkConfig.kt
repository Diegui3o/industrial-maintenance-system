package com.planta.mantenimiento.data.network

import com.planta.mantenimiento.data.local.PreferencesManager

class NetworkConfig(private val prefs: PreferencesManager) {
    val baseUrl get() = prefs.backendUrl

    fun updateUrl(virtualIp: String) {
        prefs.backendUrl = "http://$virtualIp:1883/api/"
    }
}