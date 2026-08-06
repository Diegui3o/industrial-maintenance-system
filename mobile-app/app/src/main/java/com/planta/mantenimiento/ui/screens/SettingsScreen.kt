package com.planta.mantenimiento.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.ui.theme.AppColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    navController: NavController,
    prefs: PreferencesManager
) {
    var ip by remember { mutableStateOf(prefs.backendUrl) }
    var username by remember { mutableStateOf(prefs.username) }
    var showSaved by remember { mutableStateOf(false) }

    val backgroundBrush = Brush.verticalGradient(
        colors = listOf(
            AppColors.BackgroundGradientTop,
            AppColors.BackgroundGradientMid,
            AppColors.BackgroundGradientBottom
        )
    )

    BackHandler {
        navController.navigate("home") {
            popUpTo("home") { inclusive = false }
            launchSingleTop = true
        }
    }

    Scaffold(
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Configuración",
                        color = AppColors.TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }
            )
        }
    ) { padding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(backgroundBrush)
                .padding(24.dp)
        ) {

            OutlinedTextField(
                value = ip,
                onValueChange = { ip = it },
                label = { Text("URL Backend") },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Usuario") },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    prefs.backendUrl = ip
                    prefs.username = username
                    showSaved = true
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Guardar")
            }

            AnimatedVisibility(visible = showSaved) {
                Text("✅ Guardado", color = Color.Green)
            }
        }
    }
}