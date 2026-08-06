package com.planta.mantenimiento.ui.navigation

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.navigation.compose.*

import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.ui.screens.home.HomeScreen
import com.planta.mantenimiento.ui.screens.EquipoListScreen
import com.planta.mantenimiento.ui.screens.SettingsScreen

@Composable
fun AppNavigation(context: Context) {

    val navController = rememberNavController()
    val prefs = PreferencesManager(context)

    NavHost(navController, startDestination = "home") {

        composable("home") {
            HomeScreen(navController, prefs)
        }

        composable("equipos") {
            EquipoListScreen(navController)
        }

        composable("settings") {
            SettingsScreen(navController, prefs)
        }
    }
}