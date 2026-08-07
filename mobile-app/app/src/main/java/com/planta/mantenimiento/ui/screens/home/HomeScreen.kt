package com.planta.mantenimiento.ui.screens.home

import android.content.Context
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.planta.mantenimiento.MantenimientoApp
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.ui.theme.AppColors
import androidx.compose.ui.platform.LocalContext

@Composable
fun HomeScreen(
    navController: NavController,
    onConnectVpn: () -> Unit = {}
) {
    val context = LocalContext.current
    val prefs = PreferencesManager(context)
    var showLanding by rememberSaveable { mutableStateOf(true) }

    val backgroundBrush = Brush.verticalGradient(
        colors = listOf(
            AppColors.BackgroundGradientTop,
            AppColors.BackgroundGradientMid,
            AppColors.BackgroundGradientBottom
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundBrush)
    ) {
        AnimatedContent(
            targetState = showLanding,
            transitionSpec = {
                fadeIn(animationSpec = tween(600)) togetherWith
                        fadeOut(animationSpec = tween(400))
            },
            label = "screen_transition"
        ) { isLanding ->
            if (isLanding) {
                LandingScreen(onEnter = { showLanding = false })
            } else {
                DashboardScreen(
                    navController = navController,
                    prefs = prefs,
                    onBackToLanding = { showLanding = true },
                    onConnectVpn = onConnectVpn
                )
            }
        }
    }
}