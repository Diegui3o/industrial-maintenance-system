package com.planta.mantenimiento

import android.app.Application
import android.util.Log
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.data.network.RetrofitClient
import com.planta.mantenimiento.data.network.VpnApiService
import com.planta.mantenimiento.data.network.WireGuardManager
import kotlinx.coroutines.*

class MantenimientoApp : Application() {

    lateinit var preferencesManager: PreferencesManager
    lateinit var wireGuardManager: WireGuardManager

    override fun onCreate() {
        super.onCreate()

        preferencesManager = PreferencesManager(this)
        wireGuardManager = WireGuardManager(this)

        val savedConfig = preferencesManager.getVpnConfig()

        if (savedConfig.isNotEmpty()) {
            wireGuardManager.startTunnel(savedConfig)
        } else {
            fetchVpnConfig()
        }
    }

    private fun fetchVpnConfig() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val retrofit = RetrofitClient.get(preferencesManager)
                val api = retrofit.create(VpnApiService::class.java)

                val response = api.getConfig()
                val config = response.string()

                preferencesManager.saveVpnConfig(config)

                withContext(Dispatchers.Main) {
                    wireGuardManager.startTunnel(config)
                }

            } catch (e: Exception) {
                Log.e("VPN", "Error", e)
            }
        }
    }
}