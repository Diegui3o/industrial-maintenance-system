package com.planta.mantenimiento

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import com.planta.mantenimiento.ui.navigation.AppNavigation
import com.planta.mantenimiento.ui.theme.MantenimientoTheme

class MainActivity : ComponentActivity() {

    private val vpnPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val app = application as MantenimientoApp
            app.fetchAndConnectVpn()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MantenimientoTheme {
                AppNavigation(
                    onConnectVpn = {
                        val app = application as MantenimientoApp
                        val intent = android.net.VpnService.prepare(this)

                        if (intent != null) {
                            vpnPermissionLauncher.launch(intent)
                        } else {
                            app.fetchAndConnectVpn()
                        }
                    }
                )
            }
        }
    }
}