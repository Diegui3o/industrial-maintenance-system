package com.planta.mantenimiento.data.local

import android.content.Context

class PreferencesManager(context: Context) {

    private val prefs = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)

    var backendUrl: String
        get() = prefs.getString("backend_url", "http://10.0.0.1:1880/")!!
        set(value) = prefs.edit().putString("backend_url", value).apply()
    var username: String
        get() = prefs.getString("username", "") ?: ""
        set(value) = prefs.edit().putString("username", value).apply()

    fun getVpnConfig(): String {
        return prefs.getString("vpn_config", "") ?: ""
    }

    fun saveVpnConfig(config: String) {
        prefs.edit().putString("vpn_config", config).apply()
    }
}