package com.planta.mantenimiento.data.network

import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log
import com.planta.mantenimiento.MainActivity
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.InetSocketAddress
import java.nio.ByteBuffer
import java.nio.channels.DatagramChannel

class WireGuardVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private var channel: DatagramChannel? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == "STOP") {
            stopVpn()
            return START_NOT_STICKY
        }

        val configText = intent?.getStringExtra("config") ?: return START_NOT_STICKY
        startVpn(configText)
        return START_STICKY
    }

    private fun startVpn(configText: String) {
        try {
            val config = parseConfig(configText)

            val builder = Builder()
                .setSession("Mantenimiento VPN")
                .addAddress(config.address, 24)
                .addDnsServer("1.1.1.1")
                .addDnsServer("8.8.8.8")
                .addRoute("10.30.0.0", 16)
                .addRoute("10.188.0.0", 16)
                .setConfigureIntent(
                    PendingIntent.getActivity(
                        this, 0,
                        Intent(this, MainActivity::class.java),
                        PendingIntent.FLAG_IMMUTABLE
                    )
                )

            vpnInterface = builder.establish()
            Log.d("WireGuard", "VPN establecida: ${config.address}")
        } catch (e: Exception) {
            Log.e("WireGuard", "Error iniciando VPN", e)
        }
    }

    private fun stopVpn() {
        try {
            channel?.close()
            vpnInterface?.close()
        } catch (e: Exception) {
            Log.e("WireGuard", "Error deteniendo VPN", e)
        }
    }

    private fun parseConfig(text: String): Config {
        val lines = text.lines()
        var address = "10.0.0.2"
        var endpoint = ""
        var port = 51820

        for (line in lines) {
            when {
                line.startsWith("Address") -> {
                    address = line.split("=")[1].trim().split("/")[0]
                }
                line.startsWith("Endpoint") -> {
                    val ep = line.split("=")[1].trim()
                    val parts = ep.split(":")
                    endpoint = parts[0]
                    port = if (parts.size > 1) parts[1].toInt() else 51820
                }
            }
        }

        return Config(address, endpoint, port)
    }

    data class Config(
        val address: String,
        val endpoint: String,
        val port: Int
    )

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }
}