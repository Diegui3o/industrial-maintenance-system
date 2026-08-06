package com.planta.mantenimiento.data.network

import android.content.Context
import com.wireguard.android.backend.GoBackend
import com.wireguard.android.backend.Tunnel
import com.wireguard.config.Config
import java.io.ByteArrayInputStream

class WireGuardManager(context: Context) {

    private val backend = GoBackend(context)
    private var tunnel: Tunnel? = null

    fun startTunnel(configText: String) {

        val inputStream = ByteArrayInputStream(configText.toByteArray())
        val config = Config.parse(inputStream)

        val newTunnel = object : Tunnel {
            override fun getName() = "maintenance"
            override fun onStateChange(newState: Tunnel.State) {}
        }

        backend.setState(newTunnel, Tunnel.State.UP, config)
        tunnel = newTunnel
    }

    fun stopTunnel() {
        tunnel?.let {
            backend.setState(it, Tunnel.State.DOWN, null)
        }
    }
}