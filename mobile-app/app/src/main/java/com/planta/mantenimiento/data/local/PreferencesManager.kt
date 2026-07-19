package com.planta.mantenimiento.data.local

import android.content.Context
import android.content.SharedPreferences

class PreferencesManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)

    var backendUrl: String
        get() = prefs.getString("backend_url", "http://10.30.33:1880/") ?: "http://10.30.33:1880/"
        set(value) = prefs.edit().putString("backend_url", value).apply()

    var username: String
        get() = prefs.getString("username", "") ?: ""
        set(value) = prefs.edit().putString("username", value).apply()
}