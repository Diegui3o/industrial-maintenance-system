package com.planta.mantenimiento

import android.app.Application
import android.content.Intent
import android.net.VpnService
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.data.network.WireGuardVpnService
import kotlinx.coroutines.*
import java.net.URL

class MantenimientoApp : Application() {

    lateinit var preferencesManager: PreferencesManager
    var vpnConfig: String = ""

    override fun onCreate() {
        super.onCreate()

        preferencesManager = PreferencesManager(this)
        vpnConfig = preferencesManager.getVpnConfig()

        // Si ya tiene configuración, conectar automáticamente
        if (vpnConfig.isNotEmpty()) {
            startVpn(vpnConfig)
        }
    }

    fun fetchAndConnectVpn() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val baseUrl = preferencesManager.backendUrl
                val url = URL("${baseUrl}api/vpn/config")
                val config = url.readText()

                preferencesManager.saveVpnConfig(config)
                vpnConfig = config

                withContext(Dispatchers.Main) {
                    startVpn(config)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun startVpn(config: String) {
        val intent = Intent(this, WireGuardVpnService::class.java)
        intent.putExtra("config", config)
        startService(intent)
    }

    fun stopVpn() {
        val intent = Intent(this, WireGuardVpnService::class.java)
        intent.action = "STOP"
        startService(intent)
    }

    fun requestVpnPermission(activity: android.app.Activity): Boolean {
        val intent = VpnService.prepare(this)
        if (intent != null) {
            activity.startActivityForResult(intent, 100)
            return false
        }
        return true
    }
}