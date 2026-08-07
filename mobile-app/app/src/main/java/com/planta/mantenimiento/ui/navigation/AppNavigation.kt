package com.planta.mantenimiento.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.ui.screens.*
import com.planta.mantenimiento.ui.screens.home.HomeScreen

@Composable
fun AppNavigation(onConnectVpn: () -> Unit = {}) {
    val navController = rememberNavController()
    val context = LocalContext.current
    val prefs = PreferencesManager(context)

    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(
                navController = navController,
                onConnectVpn = onConnectVpn
            )
        }
        composable("equipos") {
            EquipoListScreen(navController = navController)
        }
        composable("mantenimientos") {
            MantenimientoListScreen(navController = navController)
        }
        composable("mantenimiento/crear") {
            MantenimientoFormScreen(navController = navController)
        }
        composable("settings") {
            SettingsScreen(navController = navController, prefs = prefs)
        }
    }
}