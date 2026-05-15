package com.nammamela.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = TheatricalGold,
    secondary = TheatricalIvory,
    tertiary = TheatricalDeepRed,
    background = TheatricalNavy,
    surface = CardBackground,
    onPrimary = TheatricalNavy,
    onSecondary = TheatricalNavy,
    onTertiary = TheatricalIvory,
    onBackground = TheatricalIvory,
    onSurface = TheatricalIvory
)

@Composable
fun NammaMelaTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
