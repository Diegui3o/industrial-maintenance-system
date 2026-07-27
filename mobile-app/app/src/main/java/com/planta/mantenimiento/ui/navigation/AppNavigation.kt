package com.planta.mantenimiento.ui.navigation

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.ui.screens.*
import com.planta.mantenimiento.ui.screens.home.HomeScreen

@Composable
fun AppNavigation(context: Context) {
    val navController = rememberNavController()
    val prefs = PreferencesManager(context)

    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(navController, prefs)
        }
        composable("equipos") {
            EquipoListScreen(navController = navController)
        }
        composable("mantenimientos") {
            MantenimientoListScreen(navController)
        }
        composable("mantenimiento/crear") {
            MantenimientoFormScreen(navController)
        }
        composable("settings") {
            SettingsScreen(navController = navController, prefs = prefs)
        }
    }
}