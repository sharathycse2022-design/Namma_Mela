package com.nammamela.app.model

data class Event(
    val id: Int,
    val title: String,
    val description: String,
    val time: String,
    val venue: String,
    val category: String,
    val imagePlaceholder: String = "🎭"
)
