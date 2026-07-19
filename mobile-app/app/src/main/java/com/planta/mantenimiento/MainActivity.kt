package com.planta.mantenimiento

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.planta.mantenimiento.ui.navigation.AppNavigation
import com.planta.mantenimiento.ui.theme.MantenimientoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MantenimientoTheme {
                AppNavigation(context = this)
            }
        }
    }
}